"use client"
import React from 'react';
import { BookOpen, Headphones, Pen, Mic, PlayCircle } from 'lucide-react';
import ModuleCard from '@/components/ielts/ModuleCard';
import ReadingModule from '@/components/ielts/reading/ReadingModule';
import WritingModule from '@/components/ielts/writing/WritingModule';
import ListeningModule from '@/components/ielts/listening/ListeningModule';
import SpeakingModule from '@/components/ielts/speaking/SpeakingModule';
import FullTest from '../ielts/fulltest/page';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [activeModule, setActiveModule] = React.useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  if(!user){
    toast.error('Please sign in to view dashboard');
    router.push('/signin');
    return;
  }
  
  const modules = [
    {
      title: 'Full IELTS Test',
      description: 'Take a complete IELTS test with all four modules in sequence',
      icon: PlayCircle,
      bgColor: 'bg-green-600',
      onClick: () => setActiveModule('full-test')
    },
    {
      title: 'Reading',
      description: 'Improve comprehension skills with academic texts and passages',
      icon: BookOpen,
      bgColor: 'bg-emerald-600',
      onClick: () => setActiveModule('reading')
    },
    {
      title: 'Listening',
      description: 'Practice with authentic audio materials and test scenarios',
      icon: Headphones,
      bgColor: 'bg-blue-600',
      onClick: () => setActiveModule('listening')
    },
    {
      title: 'Writing',
      description: 'Master Task 1 and Task 2 with guided practice',
      icon: Pen,
      bgColor: 'bg-purple-600',
      onClick: () => setActiveModule('writing')
    },
    {
      title: 'Speaking',
      description: 'Enhance fluency and confidence in all three parts',
      icon: Mic,
      bgColor: 'bg-rose-600',
      onClick: () => setActiveModule('speaking')
    }
  ];

  if (activeModule === 'reading') {
    return <ReadingModule />;
  }

  if (activeModule === 'writing') {
    return <WritingModule />;
  }

  if (activeModule === 'listening') {
    return <ListeningModule />;
  }

  if (activeModule === 'speaking') {
    return <SpeakingModule />;
  }

  if (activeModule === 'full-test') {
    return <FullTest />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleCard key={module.title} {...module} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;