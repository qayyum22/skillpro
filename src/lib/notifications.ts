import { LogLevel } from './logger';
import { firestore } from './firebase';
import { collection, addDoc, getDocs, query, where, limit, orderBy, serverTimestamp, updateDoc, doc, writeBatch } from 'firebase/firestore';

// Define notification channels
export enum NotificationChannel {
  EMAIL = 'email',
  DATABASE = 'database' // Stored in Firestore for in-app notifications
}

// Define notification types
export enum NotificationType {
  ERROR_ALERT = 'error_alert',
  SECURITY_ALERT = 'security_alert',
  THRESHOLD_ALERT = 'threshold_alert',
  SYSTEM_EVENT = 'system_event'
}

// Notification priority
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Notification interface
export interface Notification {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: any; // Firestore timestamp
  seen?: boolean;
  data?: any; // Additional data like log ID, user ID, etc.
}

// Email notification settings
export interface EmailSettings {
  enabled: boolean;
  recipients: string[];
  minPriority: NotificationPriority;
}

// Notification settings interface
export interface NotificationSettings {
  email: EmailSettings;
  errorAlerts: boolean;
  securityAlerts: boolean;
  thresholdAlerts: boolean;
  systemEvents: boolean;
}

// Default notification settings
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: {
    enabled: true,
    recipients: ['admin@testprephaven.com'],
    minPriority: NotificationPriority.HIGH
  },
  errorAlerts: true,
  securityAlerts: true,
  thresholdAlerts: true,
  systemEvents: false
};

class NotificationService {
  private settingsCollection = collection(firestore, 'systemSettings');
  private notificationsCollection = collection(firestore, 'systemNotifications');
  private settings: NotificationSettings = { ...DEFAULT_NOTIFICATION_SETTINGS };
  
  constructor() {
    this.loadSettings();
  }
  
