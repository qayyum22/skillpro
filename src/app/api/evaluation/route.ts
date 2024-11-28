import { toast } from 'react-hot-toast';

interface WritingEvaluation {
  taskId: string;
  response: string;
  wordCount: number;
}

interface SpeakingEvaluation {
  partId: string;
  audioUrl: string;
  duration: number;
}

interface EvaluationResponse {
  score: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  bandDescriptors: {
    taskAchievement?: number;
    coherenceCohesion?: number;
    lexicalResource?: number;
    grammaticalRange?: number;
    pronunciation?: number;
    fluency?: number;
  };
}

interface TestResult {
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
}

const API_URL = process.env.VITE_API_URL;

export const evaluateWriting = async (data: WritingEvaluation): Promise<EvaluationResponse> => {
  try {
    const response = await fetch(`${API_URL}/evaluate/writing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to evaluate writing');
    }

    return response.json();
  } catch (error) {
    toast.error('Failed to evaluate writing submission');
    throw error;
  }
};

export const evaluateSpeaking = async (data: SpeakingEvaluation): Promise<EvaluationResponse> => {
  try {
    const response = await fetch(`${API_URL}/evaluate/speaking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to evaluate speaking');
    }

    return response.json();
  } catch (error) {
    toast.error('Failed to evaluate speaking submission');
    throw error;
  }
};

export const generateTestReport = async (
  testId: string,
  moduleResults: {
    listening: Record<string, string>;
    reading: Record<string, string>;
    writing: WritingEvaluation[];
    speaking: SpeakingEvaluation[];
  }
): Promise<TestResult> => {
  try {
    const response = await fetch(`${API_URL}/evaluate/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testId,
        moduleResults,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate test report');
    }

    return response.json();
  } catch (error) {
    toast.error('Failed to generate test report');
    throw error;
  }
};