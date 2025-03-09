"use client";

import React, { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
// Import only what's needed from userActivity
import { ActivityType } from "@/lib/userActivity";
import { nanoid } from "nanoid";

// Get or create session ID
function getSessionId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = nanoid();
      localStorage.setItem("session_id", sessionId);
    }
    return sessionId;
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
}

// Parse user agent to get device info
function getDeviceInfo(): Record<string, string | boolean> | null {
  if (typeof window === "undefined") return null;

  try {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    const browser = /Chrome/.test(userAgent)
      ? "Chrome"
      : /Safari/.test(userAgent)
      ? "Safari"
      : /Firefox/.test(userAgent)
      ? "Firefox"
      : /MSIE|Trident/.test(userAgent)
      ? "IE"
      : /Edge/.test(userAgent)
      ? "Edge"
      : "Unknown";

    const os = /Win/.test(userAgent)
      ? "Windows"
      : /Mac/.test(userAgent)
      ? "macOS"
      : /Linux/.test(userAgent)
      ? "Linux"
      : /Android/.test(userAgent)
      ? "Android"
      : /iPhone|iPad|iPod/.test(userAgent)
      ? "iOS"
      : "Unknown";

    return {
      userAgent,
      os,
      browser,
      mobile: isMobile,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
    };
  } catch (error) {
    console.error("Error detecting device info:", error);
    return null;
  }
}

// Define Props Interface
interface UserActivityMiddlewareProps {
  children: ReactNode;
}

// Middleware component for tracking user activity
export function UserActivityMiddleware({ children }: UserActivityMiddlewareProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/_next/") || pathname.includes("/static/") || pathname === "/api/health") {
      return;
    }

    if (user?.uid) {
      const sessionId = getSessionId();
      const deviceInfo = getDeviceInfo();

      // Use fetch to call an API endpoint instead of directly using userActivityTracker
      fetch('/api/activity/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email || undefined,
          path: pathname,
          sessionId: sessionId || undefined,
          deviceInfo: deviceInfo || undefined,
          type: ActivityType.PAGE_VIEW
        }),
      }).catch((error) => {
        console.error("Failed to track page view:", error);
      });
    }
  }, [pathname, user]);

  return <>{children}</>;
}

// Higher Order Component for wrapping pages
export function withUserActivityTracking<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <UserActivityMiddleware>
      <Component {...props} />
    </UserActivityMiddleware>
  );

  return WrappedComponent;
} 