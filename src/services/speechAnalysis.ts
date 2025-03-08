import axios from 'axios';

export interface SpeechAnalysisResult {
  fluency: {
    score: number;
    examples: string[];
    feedback: string;
  };
  vocabulary: {
    score: number;
    examples: string[];
    feedback: string;
  };
  grammar: {
    score: number;
    examples: string[];
    feedback: string;
  };
  pronunciation: {
    score: number;
    examples: string[];
    feedback: string;
  };
  overall: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
}

export const analyzeSpeech = async (audioBlob: Blob, transcript: string): Promise<SpeechAnalysisResult> => {
  try {
    // Create form data for the audio file
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('transcript', transcript);
    
    // Send to the API endpoint
    const response = await axios.post('/api/analyze-speech', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing speech:', error);
    throw new Error('Failed to analyze speech recording');
  }
};

// Function to get the band score description
export const getBandScoreDescription = (score: number): string => {
  if (score >= 8.5) return 'Expert';
  if (score >= 7.5) return 'Very Good';
  if (score >= 6.5) return 'Good';
  if (score >= 5.5) return 'Competent';
  if (score >= 5.0) return 'Modest';
  if (score >= 4.0) return 'Limited';
  if (score >= 3.0) return 'Extremely Limited';
  return 'Non-user';
}; 