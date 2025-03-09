"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Clock, Award, BarChart2, Calendar, BookMarked, History, TrendingUp, Star, Globe, BookCheck } from 'lucide-react';
import ModuleCard from '@/components/ielts/ModuleCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Mock data for demonstration - in a real app, this would come from your backend
const mockUserProgress = {
  ielts: { completed: 12, total: 30, score: 7.5 },
  french: { completed: 8, total: 25, score: 'B1' }
};

const mockRecentActivity = [
  { id: 1, type: 'practice', title: 'IELTS Reading Practice Test 3', date: '2 hours ago', score: '8/10' },
  { id: 2, type: 'lesson', title: 'French Grammar: Past Tense', date: 'Yesterday', progress: '100%' },
  { id: 3, type: 'quiz', title: 'IELTS Vocabulary Quiz', date: '3 days ago', score: '85%' }
];

const mockRecommendations = [
  { id: 1, title: 'IELTS Writing Task 2', description: 'Based on your recent activity', path: '/ielts/writing' },
  { id: 2, title: 'French Conversation Practice', description: 'Improve your speaking skills', path: '/french/speaking' }
];

// Color scheme for different subjects
const subjectColors = {
  ielts: {
    primary: 'bg-indigo-600 hover:bg-indigo-700',
    light: 'bg-indigo-100',
    text: 'text-indigo-800',
    icon: 'text-indigo-600',
    progress: 'bg-indigo-600'
  },
  french: {
    primary: 'bg-teal-600 hover:bg-teal-700',
    light: 'bg-teal-100',
    text: 'text-teal-800',
    icon: 'text-teal-600',
    progress: 'bg-teal-600'
  }
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [lastActive, setLastActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate loading user data
  useEffect(() => {
    if (user) {
      // In a real app, fetch this data from your backend
      setTimeout(() => {
        setStreak(7); // Mock streak data
        setLastActive('Today');
        setLoading(false);
      }, 1000);
    }
  }, [user]);

  // Redirect unauthenticated users
  if (!user) {
    toast.error('Please sign in to view dashboard');
    router.push('/auth/signin');
    return null;
  }
  
  // Define modules with updated icons and direct navigation
  const skills = [
    {
      title: 'IELTS',
      description: 'Practice IELTS with our comprehensive modules',
      icon: FileText,
      bgColor: subjectColors.ielts.primary,
      onClick: () => router.push('/ielts'),
    },
    {
      title: 'French',
      description: 'Learn French from scratch',
      icon: Globe,
      bgColor: subjectColors.french.primary,
      onClick: () => router.push('/french'),
    },
  ];

  // Quick access practice tests
  const practiceTests = [
    { title: 'IELTS Reading', path: '/ielts/reading/practice', subject: 'ielts' },
    { title: 'IELTS Listening', path: '/ielts/listening/practice', subject: 'ielts' },
    { title: 'French Vocabulary', path: '/french/vocabulary/practice', subject: 'french' }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p>Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header section with welcome and streak */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.displayName || 'Learner'}!
          </h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-white p-3 rounded-lg shadow-sm">
          <div className="mr-4 text-center">
            <div className="flex items-center">
              <Award className="h-5 w-5 text-amber-500 mr-1" />
              <span className="font-bold">{streak} day streak!</span>
            </div>
            <p className="text-xs text-gray-500">Last active: {lastActive}</p>
          </div>
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Skills and Progress */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
            <BookMarked className="mr-2 h-5 w-5 text-purple-600" />
            Your Learning Paths
          </h2>
          
          {/* Skills grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {skills.map((skill) => (
              <ModuleCard
                title={skill.title}
                description={skill.description}
                icon={skill.icon}
                bgColor={skill.bgColor}
                onClick={skill.onClick}
                key={skill.title}
                className="transition-transform transform hover:scale-102"
              />
            ))}
          </div>
          
          {/* Progress section */}
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
            <BarChart2 className="mr-2 h-5 w-5 text-purple-600" />
            Your Progress
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Object.entries(mockUserProgress).map(([key, data]) => (
              <div key={key} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium capitalize">{key}</h3>
                  <span className={`text-sm ${subjectColors[key as keyof typeof subjectColors].light} ${subjectColors[key as keyof typeof subjectColors].text} py-1 px-2 rounded-full`}>
                    Score: {data.score}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`${subjectColors[key as keyof typeof subjectColors].progress} h-2.5 rounded-full`}
                    style={{ width: `${(data.completed / data.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {data.completed} of {data.total} lessons completed ({Math.round((data.completed / data.total) * 100)}%)
                </p>
              </div>
            ))}
          </div>
          
          {/* Recent activity */}
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
            <History className="mr-2 h-5 w-5 text-purple-600" />
            Recent Activity
          </h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
            {mockRecentActivity.map((activity, index) => (
              <div 
                key={activity.id} 
                className={`p-4 flex justify-between items-center ${
                  index !== mockRecentActivity.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div>
                  <h3 className="font-medium">{activity.title}</h3>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
                <div>
                  {activity.score && (
                    <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                      {activity.score}
                    </span>
                  )}
                  {activity.progress && (
                    <span className="text-sm bg-emerald-100 text-emerald-800 py-1 px-2 rounded-full">
                      {activity.progress}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div className="p-3 text-center">
              <Link href="/activity" className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                View all activity →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right column - Quick access and recommendations */}
        <div>
          {/* Quick access practice tests */}
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
            <Clock className="mr-2 h-5 w-5 text-purple-600" />
            Quick Practice
          </h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
            {practiceTests.map((test, index) => (
              <Link 
                href={test.path} 
                key={test.title}
                className={`block p-4 hover:bg-gray-50 transition-colors ${
                  index !== practiceTests.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className={`h-8 w-8 rounded-full ${subjectColors[test.subject as keyof typeof subjectColors].light} flex items-center justify-center mr-3`}>
                    <FileText className={`h-4 w-4 ${subjectColors[test.subject as keyof typeof subjectColors].icon}`} />
                  </div>
                  <span>{test.title}</span>
                </div>
              </Link>
            ))}
            <div className="p-3 text-center">
              <Link href="/practice" className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                View all practice tests →
              </Link>
            </div>
          </div>
          
          {/* Personalized recommendations */}
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
            <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
            Recommended for You
          </h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
            {mockRecommendations.map((rec, index) => {
              const subject = rec.title.toLowerCase().includes('ielts') ? 'ielts' : 'french';
              return (
                <Link 
                  href={rec.path} 
                  key={rec.id}
                  className={`block p-4 hover:bg-gray-50 transition-colors ${
                    index !== mockRecommendations.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`h-8 w-8 rounded-full ${subjectColors[subject].light} flex items-center justify-center mr-3 mt-0.5`}>
                      <BookCheck className={`h-4 w-4 ${subjectColors[subject].icon}`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{rec.title}</h3>
                      <p className="text-sm text-gray-500">{rec.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Study reminder */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg shadow-sm border border-amber-100">
            <div className="flex items-start">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium">Set a study goal</h3>
                <p className="text-sm text-gray-600 mb-3">Create a study schedule to stay on track</p>
                <button 
                  className="text-sm bg-amber-600 hover:bg-amber-700 text-white py-1.5 px-3 rounded-md transition-colors"
                  onClick={() => router.push('/goals')}
                >
                  Set Goals
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;