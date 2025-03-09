"use client";

import React from 'react';
import { X } from 'lucide-react';
import { LogLevel } from '@/lib/logger';

interface LogDetailModalProps {
  log: any;
  isOpen: boolean;
  onClose: () => void;
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({
  log,
  isOpen,
  onClose
}) => {
  if (!isOpen || !log) return null;
  
  // Format timestamp
  const formattedTimestamp = log.timestamp?.toDate 
    ? log.timestamp.toDate().toLocaleString() 
    : 'Unknown';
    
  // Get background color based on log level
  const getBgColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.INFO:
        return 'bg-blue-50 border-blue-200';
      case LogLevel.WARNING:
        return 'bg-yellow-50 border-yellow-200';
      case LogLevel.ERROR:
        return 'bg-red-50 border-red-200';
      case LogLevel.SECURITY:
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Log Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Basic info */}
        <div className={`p-6 ${getBgColor(log.level)}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Level</p>
              <p className="font-semibold capitalize">{log.level}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Timestamp</p>
              <p className="font-semibold">{formattedTimestamp}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Message</p>
              <p className="font-semibold">{log.message}</p>
            </div>
            {log.userId && (
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium font-mono text-sm break-all">{log.userId}</p>
              </div>
            )}
            {log.userEmail && (
              <div>
                <p className="text-sm text-gray-500">User Email</p>
                <p className="font-medium">{log.userEmail}</p>
              </div>
            )}
            {log.path && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Path</p>
                <p className="font-medium">{log.path}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Detailed info */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: '40vh' }}>
          {/* IP & User Agent (Security logs) */}
          {(log.ip || log.userAgent) && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">Request Information</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                {log.ip && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-500">IP Address</p>
                    <p className="font-medium font-mono">{log.ip}</p>
                  </div>
                )}
                {log.userAgent && (
                  <div>
                    <p className="text-sm text-gray-500">User Agent</p>
                    <p className="text-sm font-mono break-all">{log.userAgent}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">Metadata</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {/* Stack Trace (Error logs) */}
          {log.stack && (
            <div>
              <h3 className="text-md font-semibold mb-2">Stack Trace</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto">
                <pre className="text-sm font-mono whitespace-pre">
                  {log.stack}
                </pre>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal; 