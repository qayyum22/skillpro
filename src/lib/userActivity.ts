import { firestore } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit as firestoreLimit, getDocs, where, Timestamp } from 'firebase/firestore';
import logger from './logger';

// Define activity types
export enum ActivityType {
  PAGE_VIEW = 'page_view',
  AUTHENTICATION = 'authentication',
  COURSE_INTERACTION = 'course_interaction',
  TEST_ATTEMPT = 'test_attempt',
  USER_PREFERENCE = 'user_preference',
  ASSESSMENT_COMPLETION = 'assessment_completion',
  CONTENT_ACCESS = 'content_access',
  FEATURE_USAGE = 'feature_usage'
}

// Define authentication subtypes
export enum AuthSubtype {
  SIGN_IN = 'sign_in',
  SIGN_OUT = 'sign_out',
  SIGN_UP = 'sign_up',
  PASSWORD_RESET = 'password_reset',
  PROFILE_UPDATE = 'profile_update'
}

// Define activity details interface
export interface ActivityDetails {
  // Core metadata
  userId: string;
  userEmail?: string;
  timestamp?: any; // Firestore timestamp
  sessionId?: string;
  deviceInfo?: {
    userAgent?: string;
    os?: string;
    browser?: string;
    mobile?: boolean;
    screenSize?: string;
  };
  locationInfo?: {
    ip?: string;
    country?: string;
    region?: string;
    city?: string;
  };
  
  // Activity-specific data
  type: ActivityType;
  subtype?: string;
  path?: string;
  duration?: number; // in seconds
  success?: boolean;
  details?: any; // Additional activity-specific details
}

class UserActivityTracker {
  private activitiesCollection = collection(firestore, 'userActivities');
  
