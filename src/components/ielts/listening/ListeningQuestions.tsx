import React from 'react';

interface Question {
  id: string;
  type: string;
  text: string;
  options?: string[];
  image?: string;
  maxLength?: number;
}

interface ListeningQuestionsProps {
  questions: Question[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
}

export const ListeningQuestions: React.FC<ListeningQuestionsProps> = ({
  questions,
  answers,
  onAnswerChange,
}) => {
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

      case 'form-completion':
        return (
          <input
            type="text"
            value={answers[question.id] || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            maxLength={question.maxLength}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type your answer here"
          />
        );

      case 'map-completion':
        return (
          <div className="space-y-4">
            {question.image && (
              <img
                src={question.image}
                alt="Map reference"
                className="w-full rounded-lg shadow-md mb-4"
              />
            )}
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => onAnswerChange(question.id, e.target.value)}
              maxLength={question.maxLength}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your answer here"
            />
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="A-F"
                  maxLength={1}
                  value={answers[`${question.id}_${index}`] || ''}
                  onChange={(e) => onAnswerChange(`${question.id}_${index}`, e.target.value.toUpperCase())}
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
    <div className="space-y-6">
      {questions.map((question, index) => (
        <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-800 mb-3">
            {index + 1}. {question.text}
          </p>
          {renderQuestion(question)}
        </div>
      ))}
    </div>
  );
};