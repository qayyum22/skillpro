"use client";
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Timer from "../../common/Timer";
import WritingTask from "./WritingTask";
import WritingInstructions from "./WritingInstructions";
import { tasks } from "./WritingData";
import { toast } from "react-hot-toast";
import WritingResults from "./WritingResults";
import { IELTSTest, IELTSWritingTask } from '@/types/test';
import { useRouter } from 'next/navigation';
import { dummyIELTSTests } from '@/data/dummyTests';

interface WritingModuleProps {
  onComplete?: (answers: any) => void;
  isFullTest?: boolean;
}

interface StatusMessage {
  text: string;
  severity: "warning" | "info" | "error" | "success";
}

const WritingModule: React.FC<WritingModuleProps> = ({
  onComplete,
  isFullTest = false,
}) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({
    task1: "",
    task2: "",
  });
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [tests, setTests] = useState<IELTSTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<IELTSTest | null>(null);
  const [answer, setAnswer] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<'academic' | 'general'>('academic');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  
  const router = useRouter();

  const task1question = selectedTest ? selectedTest.tasks[0].description : tasks.tasks[0].description;
  const task1answer = answers.task1;
  const task2question = selectedTest ? selectedTest.tasks[1].description : tasks.tasks[1].description;
  const task2answer = answers.task2;

  useEffect(() => {
    fetchTests();
  }, [category]);

  useEffect(() => {
    if (answer) {
      // Count words by splitting on whitespace and filtering out empty strings
      const words = answer.split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [answer]);

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, you would fetch from the API
      // For now, we'll use dummy data
      setTimeout(() => {
        const filteredTests = dummyIELTSTests.filter(test => 
          test.type === 'writing' && test.category === category
        );
        setTests(filteredTests);
        setIsLoading(false);
      }, 800); // Simulate network delay
    } catch (error) {
      console.error('Error fetching tests:', error);
      setIsLoading(false);
    }
  };

  const handleSelectTest = (test: IELTSTest) => {
    setSelectedTest(test);
    setCurrentTaskIndex(0);
    setIsTestStarted(false);
    setIsTestCompleted(false);
    setAnswers({});

    // Initialize time for the first task
    if (test.tasks && test.tasks.length > 0) {
      const timeGuide = test.tasks[0].timeGuide;
      const minutes = parseInt(timeGuide.split(' ')[0]);
      setTimeRemaining(minutes * 60); // convert to seconds
    }
  };

  const handleStartTest = () => {
    setIsTestStarted(true);
    setTimerRunning(true);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
    setAnswers(prev => ({
      ...prev,
      [`task${currentTaskIndex + 1}`]: e.target.value
    }));
  };

  const handleNextTask = () => {
    // Save current task answer
    const currentTaskId = `task${currentTaskIndex + 1}`;
    
    // Check word count requirements
    const currentTask = selectedTest?.tasks[currentTaskIndex];
    const minWords = currentTask?.taskType === 'task1' ? 150 : 250;
    
    if (wordCount < minWords) {
      toast.error(`Please write at least ${minWords} words before proceeding.`);
      return;
    }
    
    // Move to next task
    if (currentTaskIndex < (selectedTest?.tasks.length || 0) - 1) {
      // Pause the current timer
      setTimerRunning(false);
      
      // Update the current task index
      setCurrentTaskIndex(prev => prev + 1);
      
      // Clear the answer input
      setAnswer('');
      
      // Set the time for the next task
      const nextTask = selectedTest?.tasks[currentTaskIndex + 1];
      if (nextTask) {
        const timeGuide = nextTask.timeGuide;
        const minutes = parseInt(timeGuide.split(' ')[0]);
        setTimeRemaining(minutes * 60);
        
        // Start the timer for the next task
        setTimeout(() => {
          setTimerRunning(true);
        }, 500);
      }
    } else {
      // Complete the test
      setIsTestCompleted(true);
      handleSubmitTest();
    }
  };

  const handleSubmitTest = () => {
    if (isFullTest) {
      if (onComplete) {
        onComplete(answers);
      }
      return;
    }
    
    handleSubmit();
  };

  const handleSubmit = async () => {
    setEvaluating(true);
    try {
      const response = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task1question, task1answer, task2question, task2answer }),
      });
  
      if (!response.ok) throw new Error("Failed to evaluate writing submissions");
  
      const { result } = await response.json();
      
      setEvaluationResults(result);
      setShowResults(true);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Failed to evaluate writing submissions");
    } finally {
      setEvaluating(false);
    }
  };
  
  const handleTimerEnd = () => {
    // Show time's up message
    setStatusMessage({ text: "Time's up for this task!", severity: "warning" });
    
    // Automatically move to the next task or finish the test
    if (currentTaskIndex < (selectedTest?.tasks.length || 0) - 1) {
      setStatusMessage({ text: "Moving to the next task...", severity: "info" });
      setTimeout(() => handleNextTask(), 2000);
    } else {
      setStatusMessage({ text: "Test completed!", severity: "info" });
      setIsTestCompleted(true);
      handleSubmitTest();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Display the test selection page
  if (!selectedTest) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">IELTS Writing Practice</h1>
          <p className="mb-4">
            Select the test type you want to practice:
          </p>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setCategory('academic')}
              className={`px-4 py-2 rounded ${
                category === 'academic' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setCategory('general')}
              className={`px-4 py-2 rounded ${
                category === 'general' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              General Training
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            {category === 'academic'
              ? 'Academic Writing is designed for those applying to undergraduate or postgraduate courses or seeking professional registration.'
              : 'General Training Writing is for those migrating to an English-speaking country or studying at below degree level.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.length === 0 ? (
            <p>No tests available. Please check back later.</p>
          ) : (
            tests.map(test => (
              <div 
                key={test.id} 
                className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => handleSelectTest(test)}
              >
                <h2 className="text-lg font-semibold mb-2">{test.title}</h2>
                <p className="text-sm text-gray-600 mb-2">
                  {test.category.charAt(0).toUpperCase() + test.category.slice(1)} Writing Test
                </p>
                <p className="text-xs text-gray-500">
                  {test.tasks.length} tasks | Created: {new Date(test.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Test is selected but not started
  if (!isTestStarted) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">{selectedTest.title}</h1>
          <p className="mb-6 text-gray-600">
            This test consists of {selectedTest.tasks.length} tasks. You will be given specific time for each task.
          </p>
          
          <div className="space-y-4 mb-6">
            {selectedTest.tasks.map((task, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h2 className="font-semibold">Task {index + 1}: {task.title}</h2>
                <p className="text-sm text-gray-600">Time: {task.timeGuide} | Word limit: {task.wordLimit}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Important Instructions:</h3>
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              <li>Complete each task within the given time.</li>
              <li>Meet the minimum word count requirement for each task.</li>
              <li>Write clearly and follow the task instructions carefully.</li>
              <li>You will be automatically moved to the next task when time expires.</li>
            </ul>
          </div>
          
          <button
            onClick={handleStartTest}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  // Test is completed
  if (isTestCompleted) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Test Completed</h1>
          <p className="mb-6 text-green-600">
            Your answers have been submitted successfully.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold mb-2">Your Responses:</h2>
            {Object.entries(answers).map(([taskId, response]) => (
              <div key={taskId} className="mb-4">
                <h3 className="font-medium">Task {taskId.replace('task', '')}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{response}</p>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Your responses will be evaluated and feedback will be provided shortly.
          </p>
          
          <button
            onClick={() => setSelectedTest(null)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Return to Tests
          </button>
        </div>
      </div>
    );
  }

  // Test is in progress
  const currentTask = selectedTest.tasks[currentTaskIndex];
  const taskNumber = currentTaskIndex + 1;
  const minWords = currentTask.taskType === 'task1' ? 150 : 250;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">
            Task {taskNumber}: {currentTask.title}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Words: <span className={wordCount < minWords ? 'text-red-500' : 'text-green-500'}>{wordCount}</span> / {minWords}+
            </div>
            <Timer 
              initialSeconds={timeRemaining}
              isRunning={timerRunning}
              onEnd={handleTimerEnd} 
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Instructions:</h2>
            <p className="mb-4 whitespace-pre-line">{currentTask.description}</p>
            
            <div className="text-sm text-gray-600 mb-4">
              <div>Time: {currentTask.timeGuide}</div>
              <div>Word Count: {currentTask.wordLimit}</div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Tips:</h3>
              <ul className="list-disc list-inside text-xs text-yellow-700 space-y-1">
                {currentTask.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <textarea
              value={answer}
              onChange={handleAnswerChange}
              placeholder="Write your answer here..."
              className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleNextTask}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                {currentTaskIndex < selectedTest.tasks.length - 1 ? 'Next Task' : 'Complete Test'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingModule;
