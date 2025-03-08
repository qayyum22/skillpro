import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Loader2, SkipForward, Volume2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { parts } from './speakingData';
import WaveSurfer from 'wavesurfer.js';
import VirtualExaminer from './VirtualExaminer';
import CueCard from './CueCard';
import Timer from '../../common/Timer';
import { analyzeSpeech } from '../../../services/speechAnalysis';
import { Button } from '@/components/ui/button';
import { IELTSSpeakingQuestion, IELTSTest, IELTSSpeakingTask, TestResult } from '@/types/test';
import { TestService } from '@/services/firebase';
import { SpeechAnalysisResult } from '@/services/speechAnalysis';
import { getAuth } from 'firebase/auth';

interface SpeakingModuleProps {
  onComplete?: (answers: any) => void;
  isFullTest?: boolean;
  testId?: string;
}

interface SpeakingResponse {
  questionId: string;
  recordingUrl: string;
  transcription?: string;
  analysis?: SpeechAnalysisResult;
}

const SpeakingModule: React.FC<SpeakingModuleProps> = ({ onComplete, isFullTest = false, testId }) => {
  const [currentTest, setCurrentTest] = useState<IELTSTest | null>(null);
  const [currentPartIndex, setCurrentPartIndex] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [responses, setResponses] = useState<SpeakingResponse[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparationActive, setIsPreparationActive] = useState(false);
  const [preparationTimeRemaining, setPreparationTimeRemaining] = useState(60);
  const [testCompleted, setTestCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedRecordings, setFailedRecordings] = useState<{blob: Blob; recordingId: string}[]>([]);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [examinerSpeaking, setExaminerSpeaking] = useState(false);
  const [speakingTimeRemaining, setSpeakingTimeRemaining] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [examinerMessage, setExaminerMessage] = useState<string>('Welcome to the IELTS Speaking Test. Let\'s begin with Part 1.');

  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const auth = getAuth();

  // Add speaking duration state and ref
  const [speakingDuration, setSpeakingDuration] = useState<number>(120); // 2 minutes default
  const autoSaveInProgress = useRef<boolean>(false);
  const recordingChunks = useRef<Blob[]>([]);

  // Improved WaveSurfer management
  const initializeWaveform = () => {
    if (waveformRef.current) {
      waveformRef.current.destroy();
      waveformRef.current = null;
    }

    if (waveformContainerRef.current) {
      waveformRef.current = WaveSurfer.create({
        container: waveformContainerRef.current,
        waveColor: '#6366F1',
        progressColor: '#4F46E5',
        cursorWidth: 1,
        height: 80,
        barWidth: 2,
        barGap: 3,
        interact: true,
      });

      waveformRef.current.on('error', (err: Error) => {
        console.error('WaveSurfer error:', err);
        toast.error('Error loading audio waveform');
      });
    }
  };

  // Initialize WaveSurfer with proper cleanup
  useEffect(() => {
    initializeWaveform();
    return () => {
      if (waveformRef.current) {
        waveformRef.current.destroy();
        waveformRef.current = null;
      }
    };
  }, []);

  // Load audio into WaveSurfer
  const loadAudioToWaveform = async (url: string) => {
    if (!waveformRef.current) {
      initializeWaveform();
    }
    try {
      await waveformRef.current?.load(url);
    } catch (error) {
      console.error('Error loading audio:', error);
      toast.error('Failed to load audio waveform');
    }
  };

  // Handle preparation complete
  const handlePreparationComplete = () => {
    setIsPreparing(false);
    speakExaminerMessage('Your preparation time is up. Please begin speaking about the topic.');
  };

  // Play recording
  const playRecording = () => {
    if (waveformRef.current) {
      waveformRef.current.play();
    }
  };

  // Handle next question
  const handleNextQuestion = () => {
    const currentPart = getCurrentPart();
    if (!currentPart) return;

    if (currentQuestionIndex < currentPart.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQuestion = currentPart.questions[currentQuestionIndex + 1];
      speakExaminerMessage(nextQuestion.text);
    } else if (currentPartIndex < 2) {
      setCurrentPartIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      if (currentPartIndex === 0) {
        setIsPreparing(true);
        speakExaminerMessage('Now, let\'s move on to Part 2. I\'ll give you a topic to talk about. You\'ll have 1 minute to prepare and 2 minutes to speak.');
      } else {
        speakExaminerMessage('Now, let\'s move on to Part 3. I\'ll ask you some questions related to the topic we just discussed.');
      }
    } else {
      completeTest();
    }
  };

  // Enhanced error handling for test data
  useEffect(() => {
    const validateTest = (test: IELTSTest | null): string | null => {
      if (!test) {
        return 'Test data not found';
      }

      if (test.type !== 'speaking') {
        return 'Invalid test type';
      }

      if (!Array.isArray(test.tasks) || test.tasks.length === 0) {
        return 'No test tasks found';
      }

      const hasValidParts = test.tasks.every((task, index) => {
        if (!task.partType || !['part1', 'part2', 'part3'].includes(task.partType)) {
          return false;
        }
        if (!Array.isArray(task.questions) || task.questions.length === 0) {
          return false;
        }
        return true;
      });

      if (!hasValidParts) {
        return 'Invalid test structure';
      }

      return null;
    };

    const fetchTest = async () => {
      try {
        let test: IELTSTest | null = null;
        
        if (testId) {
          test = await TestService.getTestById(testId);
        } else {
          const result = await TestService.getTests({
            type: 'speaking',
            page: 1,
            limit: 1
          });
          test = result.tests[0] || null;
        }

        const validationError = validateTest(test);
        if (validationError) {
          throw new Error(validationError);
        }

        setCurrentTest(test);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching test:', error);
        setError(error instanceof Error ? error.message : 'Failed to load test. Please try again.');
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  // Timer management
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPreparationActive && preparationTimeRemaining > 0) {
      timer = setInterval(() => {
        setPreparationTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handlePreparationComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPreparationActive, preparationTimeRemaining]);

  // Auto-save responses
  useEffect(() => {
    if (Object.keys(responses).length > 0 && !testCompleted) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      
      const timer = setTimeout(async () => {
        await autoSaveResponses();
      }, 5000);
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [responses, testCompleted]);

  // Initialize MediaRecorder with proper event handlers
  const initializeMediaRecorder = (stream: MediaStream) => {
    const recorder = new MediaRecorder(stream);
    
    recorder.addEventListener('dataavailable', (e: BlobEvent) => {
      recordingChunks.current.push(e.data);
    });
    
    recorder.addEventListener('stop', async () => {
      const blob = new Blob(recordingChunks.current, { type: 'audio/webm' });
      recordingChunks.current = [];
      const recordingId = `${currentPartIndex}_${currentQuestionIndex}`;
      await processRecording(blob, recordingId);
      setIsRecording(false);
    });
    
    return recorder;
  };

  // Start recording with proper initialization
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      recordingChunks.current = [];
      
      const recorder = initializeMediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      recorder.start();
      setIsRecording(true);
      
      // Start speaking timer
      setSpeakingTimeRemaining(speakingDuration);
      const timer = setInterval(() => {
        setSpeakingTimeRemaining(prev => {
          if (prev <= 1) {
            stopRecording();
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast.error('Microphone permission denied. Please allow microphone access to continue.');
      } else {
        toast.error('Failed to start recording. Please check your microphone.');
      }
      console.error('Recording error:', error);
    }
  };

  // Stop recording with proper cleanup
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Auto-save with concurrency control
  const autoSaveResponses = async () => {
    if (autoSaveInProgress.current) return;
    
    try {
      autoSaveInProgress.current = true;
      if (!auth.currentUser || !currentTest) return;

      await TestService.saveTestResult({
        testId: currentTest.id,
        userId: auth.currentUser.uid,
        type: 'speaking',
        scores: {
          overall: 0,
          fluency: 0,
          vocabulary: 0,
          grammar: 0,
          pronunciation: 0
        },
        feedback: {
          strengths: [],
          improvements: []
        },
        recordings: responses.reduce((acc, response) => ({
          ...acc,
          [response.questionId]: {
            url: response.recordingUrl,
            transcription: response.transcription
          }
        }), {})
      });
    } catch (error) {
      console.error('Error auto-saving responses:', error);
    } finally {
      autoSaveInProgress.current = false;
    }
  };

  // Resource cleanup with proper dependencies
  useEffect(() => {
    const urls = responses.map(response => response.recordingUrl);
    
    return () => {
      urls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (waveformRef.current) {
        waveformRef.current.destroy();
      }
    };
  }, [responses]);

  // Process recording with improved error handling
  const processRecording = async (blob: Blob, recordingId: string) => {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        if (!currentTest || !auth.currentUser) {
          throw new Error('Test or user not found');
        }

        const currentQuestion = getCurrentQuestion();
        if (!currentQuestion) {
          throw new Error('Current question not found');
        }

        const formData = new FormData();
        formData.append('audio', blob);
        formData.append('testId', currentTest.id);
        formData.append('userId', auth.currentUser.uid);
        formData.append('question', currentQuestion.text);
        
        if (currentQuestion.cueCard) {
          formData.append('topic', currentQuestion.cueCard.topic);
        }

        const response = await fetch('/api/analyze-speech', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to analyze speech: ${response.statusText}`);
        }

        const result = await response.json();
        const recordingUrl = URL.createObjectURL(blob);
        
        // Load audio into waveform
        await loadAudioToWaveform(recordingUrl);

        setResponses(prev => [
          ...prev,
          {
            questionId: recordingId,
            recordingUrl,
            transcription: result.transcription,
            analysis: result
          }
        ]);

        toast.success('Response recorded and analyzed successfully');
        break;
      } catch (error) {
        retryCount++;
        console.error(`Processing attempt ${retryCount} failed:`, error);
        
        if (retryCount === maxRetries) {
          toast.error('Failed to process recording after multiple attempts');
          setFailedRecordings(prev => [...prev, { blob, recordingId }]);
          break;
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }
  };

  // Retry failed recordings
  const retryFailedRecordings = async () => {
    const failedRecordingsCopy = [...failedRecordings];
    setFailedRecordings([]);
    
    for (const { blob, recordingId } of failedRecordingsCopy) {
      await processRecording(blob, recordingId);
    }
  };

  // Complete the test
  const completeTest = async () => {
    try {
      setTestCompleted(true);
      
      if (responses.length === 0) {
        toast.error('No responses recorded');
        return;
      }

      // Retry any failed recordings before completing
      if (failedRecordings.length > 0) {
        await retryFailedRecordings();
      }

      const lastResponse = responses[responses.length - 1];
      const averageScore = lastResponse?.analysis?.overall?.score || 0;
      
      await TestService.saveTestResult({
        testId: currentTest!.id,
        userId: auth.currentUser!.uid,
        type: 'speaking',
        scores: {
          overall: averageScore,
          fluency: lastResponse?.analysis?.fluency?.score || 0,
          vocabulary: lastResponse?.analysis?.vocabulary?.score || 0,
          grammar: lastResponse?.analysis?.grammar?.score || 0,
          pronunciation: lastResponse?.analysis?.pronunciation?.score || 0
        },
        feedback: {
          strengths: lastResponse?.analysis?.overall?.strengths || [],
          improvements: lastResponse?.analysis?.overall?.improvements || []
        },
        recordings: responses.reduce((acc, response) => ({
          ...acc,
          [response.questionId]: {
            url: response.recordingUrl,
            transcription: response.transcription
          }
        }), {})
      });

      speakExaminerMessage(`Thank you. The speaking test is now complete. Your estimated band score is ${averageScore.toFixed(1)}.`);
      
      if (onComplete) {
        onComplete({
          responses,
          finalScore: averageScore,
          feedback: lastResponse?.analysis?.overall || null
        });
      }
    } catch (error) {
      console.error('Error completing test:', error);
      toast.error('Failed to save test results. Please try again.');
    }
  };

  // Improved getCurrentPart with better type validation
  const getCurrentPart = (): IELTSSpeakingTask | null => {
    if (!currentTest?.tasks || !Array.isArray(currentTest.tasks)) {
      return null;
    }

    const part = currentTest.tasks[currentPartIndex];
    if (!part) {
      return null;
    }

    // Validate that this is a speaking task
    if (
      !('partType' in part) ||
      !['part1', 'part2', 'part3'].includes(part.partType) ||
      !('questions' in part) ||
      !Array.isArray(part.questions)
    ) {
      console.error('Invalid speaking task structure:', part);
      setError('Invalid test structure detected');
      return null;
    }

    return part as IELTSSpeakingTask;
  };

  // Get current question
  const getCurrentQuestion = (): IELTSSpeakingQuestion | null => {
    const currentPart = getCurrentPart();
    if (!currentPart?.questions) return null;
    return currentPart.questions[currentQuestionIndex];
  };
  
  // Function to simulate examiner speaking
  const speakExaminerMessage = (message: string) => {
    setExaminerMessage(message);
    setExaminerSpeaking(true);
    // Simulate examiner speaking time based on message length
    const speakingDuration = Math.max(2000, message.length * 50);
    setTimeout(() => {
      setExaminerSpeaking(false);
    }, speakingDuration);
  };
  
  // Render bullet points for Part 2
  const renderCueCardPoints = (): string[] => {
    const currentPart = getCurrentPart();
    if (!currentPart?.questions) return [];
    
    const currentQuestion = currentPart.questions[currentQuestionIndex];
    return currentQuestion?.cueCard?.bulletPoints || [];
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!currentTest) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No speaking test available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500" />
        </div>
      ) : testCompleted ? (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold">Test Complete!</h2>
          <div className="text-center mb-4">
            <span className="text-4xl font-bold text-indigo-700">
              {responses.length > 0 
                ? (responses.reduce((sum, response) => sum + (response.analysis?.overall?.score || 0), 0) / responses.length).toFixed(1)
                : "N/A"}
            </span>
            <p className="text-gray-600">Estimated Band Score</p>
          </div>
          <Button
            onClick={() => {
              if (onComplete) {
                onComplete({
                  responses,
                  finalScore: responses[responses.length - 1]?.analysis?.overall?.score || 0,
                  feedback: responses[responses.length - 1]?.analysis?.overall || null
                });
              }
            }}
            className="bg-indigo-600 text-white"
          >
            View Detailed Results
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-indigo-700">
                {currentTest?.title}
              </h2>
              <p className="text-gray-600">
                Part {currentPartIndex + 1}: {getCurrentPart()?.timeGuide}
              </p>
            </div>
          </div>

          <VirtualExaminer
            speaking={examinerSpeaking}
            message={examinerMessage}
          />

          {currentPartIndex === 1 && getCurrentQuestion()?.cueCard && (
            <CueCard
              topic={getCurrentQuestion()?.cueCard?.topic || ''}
              bulletPoints={getCurrentQuestion()?.cueCard?.bulletPoints || []}
              preparationTime={getCurrentQuestion()?.cueCard?.preparationTime || 60}
            />
          )}

          <div className="space-y-4">
            <div ref={waveformContainerRef} className="w-full h-32 bg-gray-100 rounded" />

            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                {currentPartIndex === 1 && isPreparing ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Preparation Time</p>
                    <div className="text-lg font-bold">{preparationTimeRemaining}s</div>
                  </div>
                ) : (
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={evaluating || (currentPartIndex === 1 && isPreparing)}
                    className={`p-6 rounded-full ${
                      isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Button>
                )}
              </div>

              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-1">
                  {currentPartIndex === 1 && isPreparing ? 'Speaking begins in:' : 'Speaking Time Remaining:'}
                </p>
                <div className="text-lg font-bold">
                  {speakingTimeRemaining}s
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleNextQuestion}
                disabled={isRecording || evaluating || (currentPartIndex === 1 && isPreparing)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Next Question
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakingModule;
