"use client"
import React from 'react';
import { CheckCircle2, XCircle, LineChart } from 'lucide-react';

interface EvaluationReportProps {
  result: {
    moduleScores: {
      listening: number;
      reading: number;
      writing: number;
      speaking: number;
    };
    overallBand: number;
    feedback: {
      [module: string]: {
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
      };
    };
  };
}

const EvaluationReport: React.FC<EvaluationReportProps> = ({ result }) => {
  const modules = ['Listening', 'Reading', 'Writing', 'Speaking'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Test Report</h2>
        <div className="mt-4">
          <span className="text-5xl font-bold text-blue-600">{result.overallBand}</span>
          <span className="text-gray-500 ml-2">Overall Band Score</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {modules.map((module) => {
          const score = result.moduleScores[module.toLowerCase() as keyof typeof result.moduleScores];
          return (
            <div key={module} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{module}</span>
                <span className="text-2xl font-bold text-blue-600">{score}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{ width: `${(score / 9) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-6">
        {modules.map((module) => {
          const feedback = result.feedback[module.toLowerCase()];
          return (
            <div key={module} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{module} Feedback</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="flex items-center text-green-600 font-medium mb-2">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Strengths
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="flex items-center text-red-600 font-medium mb-2">
                    <XCircle className="w-5 h-5 mr-2" />
                    Areas for Improvement
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {feedback.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="flex items-center text-blue-600 font-medium mb-2">
                    <LineChart className="w-5 h-5 mr-2" />
                    Suggestions
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {feedback.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download Report
        </button>
      </div>
    </div>
  );
};

export default EvaluationReport;