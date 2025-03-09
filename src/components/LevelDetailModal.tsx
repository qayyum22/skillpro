"use client";

import React, { useRef, useEffect } from 'react';
import { X, BookOpen, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LevelDetail {
  title: string;
  description: string;
  details: string[];
  bgColor: string;
}

interface LevelDetailModalProps {
  level: LevelDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

const LevelDetailModal: React.FC<LevelDetailModalProps> = ({ level, isOpen, onClose }) => {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Close on escape key press
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    // Close when clicking outside the modal
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen || !level) return null;
  
  const handleStartLearning = () => {
    // Navigate to the course page for this level
    const levelPathSegment = level.title.split(' ')[0].toLowerCase();
    router.push(`/french/${levelPathSegment}`);
    onClose();
  };
  
  // Extract the primary color from bgColor (removing hover effect)
  const primaryColor = level.bgColor.split(' ')[0];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn"
      >
        {/* Header */}
        <div className={`${primaryColor} text-white p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold flex items-center">
            <BookOpen className="mr-3" size={28} />
            {level.title}
          </h2>
          <p className="mt-2 text-white text-opacity-90">{level.description}</p>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">What you'll learn:</h3>
          <ul className="space-y-3">
            {level.details.map((detail, index) => (
              <li key={index} className="flex">
                <span className="mr-2 text-green-500 font-bold">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-2">Ready to start?</h3>
            <p className="text-gray-600 mb-4">
              Begin your journey with {level.title} French. Track your progress and earn certificates as you advance.
            </p>
          </div>
        </div>
        
        {/* Footer with action buttons */}
        <div className="p-4 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartLearning}
            className={`${primaryColor} hover:bg-opacity-90 text-white px-6 py-2 rounded-md flex items-center transition-colors`}
          >
            <Play size={18} className="mr-2" />
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelDetailModal; 