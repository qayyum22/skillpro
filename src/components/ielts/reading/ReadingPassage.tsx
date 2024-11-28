import React from 'react';

interface PassageProps {
  passage: {
    title: string;
    content: string;
  };
}

const ReadingPassage: React.FC<PassageProps> = ({ passage }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg h-[600px] overflow-y-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{passage.title}</h3>
      <div className="prose prose-sm max-w-none">
        {passage.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
            {paragraph.trim()}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ReadingPassage;