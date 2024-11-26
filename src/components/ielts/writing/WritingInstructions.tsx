import React from 'react';

interface Task {
  type: string;
  title: string;
  description: string;
  imageUrl?: string;
  timeGuide: string;
  wordLimit: string;
  tips: string[];
}

interface WritingInstructionsProps {
  task: Task;
}

const WritingInstructions: React.FC<WritingInstructionsProps> = ({ task }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
          <p className="text-gray-700 p-2 border-solid border-2 border-indigo-600  rounded-md whitespace-pre-line">{task.description}</p>
        </div>

        {task.imageUrl && (
          <div className="my-4">
            <img
              src={task.imageUrl}
              alt="Task visual"
              className="w-full rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Time Guide:</span>
              <p className="text-gray-800">{task.timeGuide}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Word Limit:</span>
              <p className="text-gray-800">{task.wordLimit}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <span className="text-sm font-medium text-gray-600">Tips:</span>
            <ul className="mt-2 space-y-2">
              {task.tips.map((tip, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingInstructions;