"use client"
import React, { useState } from 'react';
import ReadingModule from '@/components/ielts/reading/ReadingModule';
import ModuleInstructions from '@/components/ielts/ModuleInstructions';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const Reading = () => {
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
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Academic
                        </button>
                        <button
                            onClick={() => setTestType('general')}
                            className={`flex-1 py-2 px-4 rounded-md ${
                                testType === 'general' 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            General
                        </button>
                    </div>
                </div>
                <ModuleInstructions 
                    moduleType={testType === 'academic' ? 'reading-academic' : 'reading-general'} 
                    onStartTest={handleStartTest} 
                />
            </div>
        );
    }
    
    return <ReadingModule />;
}

export default Reading;