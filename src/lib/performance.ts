import { firestore } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit as firestoreLimit, getDocs, where, Timestamp, doc, updateDoc } from 'firebase/firestore';
import logger, { LogLevel } from './logger';
import notificationService, { NotificationChannel, NotificationPriority, NotificationType } from './notifications';

// Define metric types
export enum MetricType {
  API_RESPONSE_TIME = 'api_response_time',
  PAGE_LOAD_TIME = 'page_load_time',
  FUNCTION_EXECUTION_TIME = 'function_execution_time',
  DATABASE_QUERY_TIME = 'database_query_time',
  RENDER_TIME = 'render_time',
  RESOURCE_USAGE = 'resource_usage'
}

// Performance metric interface
export interface PerformanceMetric {
  type: MetricType;
  name: string; // API endpoint, function name, etc.
  duration: number; // in milliseconds
  timestamp?: any; // Firestore timestamp
  metadata?: any; // Additional information
  userId?: string; // User ID if applicable
  path?: string; // Page path if applicable
  status?: number; // HTTP status code for API calls
  success?: boolean; // Whether the operation was successful
  size?: number; // Size in bytes if applicable
}

// Alert thresholds for different metrics
export interface MetricThresholds {
  [key: string]: {
    warning: number;
    critical: number;
  };
}

// Default thresholds (in milliseconds)
const DEFAULT_THRESHOLDS: MetricThresholds = {
  [MetricType.API_RESPONSE_TIME]: {
    warning: 1000, // 1 second
    critical: 3000 // 3 seconds
  },
  [MetricType.PAGE_LOAD_TIME]: {
    warning: 2000, // 2 seconds
    critical: 5000 // 5 seconds
  },
  [MetricType.FUNCTION_EXECUTION_TIME]: {
    warning: 500, // 500 ms
    critical: 2000 // 2 seconds
  },
  [MetricType.DATABASE_QUERY_TIME]: {
    warning: 300, // 300 ms
    critical: 1000 // 1 second
  },
  [MetricType.RENDER_TIME]: {
    warning: 100, // 100 ms
    critical: 500 // 500 ms
  }
};

interface MetricSummary {
  type: string;
  name: string;
  count: number;
  totalDuration: number;
  minDuration: number;
  maxDuration: number;
  avgDuration: number;
  successCount: number;
  failureCount: number;
}

class PerformanceMonitor {
  private metricsCollection = collection(firestore, 'performanceMetrics');
  private settingsCollection = collection(firestore, 'systemSettings');
  private thresholds: MetricThresholds = { ...DEFAULT_THRESHOLDS };
  
  constructor() {
    this.loadSettings();
  }
  
  // Load settings from Firestore
  private async loadSettings() {
    try {
      const settingsQuery = query(this.settingsCollection, where('type', '==', 'performanceThresholds'));
      const snapshot = await getDocs(settingsQuery);
      
      if (!snapshot.empty) {
        const settings = snapshot.docs[0].data();
        this.thresholds = {
          ...DEFAULT_THRESHOLDS,
          ...(settings.thresholds || {})
        };
      }
    } catch (error) {
      console.error('Failed to load performance settings:', error);
    }
  }
  
