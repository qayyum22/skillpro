import React, { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';

interface VirtualExaminerProps {
  speaking: boolean;
  message: string;
  examinerImage?: string;
}

const VirtualExaminer: React.FC<VirtualExaminerProps> = ({
  speaking,
  message,
  examinerImage = '/images/examiner-placeholder.jpg'
}) => {
  const [displayedMessage, setDisplayedMessage] = useState(message);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation effect when examiner starts speaking
  useEffect(() => {
    setDisplayedMessage(message);
    if (speaking) {
      setIsAnimating(true);
    } else {
      // Stop animation after a small delay
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [speaking, message]);

  return (
    <div className="bg-indigo-50 p-4 rounded-lg mb-6 flex items-start">
      <div className="relative flex-shrink-0 mr-4">
        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${speaking ? 'border-indigo-500 shadow-lg' : 'border-gray-300'}`}>
          <img 
            src={examinerImage} 
            alt="IELTS Examiner" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=IELTS+Examiner&background=4F46E5&color=fff';
            }}
          />
        </div>
        {speaking && (
          <div className="absolute -right-1 -bottom-1 bg-indigo-600 rounded-full p-1">
            <Volume2 size={16} className="text-white" />
          </div>
        )}
      </div>

      <div className="flex-grow">
        <h3 className="font-semibold text-indigo-800 mb-1">Examiner</h3>
        <div className="bg-white p-3 rounded-lg shadow-sm relative">
          <p className="text-gray-700">{displayedMessage}</p>
          
          {/* Speech animation indicators */}
          {isAnimating && (
            <div className="absolute -bottom-1 left-4 flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" style={{ animationDelay: '600ms' }}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualExaminer;
