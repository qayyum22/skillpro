'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Mic, Settings, Activity, ChevronLeft } from 'lucide-react';
import SpeakingModule from '@/components/ielts/speaking/SpeakingModule';
import ProgressDashboard from '@/components/ielts/speaking/ProgressDashboard';
import SpeakingResults from '@/components/ielts/speaking/SpeakingResults';
import { SpeechAnalysisResult } from '@/services/speechAnalysis';
import { TestService } from '@/services/firebase';
import { IELTSTest } from '@/types/test';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockPracticeHistory = [
  {
    id: '1',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    scores: {
      fluency: 5.5,
      pronunciation: 6.0,
      grammar: 5.5,
      vocabulary: 6.0,
      overall: 5.5
    },
    topic: 'Daily Routine'
  },
  {
    id: '2',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    scores: {
      fluency: 6.0,
      pronunciation: 6.0,
      grammar: 5.5,
      vocabulary: 6.5,
      overall: 6.0
    },
    topic: 'Hometown'
  },
  {
    id: '3',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    scores: {
      fluency: 6.5,
      pronunciation: 6.0,
      grammar: 6.0,
      vocabulary: 6.5,
      overall: 6.5
    },
    topic: 'Free Time Activities'
  },
  {
    id: '4',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    scores: {
      fluency: 6.5,
      pronunciation: 6.0,
      grammar: 6.5,
      vocabulary: 7.0,
      overall: 6.5
    },
    topic: 'Technology'
  }
];

// Mock detailed results for display
const mockDetailedResult: SpeechAnalysisResult = {
  fluency: {
    score: 6.5,
    examples: [
      "Well, I think that, um, technology plays a very important role in our lives today.",
      "I use my smartphone for, you know, various purposes like communication and, uh, entertainment."
    ],
    feedback: "You demonstrate reasonably good fluency with some hesitations. Your ideas are generally connected, though occasionally there are noticeable pauses and fillers like 'um' and 'uh'."
  },
  vocabulary: {
    score: 7.0,
    examples: [
      "I find it quite convenient to access information instantaneously.",
      "Many traditional forms of entertainment have become somewhat obsolete."
    ],
    feedback: "You use a good range of vocabulary with some less common and idiomatic expressions. You demonstrate flexibility in word choice and generally avoid repetition."
  },
  grammar: {
    score: 6.5,
    examples: [
      "If I had more time, I would probably spend less time on social media.",
      "Technology has been evolving rapidly over the past decade."
    ],
    feedback: "You use a mix of simple and complex sentence forms. There are some grammatical errors, but they rarely impede communication."
  },
  pronunciation: {
    score: 6.0,
    examples: [
      "Development /dɪˈveləpmənt/",
      "Particularly /pəˈtɪkjʊləli/"
    ],
    feedback: "Your pronunciation is generally clear, though there are some issues with word stress and intonation patterns. Certain sounds are mispronounced but rarely affect understanding."
  },
  overall: {
    score: 6.5,
    strengths: [
      "Good use of vocabulary related to technology",
      "Ability to express opinions clearly",
      "Generally coherent responses with logical organization"
    ],
    improvements: [
      "Reduce hesitations and filler words",
      "Work on pronunciation of specific sounds and word stress",
      "Increase use of complex grammatical structures"
    ]
  }
};

enum SpeakingPageView {
  DASHBOARD = 'dashboard',
  PRACTICE = 'practice',
  RESULTS = 'results'
}

export default function SpeakingPage() {
  const [view, setView] = useState<SpeakingPageView>(SpeakingPageView.DASHBOARD);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState<SpeechAnalysisResult | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<IELTSTest | null>(null);
  const [loading, setLoading] = useState(true);
  
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
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching test:', error);
        setLoading(false);
      }
    };
    
    fetchLatestTest();
  }, []);
  
  const handleStartPractice = () => {
    setView(SpeakingPageView.PRACTICE);
  };
  
  const handlePracticeComplete = (data: any) => {
    console.log('Practice completed:', data);
    
    setCurrentResult(data.analysis);
    
    if (data.recordings && Object.values(data.recordings).length > 0) {
      const firstRecording = Object.values(data.recordings)[0] as { url: string };
      setRecordingUrl(firstRecording.url);
    }
    
    if (data.responses && Object.values(data.responses).length > 0) {
      const firstResponse = Object.values(data.responses)[0] as { transcription: string };
      setTranscription(firstResponse.transcription);
    }
    
    setView(SpeakingPageView.RESULTS);
  };
  
  const renderContent = () => {
    switch (view) {
      case SpeakingPageView.DASHBOARD:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-indigo-700">IELTS Speaking Practice</h1>
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center space-x-1">
                  <ChevronLeft size={16} />
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 flex flex-col items-center justify-center space-y-2">
                <div className="rounded-full bg-indigo-100 p-3">
                  <Mic className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-medium text-gray-700">Speaking Test</h3>
                <p className="text-sm text-gray-500 text-center">
                  Practice all three parts of the IELTS Speaking test
                </p>
                <Button 
                  onClick={handleStartPractice}
                  className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Start Practice
                </Button>
              </Card>
              
              <Card className="p-4 flex flex-col items-center justify-center space-y-2">
                <div className="rounded-full bg-green-100 p-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-700">Schedule Test</h3>
                <p className="text-sm text-gray-500 text-center">
                  Book a live session with an IELTS speaking examiner
                </p>
                <Button 
                  variant="outline"
                  className="mt-2 border-green-600 text-green-600 hover:bg-green-50"
                >
                  Book Session
                </Button>
              </Card>
              
              <Card className="p-4 flex flex-col items-center justify-center space-y-2">
                <div className="rounded-full bg-amber-100 p-3">
                  <Activity className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-medium text-gray-700">Analytics</h3>
                <p className="text-sm text-gray-500 text-center">
                  View detailed analytics of your speaking performance
                </p>
                <Button 
                  variant="outline"
                  className="mt-2 border-amber-600 text-amber-600 hover:bg-amber-50"
                >
                  View Analytics
                </Button>
              </Card>
              
              <Card className="p-4 flex flex-col items-center justify-center space-y-2">
                <div className="rounded-full bg-purple-100 p-3">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-700">Settings</h3>
                <p className="text-sm text-gray-500 text-center">
                  Configure your speaking practice preferences
                </p>
                <Button 
                  variant="outline"
                  className="mt-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  Configure
                </Button>
              </Card>
            </div>
            <div className="mt-8">
              <Tabs defaultValue="progress">
                <TabsList className="mb-4">
                  <TabsTrigger value="progress">Progress Dashboard</TabsTrigger>
                  <TabsTrigger value="topics">Practice Topics</TabsTrigger>
                  <TabsTrigger value="tips">Speaking Tips</TabsTrigger>
                </TabsList>
                
                <TabsContent value="progress">
                  <ProgressDashboard 
                    practiceHistory={mockPracticeHistory} // Ensure practiceHistory is defined
                    onStartNewPractice={handleStartPractice}
                  />
                </TabsContent>
                
                <TabsContent value="topics">
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-indigo-700 mb-4">Popular Speaking Topics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {['Work & Studies', 'Hobbies', 'Hometown', 'Technology', 'Environment', 'Travel', 'Food', 'Health', 'Education'].map((topic, index) => (
                        <Button 
                          key={index} 
                          variant="outline"
                          className="justify-start text-left h-auto py-3"
                        >
                          {topic}
                        </Button>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tips">
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-indigo-700 mb-4">IELTS Speaking Tips</h2>
                    <div className="space-y-4">
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h3 className="font-medium text-indigo-700 mb-2">Part 1: Introduction</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          <li>Keep answers concise but detailed (30-45 seconds)</li>
                          <li>Use simple but accurate grammar</li>
                          <li>Give reasons and examples for your answers</li>
                          <li>Avoid one-word responses</li>
                        </ul>
                      </div>
                      
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h3 className="font-medium text-indigo-700 mb-2">Part 2: Long Turn</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          <li>Use your preparation time effectively</li>
                          <li>Structure your response with an introduction, body and conclusion</li>
                          <li>Cover all the points on the cue card</li>
                          <li>Speak for the full 2 minutes</li>
                        </ul>
                      </div>
                      
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <h3 className="font-medium text-indigo-700 mb-2">Part 3: Discussion</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          <li>Give extended, in-depth responses</li>
                          <li>Use complex grammar structures and vocabulary</li>
                          <li>Express and justify opinions clearly</li>
                          <li>Discuss abstract concepts and ideas</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );
      
      case SpeakingPageView.PRACTICE:
        return (
          <>
            <div className="mb-6">
              <Button 
                variant="outline" 
                className="flex items-center space-x-1"
                onClick={() => setView(SpeakingPageView.DASHBOARD)}
              >
                <ChevronLeft size={16} />
                <span>Back to Dashboard</span>
              </Button>
            </div>
            {selectedTest && (
              <SpeakingModule 
                onComplete={handlePracticeComplete} 
                isFullTest={true}
                testId={selectedTest.id}
              />
            )}
          </>
        );
      
      case SpeakingPageView.RESULTS:
        return (
          <>
            <div className="mb-6 flex justify-between">
              <Button 
                variant="outline" 
                className="flex items-center space-x-1"
                onClick={() => setView(SpeakingPageView.DASHBOARD)}
              >
                <ChevronLeft size={16} />
                <span>Back to Dashboard</span>
              </Button>
              
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleStartPractice}
              >
                Practice Again
              </Button>
            </div>
            
            {currentResult && (
              <SpeakingResults 
                result={currentResult}
                testDate={new Date()}
                recordingUrl={recordingUrl || undefined}
                transcription={transcription || undefined}
              />
            )}
          </>
        );
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
