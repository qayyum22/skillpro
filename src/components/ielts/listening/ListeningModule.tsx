import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import Timer from '@/components/Timer';
import { ListeningQuestions } from './ListeningQuestions';
import { sections } from './listeningData';

interface ListeningModuleProps {
  onComplete?: (answers: Record<string, string>) => void;
  isFullTest?: boolean;
}

const ListeningModule: React.FC<ListeningModuleProps> = ({ onComplete, isFullTest = false }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPlaying, setIsPlaying] = useState(false);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handlePlayAudio = () => {
    setIsPlaying(true);
    // Audio playback logic would go here
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const handleCompleteTest = () => {
    if (onComplete) {
      onComplete(answers);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">IELTS Listening Test</h2>
          <Timer initialMinutes={1} />
        </div>

        <div className="flex gap-4 mb-6">
          {['Section 1', 'Section 2', 'Section 3', 'Section 4'].map((section, index) => (
            <button
              key={section}
              onClick={() => setCurrentSection(index)}
              className={`px-4 py-2 rounded-lg ${
                currentSection === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {sections[currentSection].title}
                </h3>
                <p className="text-sm text-gray-600">{sections[currentSection].description}</p>
              </div>
              <button
                onClick={handlePlayAudio}
                disabled={isPlaying}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isPlaying
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Volume2 size={20} />
                {isPlaying ? 'Playing...' : 'Play Audio'}
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <p>• Listen carefully as the audio will be played only once</p>
              <p>• You will have time to read the questions before the audio starts</p>
              <p>• Write your answers while listening</p>
            </div>
          </div>
        </div>

        <ListeningQuestions
          questions={sections[currentSection].questions}
          answers={answers}
          onAnswerChange={handleAnswerChange}
        />

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
            disabled={currentSection === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeft size={20} /> Previous Section
          </button>
          <button
            onClick={() => setCurrentSection(prev => Math.min(3, prev + 1))}
            disabled={currentSection === 3}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            Next Section <ChevronRight size={20} />
          </button>
        </div>

        {isFullTest && (
          <div className="mt-6">
            <button
              onClick={handleCompleteTest}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Complete Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningModule;