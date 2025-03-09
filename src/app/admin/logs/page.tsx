"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import logger, { LogLevel } from '@/lib/logger';
import { collection, query, orderBy, limit, getDocs, where, startAfter, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { AlertTriangle, Info, Shield, AlertCircle, ChevronLeft, ChevronRight, Filter, RefreshCw, Search, Database, Trash2, Download } from 'lucide-react';
import { generateDistributedSampleLogs } from '@/lib/sampleLogData';
import { toast } from 'react-hot-toast';
import LogDetailModal from './LogDetailModal';
import ExportModal from './ExportModal';

interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: Timestamp;
  userId?: string;
  userEmail?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  metadata?: any;
  stack?: string;
}

const LogsPage = () => {
  const { user, loading } = useAuth(true); // requireAdmin=true
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<LogLevel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 25;
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [firstVisible, setFirstVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isGeneratingLogs, setIsGeneratingLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const fetchLogs = async (direction: 'next' | 'prev' = 'next') => {
    if (loading || !user) return;
    
    setIsLoading(true);
    try {
      const logsRef = collection(firestore, 'systemLogs');
      let baseQuery = query(logsRef, orderBy('timestamp', 'desc'));
      
      // Apply filters
      if (filterLevel) {
        baseQuery = query(baseQuery, where('level', '==', filterLevel));
      }
      
      // Apply pagination
      if (direction === 'next' && lastVisible) {
        baseQuery = query(baseQuery, startAfter(lastVisible), limit(logsPerPage));
      } else if (direction === 'prev' && firstVisible) {
        // For previous page, we'd typically need to use a more complex approach
        // This is a simplification
        setCurrentPage(Math.max(1, currentPage - 1));
        baseQuery = query(baseQuery, limit(logsPerPage * currentPage));
      } else {
        baseQuery = query(baseQuery, limit(logsPerPage));
      }
      
      const snapshot = await getDocs(baseQuery);
      
      // Check if there are more results
      setHasMore(!snapshot.empty);
      
      if (!snapshot.empty) {
        // Update pagination markers
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setFirstVisible(snapshot.docs[0]);
        
        // Transform the log data
        const logData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LogEntry[];
        
        // Apply client-side search filtering
        const filteredLogs = searchTerm
          ? logData.filter(
              log => 
                log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.userEmail && log.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (log.path && log.path.toLowerCase().includes(searchTerm.toLowerCase()))
            )
          : logData;
          
        setLogs(filteredLogs);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchLogs();
    }
  }, [user, loading, filterLevel]);

  // Apply search filter client-side to avoid excessive DB queries
  useEffect(() => {
    if (searchTerm) {
      fetchLogs();
    }
  }, [searchTerm]);

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
      fetchLogs('next');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchLogs('prev');
    }
  };

  const handleRefresh = () => {
    setLastVisible(null);
    setFirstVisible(null);
    setCurrentPage(1);
    fetchLogs();
  };

  const handleGenerateSampleLogs = async () => {
    if (isGeneratingLogs) return;
    
    try {
      setIsGeneratingLogs(true);
      await generateDistributedSampleLogs(30); // Generate 30 sample logs
      toast.success('Sample logs generated successfully');
      handleRefresh(); // Refresh the logs list
    } catch (error) {
      console.error('Error generating sample logs:', error);
      toast.error('Failed to generate sample logs');
    } finally {
      setIsGeneratingLogs(false);
    }
  };

  const handleClearLogs = async () => {
    if (isClearing) return;
    
    try {
      setIsClearing(true);
      
      if (!user?.uid) {
        toast.error('Authentication required');
        return;
      }
      
      const result = await logger.clearAllLogs(user.uid);
      
      if (result.success) {
        toast.success(`Cleared ${result.count} logs successfully`);
        handleRefresh();
      } else {
        toast.error('Failed to clear logs');
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast.error('Failed to clear logs');
    } finally {
      setIsClearing(false);
      setShowClearConfirm(false);
    }
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.INFO:
        return <Info size={18} className="text-blue-500" />;
      case LogLevel.WARNING:
        return <AlertTriangle size={18} className="text-yellow-500" />;
      case LogLevel.ERROR:
        return <AlertCircle size={18} className="text-red-500" />;
      case LogLevel.SECURITY:
        return <Shield size={18} className="text-purple-500" />;
      default:
        return <Info size={18} className="text-gray-500" />;
    }
  };

  const getLevelClass = (level: LogLevel) => {
    switch (level) {
      case LogLevel.INFO:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case LogLevel.WARNING:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case LogLevel.ERROR:
        return 'bg-red-50 text-red-700 border-red-200';
      case LogLevel.SECURITY:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const openLogDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeLogDetails = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center">Unauthorized</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Logs</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            title="Export logs"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
          
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
            title="Clear all logs"
          >
            <Trash2 size={18} />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>
      
      {/* Confirmation Dialog for Clear Logs */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full animate-fadeIn">
            <h3 className="text-xl font-bold mb-3 text-red-600">Clear All Logs</h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to clear all logs from the system? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                disabled={isClearing}
              >
                Cancel
              </button>
              <button
                onClick={handleClearLogs}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
                disabled={isClearing}
              >
                {isClearing ? 'Clearing...' : 'Clear All Logs'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 bg-white p-4 rounded shadow">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="w-full px-4 py-2 pl-10 border rounded"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={filterLevel || ''}
            onChange={(e) => setFilterLevel(e.target.value as LogLevel || null)}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Levels</option>
            <option value={LogLevel.INFO}>Info</option>
            <option value={LogLevel.WARNING}>Warning</option>
            <option value={LogLevel.ERROR}>Error</option>
            <option value={LogLevel.SECURITY}>Security</option>
          </select>
          
          <button
            onClick={handleRefresh}
            className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw size={20} />
          </button>
          
          <button
            onClick={handleGenerateSampleLogs}
            disabled={isGeneratingLogs}
            className={`flex items-center gap-1 px-3 py-2 rounded transition-colors ${
              isGeneratingLogs 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
            }`}
            title="Generate sample logs"
          >
            <Database size={18} />
            <span className="hidden sm:inline">{isGeneratingLogs ? 'Generating...' : 'Sample Data'}</span>
          </button>
        </div>
      </div>
      
      {/* Logs Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500">Loading logs...</p>
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Level</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Timestamp</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Message</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Path</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getLevelClass(log.level)}`}>
                        {getLevelIcon(log.level)}
                        <span className="ml-1.5 capitalize">{log.level}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {log.timestamp?.toDate().toLocaleString() || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 max-w-sm truncate">
                      {log.message}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {log.userEmail || log.userId || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {log.path || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => openLogDetails(log)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No logs found matching your criteria
          </div>
        )}
        
        {/* Pagination */}
        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Page {currentPage}
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={handleNextPage}
              disabled={!hasMore}
              className={`p-2 rounded ${
                !hasMore 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Log Detail Modal */}
      <LogDetailModal 
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={closeLogDetails}
      />
      
      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};

export default LogsPage; 