"use client";
import React, { useState } from 'react';
import { Suspense } from "react";
import WritingModule from "@/components/ielts/writing/WritingModule";
import ModuleInstructions from "@/components/ielts/ModuleInstructions";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const Writing = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [testType, setTestType] = useState<'academic' | 'general'>('academic');
  
  const handleStartTest = () => {
    setShowInstructions(false);
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
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setTestType('general')}
              className={`flex-1 py-2 px-4 rounded-md ${
                testType === 'general' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              General
            </button>
          </div>
        </div>
        <ModuleInstructions 
          moduleType={testType === 'academic' ? 'writing-academic' : 'writing-general'} 
          onStartTest={handleStartTest} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">IELTS Writing Practice</h1>
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        }>
          <WritingModule />
        </Suspense>
      </div>
    </div>
  );
};

export default Writing;