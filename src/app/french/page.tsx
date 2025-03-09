"use client";

import React, { useState } from 'react';
import ModuleCard from '@/components/ielts/ModuleCard';
import LevelDetailModal from '@/components/LevelDetailModal';
import { BookOpen } from 'lucide-react';

interface Level {
  title: string;
  description: string;
  details: string[];
  bgColor: string;
}

const FrenchPage: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openLevelDetails = (level: Level) => {
    setSelectedLevel(level);
    setIsModalOpen(true);
  };

  const closeLevelDetails = () => {
    setIsModalOpen(false);
  };

  const levels: Level[] = [
    {
      title: 'A1 (Beginner)',
      description: 'This is the starting point for absolute beginners. Learners acquire foundational skills to handle basic communication in everyday situations.',
      details: [
        'Greetings and Introductions: Saying hello, goodbye, and introducing oneself or others (e.g., "Je m\'appelle...").',
        'Numbers, Dates, and Time: Counting, telling time, and understanding days/months.',
        'Simple Present Tense Verbs: Using common verbs like être (to be), avoir (to have), and regular -er verbs in the present tense.',
        'Everyday Vocabulary: Words related to family, hobbies, food, and basic objects.',
        'Basic Sentence Structures: Forming simple sentences (e.g., "J\'habite à Paris").',
        'Pronunciation Basics: Mastering the French alphabet, accents, and basic sounds.'
      ],
      bgColor: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'A2 (Elementary)',
      description: 'At this stage, learners expand their ability to communicate in routine tasks and understand more complex sentences.',
      details: [
        'Describing Daily Routines and Past Events: Talking about habits and using the passé composé for past actions.',
        'Future Tense for Plans: Using futur proche (e.g., "Je vais partir").',
        'Expanded Vocabulary: Topics like travel, shopping, health, and directions.',
        'Introduction to Reflexive Verbs and Object Pronouns: Learning verbs like se laver (to wash oneself) and pronouns like le/la/les.',
        'Basic Writing and Comprehension: Writing short messages or emails and understanding simple texts (e.g., menus, signs).'
      ],
      bgColor: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      title: 'B1 (Intermediate)',
      description: 'Learners at this level can handle most everyday situations independently and begin expressing more nuanced ideas.',
      details: [
        'Discussing Work, Education, and Lifestyle: Talking about jobs, studies, and personal interests.',
        'Imperfect Tense and Conditional Mood: Using imparfait for past descriptions and conditionnel for hypotheticals (e.g., "Je voudrais...").',
        'Relative Pronouns and Passive Voice: Structures like qui/que and passive constructions.',
        'Reading Longer Texts: Understanding short articles, stories, or emails.',
        'Writing Formal and Informal Communications: Composing letters or expressing opinions in writing.'
      ],
      bgColor: 'bg-red-600 hover:bg-red-700',
    },
    {
      title: 'B2 (Upper Intermediate)',
      description: 'This level emphasizes fluency and the ability to engage with complex topics and native speakers comfortably.',
      details: [
        'Advanced Grammar, Including Subjunctive Mood: Using subjonctif for opinions and emotions (e.g., "Il faut que tu viennes").',
        'Idiomatic Expressions and Colloquial Language: Learning phrases like avoir du chien (to have charm).',
        'In-Depth Reading of Complex Texts: Analyzing literature, news, or specialized articles.',
        'Writing Detailed Reports or Essays: Producing structured texts on various subjects.',
        'Fluency in Discussions and Presentations: Participating in debates or giving talks.'
      ],
      bgColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    {
      title: 'C1 (Advanced)',
      description: 'Learners achieve a high level of proficiency, with the ability to use French flexibly in academic, professional, or social contexts.',
      details: [
        'Nuanced Language and Culture Understanding: Grasping subtle meanings and cultural references.',
        'Advanced Writing: Crafting academic papers, professional reports, or creative texts.',
        'Sophisticated Vocabulary and Expressions: Using precise and varied language.',
        'Handling Complex Communicative Tasks: Managing discussions or negotiations with ease.'
      ],
      bgColor: 'bg-teal-600 hover:bg-teal-700',
    },
    {
      title: 'C2 (Proficiency)',
      description: 'This is the mastery level, where learners approach near-native fluency and comprehension.',
      details: [
        'Near-Native Fluency in All Skills: Speaking and writing with precision and spontaneity.',
        'Understanding Subtle Cultural References: Recognizing humor, idioms, and historical allusions.',
        'Mastery of Language in Any Context: Using French effectively in specialized fields or high-stakes situations.'
      ],
      bgColor: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">French Language Levels</h1>
        <p className="text-gray-600 mt-2">Explore the levels and start your learning journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level) => (
          <ModuleCard
            key={level.title}
            title={level.title}
            description={level.description}
            icon={BookOpen}
            bgColor={level.bgColor}
            onClick={() => openLevelDetails(level)}
            className="transition-transform transform hover:scale-105 cursor-pointer"
          />
        ))}
      </div>
      
      {/* Level details modal */}
      <LevelDetailModal 
        level={selectedLevel}
        isOpen={isModalOpen}
        onClose={closeLevelDetails}
      />
    </div>
  );
};

export default FrenchPage;
