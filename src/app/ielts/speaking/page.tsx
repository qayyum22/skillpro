'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import SpeakingModule from '@/components/ielts/speaking/SpeakingModule';
import SpeakingResults from '@/components/ielts/speaking/SpeakingResults';
import ModuleInstructions from "@/components/ielts/ModuleInstructions";
import { SpeechAnalysisResult } from '@/services/speechAnalysis';
import { TestService } from '@/services/firebase';
import { IELTSTest } from '@/types/test';
import Link from 'next/link';

enum SpeakingPageView {
  INSTRUCTIONS = 'instructions',
  PRACTICE = 'practice',
  RESULTS = 'results',
  ERROR = 'error'
}

interface Recording {
  url: string;
  [key: string]: any;
}

interface Response {
  transcription: string;
  [key: string]: any;
}

interface PracticeCompleteData {
  analysis?: SpeechAnalysisResult;
  recordings?: Record<string, Recording>;
  responses?: Record<string, Response>;
  [key: string]: any;
}

export default function SpeakingPage() {
  const [view, setView] = useState<SpeakingPageView>(SpeakingPageView.INSTRUCTIONS);
  const [currentResult, setCurrentResult] = useState<SpeechAnalysisResult | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<IELTSTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testDate, setTestDate] = useState<Date>(new Date());
  
  useEffect(() => {
    const fetchLatestTest = async () => {
      try {
        const result = await TestService.getTests({
          type: 'speaking',
          page: 1,
          limit: 1
        });
        
        if (result.tests.length > 0) {
          setSelectedTest(result.tests[0]);
        } else {
          setError("No speaking tests are currently available. Please check back later.");
        }
      } catch (error) {
        console.error('Error fetching test:', error);
        setError("Failed to load speaking test. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestTest();
  }, []);
  
  const handleStartTest = () => {
    if (!selectedTest && !error) {
      setError("No test is available to start. Please try again later.");
      setView(SpeakingPageView.ERROR);
    } else if (!error) {
      setView(SpeakingPageView.PRACTICE);
    }
  };
  
  const handlePracticeComplete = (data: PracticeCompleteData) => {
    console.log('Practice completed:', data);
    setTestDate(new Date()); // Set the current date when test is completed
    
    if (data.analysis) {
      setCurrentResult(data.analysis);
    }
    
    if (data.recordings && Object.keys(data.recordings).length > 0) {
      const firstRecordingKey = Object.keys(data.recordings)[0];
      const firstRecording = data.recordings[firstRecordingKey];
      if (firstRecording && firstRecording.url) {
        setRecordingUrl(firstRecording.url);
      }
    }
    
    if (data.responses && Object.keys(data.responses).length > 0) {
      const firstResponseKey = Object.keys(data.responses)[0];
      const firstResponse = data.responses[firstResponseKey];
      if (firstResponse && firstResponse.transcription) {
        setTranscription(firstResponse.transcription);
      }
    }
    
    setView(SpeakingPageView.RESULTS);
  };
  
  const renderContent = () => {
    switch (view) {
      case SpeakingPageView.INSTRUCTIONS:
        return (
          <div>
            <div className="mb-4 p-4 border-b flex justify-between">
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft size={16} />
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
            </div>
            {error ? (
              <div className="p-6 bg-red-50 rounded-lg text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Link href="/dashboard">
                  <Button>
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <ModuleInstructions 
                moduleType="speaking"
                onStartTest={handleStartTest} 
              />
            )}
          </div>
        );
      
      case SpeakingPageView.PRACTICE:
        if (!selectedTest) {
          return (
            <div className="text-center p-6">
              <p className="text-red-600 mb-4">No test is available. Please try again later.</p>
              <Button onClick={() => setView(SpeakingPageView.INSTRUCTIONS)}>
                Back to Instructions
              </Button>
            </div>
          );
        }
        return <SpeakingModule onComplete={handlePracticeComplete} testId={selectedTest.id} />;
      
      case SpeakingPageView.RESULTS:
        if (!currentResult) {
          return (
            <div className="text-center p-6">
              <p className="text-yellow-600 mb-4">Results could not be generated. Please try again.</p>
              <Button onClick={() => setView(SpeakingPageView.INSTRUCTIONS)}>
                Start Over
              </Button>
            </div>
          );
        }
        return (
          <SpeakingResults
            result={currentResult}
            recordingUrl={recordingUrl || undefined}
            transcription={transcription || undefined}
            testDate={testDate}
          />
        );
      
      case SpeakingPageView.ERROR:
        return (
          <div className="text-center p-6">
            <p className="text-red-600 mb-4">{error || "An unknown error occurred."}</p>
            <Link href="/dashboard">
              <Button>
                Return to Dashboard
              </Button>
            </Link>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <main className="container mx-auto py-8 px-4">
      {renderContent()}
    </main>
  );
}
