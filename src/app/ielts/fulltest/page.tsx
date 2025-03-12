"use client"
import React, { useState } from 'react';
import ListeningModule from '@/components/ielts/listening/ListeningModule';
import ReadingModule from '@/components/ielts/reading/ReadingModule';
import WritingModule from '@/components/ielts/writing/WritingModule';
import SpeakingModule from '@/components/ielts/speaking/SpeakingModule';
import ModuleInstructions from '@/components/ielts/ModuleInstructions';
import TestResults from './TestResults';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

// Define proper types for answers to match what TestResults expects
interface ModuleAnswers {
  listening: Record<string, string>;
  reading: Record<string, string>;
  writing: { taskId: string; response: string; wordCount: number; }[];
  speaking: { partId: string; audioUrl: string; duration: number; }[];
}

const FullTest: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [testType, setTestType] = useState<'academic' | 'general'>('academic');
  const [currentModule, setCurrentModule] = useState('listening');
  const [answers, setAnswers] = useState<ModuleAnswers>({
    listening: {},
    reading: {},
    writing: [],
    speaking: []
  });

  const handleStartTest = () => {
    setShowInstructions(false);
  };

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

  if (showInstructions) {
    return (
      <div>
        <div className="mb-4 bg-white p-4 border-b flex justify-between">
          <Link href="/dashboard">
            <Button 
              variant="outline" 
              className="flex items-center space-x-1"
            >
              <ChevronLeft size={16} />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
          <div className="max-w-md w-full flex space-x-4">
            <button
              onClick={() => setTestType('academic')}
              className={`flex-1 py-2 px-4 rounded-md ${
                testType === 'academic' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setTestType('general')}
              className={`flex-1 py-2 px-4 rounded-md ${
                testType === 'general' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              General
            </button>
          </div>
        </div>
        <ModuleInstructions 
          moduleType={testType === 'academic' ? 'full-test-academic' : 'full-test-general'} 
          onStartTest={handleStartTest} 
        />
      </div>
    );
  }

  const renderCurrentModule = () => {
    switch (currentModule) {
      case 'listening':
        return <ListeningModule onComplete={handleModuleComplete} isFullTest />;
      case 'reading':
        return <ReadingModule 
          onComplete={handleModuleComplete} 
          isFullTest 
        />;
      case 'writing':
        return <WritingModule 
          onComplete={handleModuleComplete} 
          isFullTest 
        />;
      case 'speaking':
        return <SpeakingModule onComplete={handleModuleComplete} isFullTest />;
      case 'results':
        return <TestResults answers={answers} />;
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
              <h2 className="text-xl font-semibold text-gray-800">
                Full IELTS Test - {testType === 'academic' ? 'Academic' : 'General'}
              </h2>
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