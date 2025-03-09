import { firestore } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, deleteDoc, writeBatch, doc, where, Timestamp, updateDoc } from 'firebase/firestore';
import notificationService, { NotificationChannel, NotificationPriority, NotificationType } from './notifications';

export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SECURITY = 'security'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: any; // FirebaseFirestore.Timestamp
  userId?: string;
  userEmail?: string;
  path?: string;
  userAgent?: string;
  ip?: string;
  metadata?: any;
  stack?: string;
}

// Retention periods in days
export enum RetentionPeriod {
  ONE_WEEK = 7,
  ONE_MONTH = 30,
  THREE_MONTHS = 90,
  SIX_MONTHS = 180,
  ONE_YEAR = 365,
  FOREVER = -1 // No automatic deletion
}

// Default retention periods by log level
const DEFAULT_RETENTION_PERIODS = {
  [LogLevel.INFO]: RetentionPeriod.ONE_MONTH,
  [LogLevel.WARNING]: RetentionPeriod.THREE_MONTHS,
  [LogLevel.ERROR]: RetentionPeriod.SIX_MONTHS,
  [LogLevel.SECURITY]: RetentionPeriod.ONE_YEAR
};

class Logger {
  private logsCollection = collection(firestore, 'systemLogs');
  private settingsCollection = collection(firestore, 'systemSettings');
  private retentionPeriods = { ...DEFAULT_RETENTION_PERIODS };
  
  constructor() {
    // Initialize with default retention periods
    this.loadRetentionSettings();
  }
  
  // Load retention settings from Firestore
  private async loadRetentionSettings() {
    try {
      const settingsQuery = query(this.settingsCollection, where('type', '==', 'retention'));
      const snapshot = await getDocs(settingsQuery);
      
      if (!snapshot.empty) {
        const settings = snapshot.docs[0].data();
        this.retentionPeriods = {
          ...DEFAULT_RETENTION_PERIODS,
          ...(settings.periods || {})
        };
      }
    } catch (error) {
      console.error('Failed to load retention settings:', error);
    }
  }
  
  // Get current retention settings
  async getRetentionSettings() {
    return { ...this.retentionPeriods };
  }
  
