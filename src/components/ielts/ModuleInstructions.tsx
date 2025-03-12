import React from 'react';
import { 
  BookOpen, 
  Headphones, 
  Pen, 
  Mic, 
  PlayCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ListChecks, 
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';

// Define module types and their corresponding icons/colors
const moduleConfig = {
  'reading-academic': {
    icon: BookOpen,
    color: 'emerald',
    name: 'Reading - Academic',
    duration: '60 minutes',
    questionCount: '40 questions',
    shortDescription: 'Tests your ability to read and understand academic texts.'
  },
  'reading-general': {
    icon: BookOpen,
    color: 'emerald',
    name: 'Reading - General',
    duration: '60 minutes',
    questionCount: '40 questions',
    shortDescription: 'Tests your ability to read and understand everyday texts.'
  },
  'writing-academic': {
    icon: Pen,
    color: 'purple',
    name: 'Writing - Academic',
    duration: '60 minutes',
    questionCount: '2 tasks',
    shortDescription: 'Tests your ability to write academic essays and describe visual information.'
  },
  'writing-general': {
    icon: Pen,
    color: 'purple',
    name: 'Writing - General',
    duration: '60 minutes',
    questionCount: '2 tasks',
    shortDescription: 'Tests your ability to write a letter and an essay.'
  },
  'listening': {
    icon: Headphones,
    color: 'blue',
    name: 'Listening',
    duration: '30 minutes',
    questionCount: '40 questions',
    shortDescription: 'Tests your ability to understand spoken English.'
  },
  'speaking': {
    icon: Mic,
    color: 'rose',
    name: 'Speaking',
    duration: '11-14 minutes',
    questionCount: '3 parts',
    shortDescription: 'Tests your ability to communicate effectively in spoken English.'
  },
  'full-test-academic': {
    icon: PlayCircle,
    color: 'green',
    name: 'Full IELTS Test - Academic',
    duration: '2 hours 45 minutes',
    questionCount: 'All modules',
    shortDescription: 'Complete Academic IELTS test with all four modules in sequence.'
  },
  'full-test-general': {
    icon: PlayCircle,
    color: 'green',
    name: 'Full IELTS Test - General',
    duration: '2 hours 45 minutes',
    questionCount: 'All modules',
    shortDescription: 'Complete General IELTS test with all four modules in sequence.'
  }
};

export interface ModuleInstructionsProps {
  moduleType: keyof typeof moduleConfig;
  onStartTest: () => void;
}

const ModuleInstructions: React.FC<ModuleInstructionsProps> = ({ moduleType, onStartTest }) => {
  const config = moduleConfig[moduleType];
  const ModuleIcon = config.icon;
  const colorClass = `text-${config.color}-600`;
  const bgColorClass = `bg-${config.color}-50`;
  const borderColorClass = `border-${config.color}-200`;
  
  // Generate module-specific instructions
  const getModuleSpecificInstructions = () => {
    switch (moduleType) {
      case 'reading-academic':
      case 'reading-general':
        return {
          imageUrl: '/images/ielts-reading.jpg',
          description: moduleType === 'reading-academic' 
            ? 'The IELTS Academic Reading test assesses your ability to understand and interpret academic texts. You will be presented with three long texts and answer 40 questions in total.'
            : 'The IELTS General Reading test assesses your ability to understand everyday texts. You will be presented with extracts from books, magazines, newspapers, and guidelines.',
          tips: [
            'Skim the text quickly before reading in detail',
            'Pay attention to headings, subheadings, and emphasized text',
            'Read the instructions carefully for each question type',
            'Manage your time — approximately 20 minutes per passage',
            'Transfer your answers carefully to the answer sheet',
            'Check spelling and grammar in your answers'
          ],
          whatToExpect: [
            'Three reading passages of increasing difficulty',
            'Various question types (multiple choice, matching, true/false/not given, etc.)',
            'Questions that test your understanding of main ideas, details, and implied meanings'
          ]
        };
      
      case 'writing-academic':
      case 'writing-general':
        return {
          imageUrl: '/images/ielts-writing.jpg',
          description: moduleType === 'writing-academic'
            ? 'The IELTS Academic Writing test consists of two tasks. Task 1 requires you to describe visual information (graph, chart, table, etc.). Task 2 requires you to write an essay responding to an argument or problem.'
            : 'The IELTS General Writing test consists of two tasks. Task 1 requires you to write a letter. Task 2 requires you to write an essay responding to a point of view, argument or problem.',
          tips: [
            'Plan your response before writing',
            'Structure your writing with clear paragraphs',
            'Use a range of vocabulary and grammatical structures',
            'Stay on topic and address all parts of the question',
            'Aim for at least 150 words for Task 1 and 250 words for Task 2',
            'Leave time to review your work for errors'
          ],
          whatToExpect: [
            'Two writing tasks with specific requirements',
            'Task 1 (20 minutes) and Task 2 (40 minutes)',
            'Assessment based on task achievement, coherence, vocabulary, and grammar'
          ]
        };
      
      case 'listening':
        return {
          imageUrl: '/images/ielts-listening.jpg',
          description: 'The IELTS Listening test assesses your ability to understand spoken English. You will listen to four recordings and answer 40 questions.',
          tips: [
            'Read the questions before the audio begins',
            'Listen for key words and phrases',
            'Pay attention to signpost words that indicate a change in topic',
            'Be aware that you will hear each recording only once',
            'Write your answers on the question paper as you listen',
            'Transfer your answers to the answer sheet at the end'
          ],
          whatToExpect: [
            'Four recordings of native English speakers in different contexts',
            'Progressively more difficult recordings',
            'Various question types (multiple choice, matching, fill in the blanks, etc.)',
            '10 questions per section'
          ]
        };
      
      case 'speaking':
        return {
          imageUrl: '/images/ielts-speaking.jpg',
          description: 'The IELTS Speaking test is a face-to-face interview with an examiner, designed to assess your ability to communicate effectively in English.',
          tips: [
            'Speak clearly and at a natural pace',
            'Provide detailed responses, not just short answers',
            'Use a range of vocabulary and grammatical structures',
            'Express and justify opinions',
            "Don't memorize prepared answers",
            'Ask for clarification if needed',
          ],
          whatToExpect: [
            'Part 1: Introduction and general questions about familiar topics (4-5 minutes)',
            'Part 2: A longer turn where you speak about a particular topic (3-4 minutes)',
            'Part 3: A discussion related to the Part 2 topic (4-5 minutes)',
            'Assessment based on fluency, vocabulary, grammar, and pronunciation'
          ]
        };
      
      case 'full-test-academic':
      case 'full-test-general':
        return {
          imageUrl: '/images/ielts-full-test.jpg',
          description: moduleType === 'full-test-academic'
            ? 'The full IELTS Academic test assesses your English language proficiency across all four skills: Listening, Reading, Writing, and Speaking. This comprehensive test simulates the actual IELTS exam conditions.'
            : 'The full IELTS General Training test assesses your English language proficiency across all four skills: Listening, Reading, Writing, and Speaking. This comprehensive test simulates the actual IELTS exam conditions.',
          tips: [
            'Ensure you have enough uninterrupted time (approximately 3 hours)',
            'Have a quiet environment with good internet connection',
            'Keep water and any necessary items nearby',
            'Take the test in the correct order: Listening, Reading, Writing, Speaking',
            'Follow all instructions carefully',
            'Manage your time according to the guidelines for each section'
          ],
          whatToExpect: [
            'Listening test (30 minutes + 10 minutes transfer time)',
            moduleType === 'full-test-academic' ? 'Academic Reading test (60 minutes)' : 'General Reading test (60 minutes)',
            moduleType === 'full-test-academic' ? 'Academic Writing test (60 minutes)' : 'General Writing test (60 minutes)',
            'Speaking test (11-14 minutes)'
          ]
        };
      
      default:
        return {
          imageUrl: '/images/ielts-default.jpg',
          description: 'Prepare for your IELTS module by understanding the requirements and practicing effective strategies.',
          tips: [
            'Read all instructions carefully',
            'Manage your time effectively',
            'Practice regularly with authentic materials',
            'Familiarize yourself with the question types',
            'Review your answers when possible'
          ],
          whatToExpect: [
            'Questions that assess your English language proficiency',
            'Clear instructions for each section',
            'Standard IELTS format and question types'
          ]
        };
    }
  };
  
  const moduleSpecifics = getModuleSpecificInstructions();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className={`rounded-lg shadow-md overflow-hidden mb-8 ${bgColorClass} ${borderColorClass} border`}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`rounded-full p-3 ${bgColorClass} mr-4`}>
              <ModuleIcon className={`h-8 w-8 ${colorClass}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{config.name}</h1>
              <p className="text-gray-600">{config.shortDescription}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-700">{config.duration}</span>
            </div>
            <div className="flex items-center">
              <ListChecks className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-700">{config.questionCount}</span>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 text-lg mb-4">{moduleSpecifics.description}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="rounded-lg shadow-md overflow-hidden h-full">
          {moduleSpecifics.imageUrl && (
            <div className="relative h-48 md:h-64">
              <img 
                src={moduleSpecifics.imageUrl}
                alt={`${config.name} visualization`}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div className="p-6 bg-white">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <HelpCircle className="h-5 w-5 text-gray-500 mr-2" />
              What to Expect
            </h2>
            <ul className="space-y-3">
              {moduleSpecifics.whatToExpect.map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="rounded-lg shadow-md overflow-hidden h-full">
          <div className="p-6 bg-white">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Tips for Success
            </h2>
            <ul className="space-y-3">
              {moduleSpecifics.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-amber-50 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                    <span className="text-amber-600 text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={onStartTest}
          className={`bg-${config.color}-600 hover:bg-${config.color}-700 text-white py-3 px-8 rounded-lg font-medium text-lg flex items-center shadow-md transform transition hover:scale-105`}
        >
          Start {config.name} Test
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ModuleInstructions; 