import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import EvaluationReport from './EvaluationReport';

interface TestResultsProps {
  answers: {
    listening: Record<string, string>;
    reading: Record<string, string>;
    writing: Array<{
      taskId: string;
      response: string;
      wordCount: number;
    }>;
    speaking: Array<{
      partId: string;
      audioUrl: string;
      duration: number;
    }>;
  };
}

const TestResults: React.FC<TestResultsProps> = ({ answers }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const testReport = "report";
        setResult(testReport);
      } catch (err) {
        setError('Failed to generate test report. Please try again.' + err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [answers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Generating your test report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <EvaluationReport result={result} />
      
      <button
        onClick={() => router.push('/dashboard')}
        className="mt-8 flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Return to Dashboard
      </button>
    </div>
  );
};

export default TestResults;