import React from 'react';

interface Question {
  id: string;
  type: string;
  text: string;
  options?: string[];
  blanks?: number;
}

interface QuestionSectionProps {
  questions: Question[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ questions, answers, onAnswerChange }) => {
  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => onAnswerChange(question.id, e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="space-x-4">
            {question.options?.map((option, index) => (
              <label key={index} className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => onAnswerChange(question.id, e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'completion':
        return (
          <div className="space-y-2">
            {Array.from({ length: question.blanks || 1 }).map((_, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Answer ${index + 1}`}
                value={answers[`${question.id}_${index}`] || ''}
                onChange={(e) => onAnswerChange(`${question.id}_${index}`, e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ))}
          </div>
          );

          case 'dropdown':
            return (
              <div className="space-y-2">
                <select
                  value={answers[question.id] || ''}
                  onChange={(e) => onAnswerChange(question.id, e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label={`Select an option for ${question.text}`}
                >
                  <option value="" disabled>Select a heading</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
                  ))}
                </select>
              </div>
            );

      case 'matching':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Match letter"
                  value={answers[`${question.id}_${index}`] || ''}
                  onChange={(e) => onAnswerChange(`${question.id}_${index}`, e.target.value)}
                  className="w-16 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg h-[600px] overflow-y-auto">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">Questions</h3>
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="p-4 bg-white rounded-lg shadow-sm">
            <p className="font-medium text-gray-800 mb-3">
              {index + 1}. {question.text}
            </p>
            {renderQuestion(question)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionSection;