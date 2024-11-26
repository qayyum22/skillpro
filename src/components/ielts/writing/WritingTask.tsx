import React from 'react';

interface WritingTaskProps {
  taskId: string;
  value: string;
  onChange: (taskId: string, value: string) => void;
  wordCount: number;
  minWords: number;
}

const WritingTask: React.FC<WritingTaskProps> = ({
  taskId,
  value,
  onChange,
  wordCount,
  minWords,
}) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Your Response</h3>
        <div className="text-sm">
          <span className={`font-medium ${wordCount < minWords ? 'text-red-600' : 'text-green-600'}`}>
            {wordCount} words
          </span>
          <span className="text-gray-500"> (min: {minWords})</span>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(taskId, e.target.value)}
        className="w-full h-[500px] p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        placeholder="Start writing your response here..."
      />
    </div>
  );
};

export default WritingTask;