  /**
   * Record a performance metric
   */
  async recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>) {
    try {
      // Add timestamp
      const fullMetric = {
        ...metric,
        timestamp: serverTimestamp()
      };
      
      // Save metric to Firestore
      const docRef = await addDoc(this.metricsCollection, fullMetric);
      
      // Check if metric exceeds thresholds
      await this.checkThresholds(metric);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Failed to record performance metric:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Check if metric exceeds thresholds and send alerts if necessary
   */
  private async checkThresholds(metric: Omit<PerformanceMetric, 'timestamp'>) {
    try {
      // Get thresholds for this metric type
      const thresholds = this.thresholds[metric.type];
      
      if (!thresholds) return;
      
      // Check if metric exceeds thresholds
      if (metric.duration >= thresholds.critical) {
        // Log as error
        await logger.error(
          `Performance critical: ${metric.type} ${metric.name} took ${metric.duration}ms`,
          new Error('Performance threshold exceeded'),
          {
            metric,
            threshold: thresholds.critical
          },
          metric.userId
        );
        
        // Send notification
        if (notificationService) {
          await notificationService.sendNotification(
            {
              type: NotificationType.THRESHOLD_ALERT,
              title: 'Performance Critical Alert',
              message: `${metric.type} ${metric.name} took ${metric.duration}ms (threshold: ${thresholds.critical}ms)`,
              priority: NotificationPriority.HIGH,
              data: {
                metric,
                threshold: thresholds.critical
              }
            },
            [NotificationChannel.DATABASE, NotificationChannel.EMAIL]
          );
        }
      } else if (metric.duration >= thresholds.warning) {
        // Log as warning
        await logger.warning(
          `Performance warning: ${metric.type} ${metric.name} took ${metric.duration}ms`,
          {
            metric,
            threshold: thresholds.warning
          },
          metric.userId
        );
        
        // Optionally send notification
        // Disabled by default to avoid notification fatigue
      }
    } catch (error) {
      console.error('Failed to check performance thresholds:', error);
    }
  }
  
  /**
   * Create a function wrapper that measures execution time
   */
  measureFunction<T extends (...args: any[]) => Promise<any>>(
    functionName: string, 
    fn: T, 
    metadataFn?: (args: Parameters<T>, result: Awaited<ReturnType<T>>) => any
  ): T {
    return (async (...args: Parameters<T>) => {
      const startTime = performance.now();
      let success = true;
      let result;
      
      try {
        result = await fn(...args);
        return result;
      } catch (error) {
        success = false;
        throw error;
      } finally {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        let metadata = {};
        
        if (metadataFn) {
          try {
            metadata = metadataFn(args, result);
          } catch (error) {
            console.error('Error generating metadata for performance metric:', error);
          }
        }
        
        this.recordMetric({
          type: MetricType.FUNCTION_EXECUTION_TIME,
          name: functionName,
          duration,
          success,
          metadata
        }).catch(error => {
          console.error('Failed to record function performance metric:', error);
        });
      }
    }) as T;
  }
  
  /**
   * Measure API response time
   */
  async measureApiResponse(
    apiName: string,
    requestFn: () => Promise<Response>,
    userId?: string,
    path?: string
  ) {
    const startTime = performance.now();
    let response: Response | null = null;
    let success = false;
    let error: any = null;
    
    try {
      response = await requestFn();
      success = response.ok;
      return response;
    } catch (err) {
      error = err;
      throw err;
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric({
        type: MetricType.API_RESPONSE_TIME,
        name: apiName,
        duration,
        success,
        status: response?.status,
        userId,
        path,
        metadata: {
          statusText: response?.statusText,
          error: error ? {
            message: error.message,
            name: error.name
          } : undefined
        }
      }).catch(metricError => {
        console.error('Failed to record API performance metric:', metricError);
      });
    }
  }
  
  /**
   * Get performance metrics for analysis
   */
  async getMetrics(
    metricType?: MetricType,
    startDate?: Date,
    endDate?: Date,
    maxResults: number = 100
  ) {
    try {
      // Build query
      let metricsQuery = query(
        this.metricsCollection,
        orderBy('timestamp', 'desc')
      );
      
      // Filter by metric type if specified
      if (metricType) {
        metricsQuery = query(
          metricsQuery,
          where('type', '==', metricType)
        );
      }
      
      // Filter by date range if specified
      if (startDate) {
        const startTimestamp = Timestamp.fromDate(startDate);
        metricsQuery = query(
          metricsQuery,
          where('timestamp', '>=', startTimestamp)
        );
      }
      
      if (endDate) {
        const endTimestamp = Timestamp.fromDate(endDate);
        metricsQuery = query(
          metricsQuery,
          where('timestamp', '<=', endTimestamp)
        );
      }
     
      // Apply limit
      metricsQuery = query(metricsQuery, firestoreLimit(maxResults));

      // Execute query
      const snapshot = await getDocs(metricsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return [];
    }
  }
  
  /**
   * Get performance summary statistics
   */
  async getPerformanceSummary(days: number = 7) {
    try {
      // Calculate start date
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startTimestamp = Timestamp.fromDate(startDate);
      
      // Get metrics for the period
      const metricsQuery = query(
        this.metricsCollection,
        where('timestamp', '>=', startTimestamp),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(metricsQuery);
      
      // Group by type and name
      const metrics = snapshot.docs.map(doc => doc.data() as PerformanceMetric);
      const groupedMetrics: Record<string, MetricSummary> = {};
      
      metrics.forEach(metric => {
        const key = `${metric.type}_${metric.name}`;
        
        if (!groupedMetrics[key]) {
          groupedMetrics[key] = {
            type: metric.type,
            name: metric.name,
            count: 0,
            totalDuration: 0,
            minDuration: Infinity,
            maxDuration: 0,
            avgDuration: 0,
            successCount: 0,
            failureCount: 0
          };
        }
        
        groupedMetrics[key].count++;
        groupedMetrics[key].totalDuration += metric.duration;
        groupedMetrics[key].minDuration = Math.min(groupedMetrics[key].minDuration, metric.duration);
        groupedMetrics[key].maxDuration = Math.max(groupedMetrics[key].maxDuration, metric.duration);
        
        if (metric.success) {
          groupedMetrics[key].successCount++;
        } else if (metric.success === false) {
          groupedMetrics[key].failureCount++;
        }
      });
      
      // Calculate averages
      Object.values(groupedMetrics).forEach((group: MetricSummary) => {
        group.avgDuration = group.totalDuration / group.count;
      });
      
      return Object.values(groupedMetrics);
    } catch (error) {
      console.error('Failed to get performance summary:', error);
      return [];
    }
  }
  
  /**
   * Update performance thresholds
   */
  async updateThresholds(newThresholds: Partial<MetricThresholds>, adminUserId: string) {
    try {
      // Update in-memory thresholds
      this.thresholds = {
        ...this.thresholds,
        ...newThresholds
      } as MetricThresholds;
      // Update in Firestore
      const settingsQuery = query(this.settingsCollection, where('type', '==', 'performanceThresholds'));
      const snapshot = await getDocs(settingsQuery);
      
      if (snapshot.empty) {
        // Create new settings document
        await addDoc(this.settingsCollection, {
          type: 'performanceThresholds',
          thresholds: this.thresholds,
          updatedAt: serverTimestamp(),
          updatedBy: adminUserId
        });
      } else {
        // Update existing settings
        const settingsDoc = snapshot.docs[0];
        const settingsRef = doc(this.settingsCollection, settingsDoc.id);
        
        await updateDoc(settingsRef, {
          thresholds: this.thresholds,
          updatedAt: serverTimestamp(),
          updatedBy: adminUserId
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update performance thresholds:', error);
      return { success: false, error };
    }
  }
}

// Export a singleton instance
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor; 
