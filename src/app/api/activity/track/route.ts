import { NextResponse } from 'next/server';
import userActivityTracker from '@/lib/userActivity';

export async function POST(request: Request) {
  try {
    const { userId, userEmail, path, sessionId, deviceInfo, type, subtype, details, success, duration } = await request.json();

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Track the activity based on the type
    let result;
    
    if (type === 'page_view') {
      result = await userActivityTracker.trackPageView(
        userId,
        path,
        userEmail,
        sessionId,
        deviceInfo
      );
    } else if (type === 'authentication') {
      result = await userActivityTracker.trackAuthentication(
        userId,
        subtype,
        success,
        userEmail,
        deviceInfo
      );
    } else {
      // Generic activity tracking
      result = await userActivityTracker.trackActivity({
        userId,
        userEmail,
        type,
        subtype,
        path,
        sessionId,
        deviceInfo,
        success,
        duration,
        details
      });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Failed to track activity:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
} 