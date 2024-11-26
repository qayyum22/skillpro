"use client";
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Timer from "../../Timer";
import WritingTask from "./WritingTask";
import WritingInstructions from "./WritingInstructions";
import { tasks } from "./WritingData";
import { toast } from "react-hot-toast";
import WritingResults from "./WritingResults";


interface WritingModuleProps {
  onComplete?: (answers: any) => void;
  isFullTest?: boolean;
}

const WritingModule: React.FC<WritingModuleProps> = ({
  onComplete,
  isFullTest = false,
}) => {
  const [currentTask, setCurrentTask] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({
    task1: "",
    task2: "",
  });
  const [evaluating, setEvaluating] = useState(false);

  const handleAnswerChange = (taskId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [taskId]: answer }));
  };

  const wordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleSubmit = async () => {
    setShowResults(true);
    setEvaluating(true);
    try {
      console.log("User Responses:", answers); // Print user responses on console

      // const evaluations = await Promise.all(
      //   Object.entries(answers).map(([taskId, response]) =>
      //     evaluateWriting({
      //       taskId,
      //       response,
      //       wordCount: wordCount(response)
      //     })
      //   )
      // );
      // console.log('Evaluations:', evaluations); // Print evaluations on console

      // if (onComplete) {
      //   onComplete(evaluations);
      // } else {
      //   toast.success('Writing evaluation completed successfully!');
      // }
    } catch (error) {
      toast.error("Failed to evaluate writing submissions");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {!showResults && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              General Training Writing Test
            </h2>
            <div className="flex items-center space-x-4">
              <Timer initialMinutes={60} />
              {!isFullTest && (
                <button
                  onClick={handleSubmit}
                  disabled={evaluating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    "Submit Test"
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            {["Task 1", "Task 2"].map((task, index) => (
              <button
                key={task}
                onClick={() => setCurrentTask(index)}
                className={`px-4 py-2 rounded-lg ${
                  currentTask === index
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {task}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <WritingInstructions task={tasks.tasks[currentTask]} />
            <WritingTask
              taskId={`task${currentTask + 1}`}
              value={answers[`task${currentTask + 1}`]}
              onChange={handleAnswerChange}
              wordCount={wordCount(answers[`task${currentTask + 1}`])}
              minWords={currentTask === 0 ? 150 : 250}
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentTask(0)}
              disabled={currentTask === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft size={20} /> Task 1
            </button>
            <button
              onClick={() => setCurrentTask(1)}
              disabled={currentTask === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            >
              Task 2 <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
      {showResults && <WritingResults />}
    </div>
  );
};

export default WritingModule;