  // Load notification settings from Firestore
  private async loadSettings() {
    try {
      const settingsQuery = query(this.settingsCollection, where('type', '==', 'notifications'));
      const snapshot = await getDocs(settingsQuery);
      
      if (!snapshot.empty) {
        const settings = snapshot.docs[0].data();
        this.settings = {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...(settings.data || {})
        };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }
  
  // Get current notification settings
  async getSettings(): Promise<NotificationSettings> {
    return { ...this.settings };
  }
  
  // Update notification settings
  async updateSettings(newSettings: Partial<NotificationSettings>, adminUserId: string) {
    try {
      this.settings = {
        ...this.settings,
        ...newSettings
      };
      
      const settingsQuery = query(this.settingsCollection, where('type', '==', 'notifications'));
      const snapshot = await getDocs(settingsQuery);
      
      if (snapshot.empty) {
        // Create new settings document
        await addDoc(this.settingsCollection, {
          type: 'notifications',
          data: this.settings,
          updatedAt: serverTimestamp(),
          updatedBy: adminUserId
        });
      } else {
        // Update existing settings
        const settingsDoc = snapshot.docs[0];
        const settingsRef = doc(this.settingsCollection, settingsDoc.id);
        
        await updateDoc(settingsRef, {
          data: this.settings,
          updatedAt: serverTimestamp(),
          updatedBy: adminUserId
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      return { success: false, error };
    }
  }
  
  // Send a notification through specified channels
  async sendNotification(
    notification: Omit<Notification, 'timestamp' | 'seen'>,
    channels: NotificationChannel[] = [NotificationChannel.DATABASE]
  ) {
    try {
      const fullNotification: Notification = {
        ...notification,
        timestamp: serverTimestamp(),
        seen: false
      };
      
      // Store notification in database
      if (channels.includes(NotificationChannel.DATABASE)) {
        await this.storeNotification(fullNotification);
      }
      
      // Send email notification if enabled and priority is high enough
      if (
        channels.includes(NotificationChannel.EMAIL) &&
        this.settings.email.enabled &&
        this.getPriorityLevel(notification.priority) >= 
        this.getPriorityLevel(this.settings.email.minPriority)
      ) {
        await this.sendEmailNotification(fullNotification);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to send notification:', error);
      return { success: false, error };
    }
  }
  
  // Store notification in database
  private async storeNotification(notification: Notification) {
    try {
      return await addDoc(this.notificationsCollection, notification);
    } catch (error) {
      console.error('Failed to store notification:', error);
      throw error;
    }
  }
  
  // Send email notification
  private async sendEmailNotification(notification: Notification) {
    try {
      // Priority indicator for email subject
      const priorityPrefix = notification.priority === NotificationPriority.CRITICAL 
        ? '🚨 CRITICAL: ' 
        : notification.priority === NotificationPriority.HIGH 
          ? '⚠️ ALERT: ' 
          : '';
      
      // Prepare email content
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${this.getPriorityColor(notification.priority)}; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">${notification.title}</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Priority: ${notification.priority.toUpperCase()}</p>
          </div>
          <div style="border: 1px solid #ddd; border-top: none; padding: 15px; border-radius: 0 0 5px 5px;">
            <p>${notification.message}</p>
            ${notification.data ? `
              <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; margin-top: 15px;">
                <h3 style="margin-top: 0; font-size: 16px;">Additional Information</h3>
                <pre style="margin: 0; white-space: pre-wrap;">${JSON.stringify(notification.data, null, 2)}</pre>
              </div>
            ` : ''}
            <p style="font-size: 12px; color: #777; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
              This is an automated message from the TestPrepHaven system. Do not reply to this email.
            </p>
          </div>
        </div>
      `;
      
      const emailText = `
        ${notification.title}
        Priority: ${notification.priority.toUpperCase()}
        
        ${notification.message}
        
        ${notification.data ? `Additional Information:\n${JSON.stringify(notification.data, null, 2)}` : ''}
        
        This is an automated message from the TestPrepHaven system. Do not reply to this email.
      `;
      
      // Use the API route to send the email
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.settings.email.recipients.join(','),
          subject: `${priorityPrefix}${notification.title}`,
          html: emailHtml,
          text: emailText,
          priority: notification.priority
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }
      
      return result;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      throw error;
    }
  }
  
  // Get all notifications
  async getNotifications(maxResults: number = 50, unseenOnly: boolean = false) {
    try {
      let notificationsQuery = query(
        this.notificationsCollection,
        orderBy('timestamp', 'desc')
      );
      
      if (unseenOnly) {
        notificationsQuery = query(
          notificationsQuery,
          where('seen', '==', false)
        );
      }
      
      notificationsQuery = query(notificationsQuery, limit(maxResults));
      
      const snapshot = await getDocs(notificationsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }
  
  // Mark notification as seen
  async markAsSeen(notificationId: string) {
    try {
      const notificationRef = doc(this.notificationsCollection, notificationId);
      await updateDoc(notificationRef, { seen: true });
      return { success: true };
    } catch (error) {
      console.error('Failed to mark notification as seen:', error);
      return { success: false, error };
    }
  }
  
  // Mark all notifications as seen
  async markAllAsSeen() {
    try {
      const unseenQuery = query(
        this.notificationsCollection,
        where('seen', '==', false),
        limit(100) // Process in batches
      );
      
      const snapshot = await getDocs(unseenQuery);
      
      if (snapshot.empty) {
        return { success: true, count: 0 };
      }
      
      const batch = writeBatch(firestore);
      
      snapshot.docs.forEach(doc => {
        const notificationRef = doc.ref;
        batch.update(notificationRef, { seen: true });
      });
      
      await batch.commit();
      
      return { success: true, count: snapshot.docs.length };
    } catch (error) {
      console.error('Failed to mark all notifications as seen:', error);
      return { success: false, error };
    }
  }
  
  // Helper method to get priority level as number for comparison
  private getPriorityLevel(priority: NotificationPriority): number {
    switch (priority) {
      case NotificationPriority.CRITICAL:
        return 4;
      case NotificationPriority.HIGH:
        return 3;
      case NotificationPriority.MEDIUM:
        return 2;
      case NotificationPriority.LOW:
        return 1;
      default:
        return 0;
    }
  }
  
  // Helper method to get color for priority
  private getPriorityColor(priority: NotificationPriority): string {
    switch (priority) {
      case NotificationPriority.CRITICAL:
        return '#DC2626'; // Red
      case NotificationPriority.HIGH:
        return '#EA580C'; // Orange
      case NotificationPriority.MEDIUM:
        return '#D97706'; // Amber
      case NotificationPriority.LOW:
        return '#0284C7'; // Blue
      default:
        return '#4B5563'; // Gray
    }
  }
}

// Export a singleton instance
const notificationService = new NotificationService();
export default notificationService; 