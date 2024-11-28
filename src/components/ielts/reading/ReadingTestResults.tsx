import React from 'react';

interface ReadingTestResultsProps {
  answers: Record<string, string>;
  correctAnswers: Record<string, string>;
}

const ReadingTestResults: React.FC<ReadingTestResultsProps> = ({ answers, correctAnswers }) => {
  // Calculate the number of correct answers
  const correctCount = Object.keys(answers).reduce((count, questionId) => {
    return answers[questionId] === correctAnswers[questionId] ? count + 1 : count;
  }, 0);

  // Calculate the score as a percentage
  const score = (correctCount / Object.keys(correctAnswers).length) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Test Results</h2>
        <div className="text-lg mb-4">
          <p><strong>Total Questions:</strong> {Object.keys(correctAnswers).length}</p>
          <p><strong>Correct Answers:</strong> {correctCount}</p>
          <p><strong>Score:</strong> {score.toFixed(2)}%</p>
        </div>
        
        <div className="my-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Answer Key:</h3>
          <ul className="list-disc pl-5">
            {Object.keys(correctAnswers).map(questionId => (
              <li key={questionId} className="mb-1">
                Question {questionId}: 
                <span className={answers[questionId] === correctAnswers[questionId] ? 'text-green-600' : 'text-red-600'}>
                  {' '}{answers[questionId] || 'Not Answered'} 
                  {answers[questionId] !== correctAnswers[questionId] ? ` (Correct: ${correctAnswers[questionId]})` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Retake Test
        </button>
      </div>
    </div>
  );
};

export default ReadingTestResults;