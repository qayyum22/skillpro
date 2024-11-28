"use client"
import React, { useState } from 'react';
import ListeningModule from '@/components/ielts/listening/ListeningModule';
import ReadingModule from '@/components/ielts/reading/ReadingModule';
import WritingModule from '@/components/ielts/writing/WritingModule';
import SpeakingModule from '@/components/ielts/speaking/SpeakingModule';
import TestResults from './TestResults';

const FullTest: React.FC = () => {
  const [currentModule, setCurrentModule] = useState('listening');
  const [answers, setAnswers] = useState({
    listening: {},
    reading: {},
    writing: {},
    speaking: {}
  });


  const handleModuleComplete = (moduleAnswers: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentModule]: moduleAnswers
    }));

    // Move to next module
    switch (currentModule) {
      case 'listening':
        setCurrentModule('reading');
        break;
      case 'reading':
        setCurrentModule('writing');
        break;
      case 'writing':
        setCurrentModule('speaking');
        break;
      case 'speaking':
        setCurrentModule('results');
        break;
    }
  };

  const renderCurrentModule = () => {
    switch (currentModule) {
      case 'listening':
        return <ListeningModule onComplete={handleModuleComplete} isFullTest />;
      case 'reading':
        return <ReadingModule onComplete={handleModuleComplete} isFullTest />;
      case 'writing':
        return <WritingModule onComplete={handleModuleComplete} isFullTest />;
      case 'speaking':
        return <SpeakingModule onComplete={handleModuleComplete} isFullTest />;
      case 'results':
        return <TestResults answers={answers as any} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentModule !== 'results' && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Full IELTS Test</h2>
              <div className="flex space-x-4">
                {['Listening', 'Reading', 'Writing', 'Speaking'].map((module) => (
                  <div
                    key={module}
                    className={`px-4 py-2 rounded-lg ${
                      currentModule === module.toLowerCase()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {module}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {renderCurrentModule()}
    </div>
  );
};

export default FullTest;