  /**
   * Log a user activity
   */
  async trackActivity(activity: Omit<ActivityDetails, 'timestamp'>) {
    try {
      // Add timestamp
      const fullActivity = {
        ...activity,
        timestamp: serverTimestamp()
      };
      
      // Store in Firestore
      await addDoc(this.activitiesCollection, fullActivity);
      
      // Log unusual activities
      if (
        (activity.type === ActivityType.AUTHENTICATION && activity.success === false) ||
        (activity.details?.unusual === true)
      ) {
        await logger.warning(
          `Unusual user activity: ${activity.type} - ${activity.subtype || 'N/A'}`,
          {
            activityType: activity.type,
            activitySubtype: activity.subtype,
            details: activity.details
          },
          activity.userId,
          activity.userEmail,
          activity.path
        );
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to track user activity:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Track page view
   */
  async trackPageView(userId: string, path: string, userEmail?: string, sessionId?: string, deviceInfo?: ActivityDetails['deviceInfo']) {
    return this.trackActivity({
      userId,
      userEmail,
      sessionId,
      deviceInfo,
      type: ActivityType.PAGE_VIEW,
      path
    });
  }
  
  /**
   * Track authentication event
   */
  async trackAuthentication(userId: string, subtype: AuthSubtype, success: boolean, userEmail?: string, deviceInfo?: ActivityDetails['deviceInfo'], locationInfo?: ActivityDetails['locationInfo'], details?: any) {
    return this.trackActivity({
      userId,
      userEmail,
      deviceInfo,
      locationInfo,
      type: ActivityType.AUTHENTICATION,
      subtype,
      success,
      details
    });
  }
  
  /**
   * Track course interaction
   */
  async trackCourseInteraction(userId: string, courseId: string, action: string, userEmail?: string, path?: string, details?: any) {
    return this.trackActivity({
      userId,
      userEmail,
      type: ActivityType.COURSE_INTERACTION,
      subtype: action,
      path,
      details: {
        courseId,
        ...details
      }
    });
  }
  
  /**
   * Track test attempt
   */
  async trackTestAttempt(userId: string, testId: string, score: number, duration: number, userEmail?: string, details?: any) {
    return this.trackActivity({
      userId,
      userEmail,
      type: ActivityType.TEST_ATTEMPT,
      duration,
      details: {
        testId,
        score,
        ...details
      }
    });
  }
  
  /**
   * Get user activity history
   */
  async getUserActivity(userId: string, maxResults: number = 50, activityType?: ActivityType) {
    try {
      let activityQuery = query(
        this.activitiesCollection,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      if (activityType) {
        activityQuery = query(
          activityQuery,
          where('type', '==', activityType)
        );
      }
      
      activityQuery = query(activityQuery, firestoreLimit(maxResults));
      
      const snapshot = await getDocs(activityQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get user activity:', error);
      return [];
    }
  }
  
  /**
   * Get activity trends for a period
   */
  async getActivityTrends(days: number = 30, activityType?: ActivityType) {
    try {
      // Calculate start date
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startTimestamp = Timestamp.fromDate(startDate);
      
      // Build query
      let trendsQuery = query(
        this.activitiesCollection,
        where('timestamp', '>=', startTimestamp),
        orderBy('timestamp', 'asc')
      );
      
      if (activityType) {
        trendsQuery = query(
          trendsQuery,
          where('type', '==', activityType)
        );
      }
      
      const snapshot = await getDocs(trendsQuery);
      
      // Group by day
      const trends: Record<string, any> = {};
      
      snapshot.docs.forEach(doc => {
        const activity = doc.data();
        const timestamp = activity.timestamp?.toDate();
        
        if (timestamp) {
          const dateKey = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
          
          if (!trends[dateKey]) {
            trends[dateKey] = {
              date: dateKey,
              count: 0,
              byType: {}
            };
          }
          
          trends[dateKey].count++;
          
          // Count by type
          const type = activity.type;
          if (!trends[dateKey].byType[type]) {
            trends[dateKey].byType[type] = 0;
          }
          trends[dateKey].byType[type]++;
        }
      });
      
      // Convert to array and sort by date
      return Object.values(trends).sort((a: any, b: any) => 
        a.date.localeCompare(b.date)
      );
    } catch (error) {
      console.error('Failed to get activity trends:', error);
      return [];
    }
  }
  
  /**
   * Get user session data
   */
  async getUserSessions(userId: string, days: number = 7) {
    try {
      // Calculate start date
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startTimestamp = Timestamp.fromDate(startDate);
      
      // Get authentication events
      const authQuery = query(
        this.activitiesCollection,
        where('userId', '==', userId),
        where('type', '==', ActivityType.AUTHENTICATION),
        where('timestamp', '>=', startTimestamp),
        orderBy('timestamp', 'desc')
      );
      
      const authSnapshot = await getDocs(authQuery);
      
      // Get page views
      const pageViewQuery = query(
        this.activitiesCollection,
        where('userId', '==', userId),
        where('type', '==', ActivityType.PAGE_VIEW),
        where('timestamp', '>=', startTimestamp),
        orderBy('timestamp', 'desc')
      );
      
      const pageViewSnapshot = await getDocs(pageViewQuery);
      
      // Combine and process data
      const sessions: any[] = [];
      const pageViews = pageViewSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      
      // Group page views into sessions (30 min inactivity = new session)
      let currentSession: any = null;
      const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      // Sort by timestamp
      pageViews.sort((a, b) => a.timestamp - b.timestamp);
      
      pageViews.forEach(view => {
        // If no current session or timeout exceeded, start new session
        if (!currentSession || (view.timestamp - currentSession.lastActivity) > SESSION_TIMEOUT) {
          if (currentSession) {
            // Calculate session duration before pushing
            currentSession.duration = 
              (currentSession.lastActivity - currentSession.startTime) / 1000; // in seconds
            sessions.push(currentSession);
          }
          
          // Start new session
          currentSession = {
            startTime: view.timestamp,
            lastActivity: view.timestamp,
            pageViews: [view],
            pageCount: 1
          };
        } else {
          // Add to current session
          currentSession.pageViews.push(view);
          currentSession.pageCount++;
          currentSession.lastActivity = view.timestamp;
        }
      });
      
      // Don't forget to add the last session
      if (currentSession) {
        currentSession.duration = 
          (currentSession.lastActivity - currentSession.startTime) / 1000; // in seconds
        sessions.push(currentSession);
      }
      
      return {
        sessions,
        totalSessions: sessions.length,
        averageSessionDuration: sessions.length > 0 
          ? sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / sessions.length
          : 0,
        averagePageViews: sessions.length > 0
          ? sessions.reduce((sum, session) => sum + (session.pageCount || 0), 0) / sessions.length
          : 0
      };
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return { sessions: [], totalSessions: 0, averageSessionDuration: 0, averagePageViews: 0 };
    }
  }
}

// Export a singleton instance
const userActivityTracker = new UserActivityTracker();
export default userActivityTracker;