  // Update retention settings
  async updateRetentionSettings(periods: Partial<Record<LogLevel, RetentionPeriod>>, adminUserId: string) {
    try {
      // Log this administrative action
      await this.security(
        'Updated log retention settings',
        { periods },
        adminUserId,
        undefined,
        '/admin/logs/settings'
      );
      
      // Update the in-memory settings
      this.retentionPeriods = {
        ...this.retentionPeriods,
        ...periods
      };
      
      // Update in Firestore
      const settingsQuery = query(this.settingsCollection, where('type', '==', 'retention'));
      const snapshot = await getDocs(settingsQuery);
      
      if (snapshot.empty) {
        // Create new settings document
        await addDoc(this.settingsCollection, {
          type: 'retention',
          periods: this.retentionPeriods,
          updatedAt: serverTimestamp(),
          updatedBy: adminUserId
        });
      } else {
        // Update existing settings
        const settingsDoc = snapshot.docs[0];
        const settingsRef = doc(this.settingsCollection, settingsDoc.id);
        
        await updateDoc(settingsRef, {
          periods: this.retentionPeriods,
          updatedAt: serverTimestamp(),
          updatedBy: adminUserId
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update retention settings:', error);
      return { success: false, error };
    }
  }
  
  // Apply retention policy - typically called by a scheduled function
  async applyRetentionPolicy() {
    try {
      const batch = writeBatch(firestore);
      let deletedCount = 0;
      
      // Process each log level
      for (const level of Object.values(LogLevel)) {
        const retentionDays = this.retentionPeriods[level];
        
        // Skip if retention is set to FOREVER
        if (retentionDays === RetentionPeriod.FOREVER) continue;
        
        // Calculate the cutoff date
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        
        // Find logs older than the cutoff date
        const oldLogsQuery = query(
          this.logsCollection,
          where('level', '==', level),
          where('timestamp', '<', Timestamp.fromDate(cutoffDate)),
          limit(500) // Process in batches to avoid memory issues
        );
        
        const snapshot = await getDocs(oldLogsQuery);
        
        // Add delete operations to batch
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
          deletedCount++;
        });
      }
      
      // If we have logs to delete, commit the batch
      if (deletedCount > 0) {
        await batch.commit();
        
        // Log this event
        await this.info(
          `Applied retention policy: deleted ${deletedCount} logs`,
          { deletedCount }
        );
      }
      
      return { success: true, deletedCount };
    } catch (error) {
      console.error('Failed to apply retention policy:', error);
      
      // Attempt to log the error
      try {
        await this.error(
          'Failed to apply retention policy',
          error as Error
        );
      } catch (e) {
        // Ignore - we don't want to cause a cascading failure
      }
      
      return { success: false, error };
    }
  }
  
  // Archive logs before deletion (if needed)
  async archiveLogs(cutoffDate: Date, adminUserId: string) {
    try {
      // Find logs older than the cutoff date
      const oldLogsQuery = query(
        this.logsCollection,
        where('timestamp', '<', Timestamp.fromDate(cutoffDate)),
        limit(1000)
      );
      
      const snapshot = await getDocs(oldLogsQuery);
      
      if (snapshot.empty) {
        return { success: true, archivedCount: 0 };
      }
      
      // Convert logs to archive format
      const logsToArchive = snapshot.docs.map(doc => doc.data());
      
      // Create archive document
      const archiveDoc = {
        createdAt: serverTimestamp(),
        createdBy: adminUserId,
        logsCount: logsToArchive.length,
        archiveData: JSON.stringify(logsToArchive)
      };
      
      // Store in archives collection
      const archivesCollection = collection(firestore, 'logArchives');
      const docRef = await addDoc(archivesCollection, archiveDoc);
      
      // Log this administrative action
      await this.info(
        `Archived ${logsToArchive.length} logs`,
        { archiveId: docRef.id, logsCount: logsToArchive.length },
        adminUserId
      );
      
      return { success: true, archivedCount: logsToArchive.length, archiveId: docRef.id };
    } catch (error) {
      console.error('Failed to archive logs:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Log an informational message
   */
  async info(message: string, metadata?: any, userId?: string, userEmail?: string, path?: string, ip?: string, userAgent?: string) {
    return this.log(LogLevel.INFO, message, metadata, userId, userEmail, path);
  }
  
  /**
   * Log a warning message
   */
  async warning(message: string, metadata?: any, userId?: string, userEmail?: string, path?: string) {
    return this.log(LogLevel.WARNING, message, metadata, userId, userEmail, path);
  }
  
  /**
   * Log an error with notification triggers
   */
  async error(message: string, error?: Error, metadata?: any, userId?: string, userEmail?: string, path?: string, stack?: any) {
    const enhancedMetadata = {
      ...metadata,
      errorName: error?.name,
      errorMessage: error?.message,
    };
    
    // Log the error
    const logResult = await this.log(
      LogLevel.ERROR, 
      message, 
      enhancedMetadata, 
      userId, 
      userEmail, 
      path, 
      error?.stack
    );
    
    // Send notification for significant errors if notification service is available
    try {
      // Determine if this is significant enough to notify (can customize logic)
      const isSignificant = 
        error?.name === 'TypeError' || 
        error?.name === 'ReferenceError' ||
        (error?.stack && error.stack.includes('api/')) ||
        message.includes('failed') ||
        message.includes('critical');
      
      if (isSignificant && notificationService) {
        await notificationService.sendNotification(
          {
            type: NotificationType.ERROR_ALERT,
            title: `Error: ${message}`,
            message: `An error occurred: ${error?.message || message}`,
            priority: NotificationPriority.HIGH,
            data: {
              error: {
                name: error?.name,
                message: error?.message,
                stack: error?.stack
              },
              metadata: enhancedMetadata,
              userId,
              userEmail,
              path,
              logId: logResult
            }
          },
          [NotificationChannel.DATABASE, NotificationChannel.EMAIL]
        );
      }
    } catch (notifyError) {
      // Don't let notification failure affect logging
      console.error('Failed to send error notification:', notifyError);
    }
    
    return logResult;
  }
  
  /**
   * Log a security-related event with notification triggers
   */
  async security(message: string, metadata?: any, userId?: string, userEmail?: string, path?: string, ip?: string, userAgent?: string) {
    // Log the security event
    const logResult = await this.log(
      LogLevel.SECURITY, 
      message, 
      metadata, 
      userId, 
      userEmail, 
      path, 
      undefined, 
      ip, 
      userAgent
    );
    
    // Send notification for potential security issues
    try {
      // Determine if this is significant enough to notify (can customize logic)
      const isSignificant = 
        message.includes('attempt') ||
        message.includes('suspicious') ||
        message.includes('unauthorized') ||
        message.includes('attack') ||
        message.includes('injection') ||
        message.includes('exceeded');
        
      const priority = 
        message.includes('attack') || message.includes('injection')
          ? NotificationPriority.CRITICAL
          : NotificationPriority.HIGH;
      
      if (isSignificant && notificationService) {
        await notificationService.sendNotification(
          {
            type: NotificationType.SECURITY_ALERT,
            title: `Security Alert: ${message}`,
            message: `A security event was detected: ${message}`,
            priority,
            data: {
              metadata,
              userId,
              userEmail,
              path,
              ip,
              userAgent,
              logId: logResult
            }
          },
          [NotificationChannel.DATABASE, NotificationChannel.EMAIL]
        );
      }
    } catch (notifyError) {
      // Don't let notification failure affect logging
      console.error('Failed to send security notification:', notifyError);
    }
    
    return logResult;
  }
  
  /**
   * Core logging function
   */
  private async log(
    level: LogLevel, 
    message: string, 
    metadata?: any, 
    userId?: string, 
    userEmail?: string, 
    path?: string, 
    stack?: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      const logEntry: LogEntry = {
        level,
        message,
        timestamp: serverTimestamp(),
        userId,
        userEmail,
        path,
        ip,
        userAgent,
        metadata,
        stack
      };
      
      // Clean undefined/null values to keep logs clean
      Object.keys(logEntry).forEach(key => {
        if (logEntry[key as keyof LogEntry] === undefined) {
          delete logEntry[key as keyof LogEntry];
        }
      });
      
      const docRef = await addDoc(this.logsCollection, logEntry);
      console.log(`[${level.toUpperCase()}] ${message}`);
      
      return docRef.id;
    } catch (error) {
      // Fallback to console if Firebase logging fails
      console.error('Failed to write to log:', error);
      console.log(`[${level.toUpperCase()}] ${message}`, metadata);
      
      return null;
    }
  }
  
  /**
   * Get recent logs for a quick dashboard view
   */
  async getRecentLogs(count: number = 50, levelFilter?: LogLevel) {
    try {
      let logQuery = query(
        this.logsCollection,
        orderBy('timestamp', 'desc'),
        limit(count)
      );
      
      const snapshot = await getDocs(logQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return [];
    }
  }
  
  /**
   * Clear all logs from the system - USE WITH CAUTION
   * This is a destructive operation and should only be available to admins
   */
  async clearAllLogs(adminUserId: string) {
    try {
      // Log this critical operation first
      await this.security(
        'Clearing all system logs',
        { action: 'clear_all_logs' },
        adminUserId,
        undefined,
        '/admin/logs'
      );
      
      // Get all logs
      const logsRef = collection(firestore, 'systemLogs');
      const snapshot = await getDocs(logsRef);
      
      // Use batched writes for better performance and atomicity
      const batch = writeBatch(firestore);
      
      // Add each document to the batch
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Commit the batch
      await batch.commit();
      
      return { success: true, count: snapshot.docs.length };
    } catch (error) {
      console.error('Failed to clear logs:', error);
      return { success: false, error };
    }
  }
}

// Export a singleton instance
const logger = new Logger();
export default logger; 