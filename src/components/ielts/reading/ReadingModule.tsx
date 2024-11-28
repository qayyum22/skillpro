// import React, { useState, useEffect } from 'react';
// import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
// import ReadingPassage from './ReadingPassage';
// import QuestionSection from './QuestionSection';
// import Timer from './Timer';
// import { passages, questions } from './readingData';

// interface ReadingModuleProps {
//   onComplete?: (answers: any) => void;
//   isFullTest?: boolean;
// }

// const ReadingModule: React.FC<ReadingModuleProps> = ({ onComplete, isFullTest = false }) => {
//   const [currentSection, setCurrentSection] = useState(0);
//   const [answers, setAnswers] = useState<Record<string, string>>({});
//   const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds

//   useEffect(() => {
//     if (timeLeft > 0) {
//       const timer = setInterval(() => {
//         setTimeLeft(prev => prev - 1);
//       }, 1000);
//       return () => clearInterval(timer);
//     } else if (isFullTest && onComplete) {
//       onComplete(answers);
//     }
//   }, [timeLeft, isFullTest, onComplete, answers]);

//   const handleAnswerChange = (questionId: string, answer: string) => {
//     setAnswers(prev => ({ ...prev, [questionId]: answer }));
//   };

//   const handleSubmit = () => {
//     if (onComplete) {
//       onComplete(answers);
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-6">
//       <div className="bg-white rounded-xl shadow-lg p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">Academic Reading Test</h2>
//           <div className="flex items-center space-x-4">
//             <Timer initialMinutes={1} />
//             {!isFullTest && (
//               <button
//                 onClick={handleSubmit}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Submit Test
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="flex gap-4 mb-6">
//           {[1, 2, 3, 4, 5].map((section, index) => (
//             <button
//               key={section}
//               onClick={() => setCurrentSection(index)}
//               className={`px-4 py-2 rounded-lg ${
//                 currentSection === index
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//               }`}
//             >
//               Passage {section}
//             </button>
//           ))}
//         </div>

//         <div className="grid md:grid-cols-2 gap-6">
//           <ReadingPassage passage={passages[currentSection]} />
//           <QuestionSection 
//             questions={questions[currentSection]}
//             answers={answers}
//             onAnswerChange={handleAnswerChange}
//           />
//         </div>

//         <div className="flex justify-between mt-6">
//           <button
//             onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
//             disabled={currentSection === 0}
//             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
//           >
//             <ChevronLeft size={20} /> Previous
//           </button>
//           <button
//             onClick={() => setCurrentSection(prev => Math.min(3, prev + 1))}
//             disabled={currentSection === 3}
//             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
//           >
//             Next <ChevronRight size={20} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReadingModule;

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import ReadingPassage from './ReadingPassage';
import QuestionSection from './QuestionSection';
import Timer from '@/components/Timer';
import ReadingTestResults from './ReadingTestResults'; // Assuming you've created this component in a file named TestResults.tsx
import { passages, questions } from './readingData'; // Make sure correctAnswers is exported from readingData

const TOTAL_SECTIONS = 5;
const FULL_TEST_TIME = 1 * 60; // 60 minutes in seconds

interface ReadingModuleProps {
  onComplete?: (answers: any) => void;
  isFullTest?: boolean;
  timeLimit?: number;
}

const ReadingModule: React.FC<ReadingModuleProps> = ({ onComplete, isFullTest = false, timeLimit = FULL_TEST_TIME }) => {
  const[currentSection, setCurrentSection] = useState(0);
  const[answers, setAnswers] = useState<Record<string, string>>({});
  const[timeLeft, setTimeLeft] = useState(timeLimit);
  const[showResults, setShowResults] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    if (timeLeft > 0 && !showResults) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isFullTest && onComplete && !showResults) {
      setShowResults(true); // Show results when time is up or test is completed
      if (timer) {
        clearInterval(timer);
      }
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  },[timeLeft, isFullTest, onComplete, showResults]);

  const handleAnswerChange = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev,[questionId]: answer }));
  }, []);

  const handleSubmit = useCallback(() => {
    setShowResults(true);
    if (onComplete) {
      onComplete(answers);
    }
  },[onComplete, answers]);

  const navigateSection = (direction: 'next' | 'prev') => {
    setCurrentSection(prev => Math.min(TOTAL_SECTIONS - 1, Math.max(0, direction === 'next' ? prev + 1 : prev - 1)));
  };

  if (showResults) {
    const correctAnswers = {};
    return <ReadingTestResults answers={answers} correctAnswers={correctAnswers} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Academic Reading Test</h2>
          <div className="flex items-center space-x-4">
            <Timer initialMinutes={timeLeft / 60} />
            {!isFullTest && (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                aria-label="Submit the test">
                Submit Test
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          {Array.from({ length: TOTAL_SECTIONS }, (_, i) => i).map(section => (
            <button
              key={section}
              onClick={() => setCurrentSection(section)}
              className={`px-4 py-2 rounded-lg ${currentSection === section ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              aria-label={`Go to Passage ${section + 1}`}>
              Passage {section + 1}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ReadingPassage passage={passages[currentSection]} />
          <QuestionSection 
            questions={questions[currentSection]}
            answers={answers}
            onAnswerChange={handleAnswerChange}
          />
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigateSection('prev')}
            disabled={currentSection === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            aria-label="Previous Section">
            <ChevronLeft size={20} /> Previous
          </button>
          <button
            onClick={() => navigateSection('next')}
            disabled={currentSection === TOTAL_SECTIONS - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            aria-label="Next Section">
            Next <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingModule;