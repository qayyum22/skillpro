"use client";
import React, { useState, useEffect } from 'react';

interface TimerProps {
  initialSeconds: number;
  isRunning: boolean;
  onEnd: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, isRunning, onEnd }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  
  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            if (interval) clearInterval(interval);
            onEnd();
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, seconds, onEnd]);
  
  // Format seconds into MM:SS
  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Determine color based on time remaining
  const getTimerColor = () => {
    if (seconds < 60) return 'text-red-500'; // Less than 1 minute
    if (seconds < 300) return 'text-yellow-500'; // Less than 5 minutes
    return 'text-green-500';
  };
  
  return (
    <div className={`font-mono text-lg ${getTimerColor()}`}>
      {formatTime()}
    </div>
  );
};

export default Timer; 