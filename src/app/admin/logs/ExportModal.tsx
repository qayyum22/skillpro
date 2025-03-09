'use client';

import React, { useState } from 'react';
import { X, Download, Calendar } from 'lucide-react';
import { LogLevel } from '@/lib/logger';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState<'json' | 'csv'>('csv');
  const [level, setLevel] = useState<LogLevel | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [maxResults, setMaxResults] = useState<number>(1000);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Build the export URL with query parameters
      let exportUrl = `/api/logs/export?format=${format}`;
      
      if (level) {
        exportUrl += `&level=${level}`;
      }
      
      if (startDate) {
        exportUrl += `&startDate=${startDate}`;
      }
      
      if (endDate) {
        exportUrl += `&endDate=${endDate}`;
      }
      
      exportUrl += `&maxResults=${maxResults}`;
      
      if (format === 'csv') {
        // For CSV, trigger a download
        window.location.href = exportUrl;
      } else {
        // For JSON, open in a new tab
        window.open(exportUrl, '_blank');
      }
    } catch (error) {
      console.error('Error during export:', error);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <Download size={20} className="mr-2 text-blue-600" />
            Export Logs
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Format selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  className="form-radio text-blue-600" 
                  name="format"
                  checked={format === 'csv'} 
                  onChange={() => setFormat('csv')}
                />
                <span className="ml-2">CSV</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  className="form-radio text-blue-600" 
                  name="format"
                  checked={format === 'json'} 
                  onChange={() => setFormat('json')}
                />
                <span className="ml-2">JSON</span>
              </label>
            </div>
          </div>
          
          {/* Level filter */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value as LogLevel | '')}
              className="w-full rounded-md border border-gray-300 py-2 px-3"
            >
              <option value="">All Levels</option>
              <option value={LogLevel.INFO}>Info</option>
              <option value={LogLevel.WARNING}>Warning</option>
              <option value={LogLevel.ERROR}>Error</option>
              <option value={LogLevel.SECURITY}>Security</option>
            </select>
          </div>
          
          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3"
                />
              </div>
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3"
                />
              </div>
            </div>
          </div>
          
          {/* Max results */}
          <div>
            <label htmlFor="maxResults" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Records ({maxResults.toLocaleString()})
            </label>
            <input
              id="maxResults"
              type="range"
              min="100"
              max="10000"
              step="100"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>100</span>
              <span>10,000</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors mr-3"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download size={18} className="mr-2" />
            {isExporting ? 'Exporting...' : 'Export Logs'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 