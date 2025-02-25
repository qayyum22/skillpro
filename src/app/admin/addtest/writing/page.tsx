"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { toast } from "react-hot-toast";
import { IELTSTest, IELTSWritingTask, IELTSWritingCategory } from "@/types/test";
import { Analytics } from "@/utils/analytics"; 
import { ErrorBoundary } from "react-error-boundary";

const ITEMS_PER_PAGE = 10;

const AddTest = () => {
  const { user, loading } = useAuth(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tests, setTests] = useState<IELTSTest[]>([]);
  const [category, setCategory] = useState<IELTSWritingCategory>("academic");
  const [title, setTitle] = useState("");
  const [task1, setTask1] = useState<IELTSWritingTask>({
    taskType: "task1",
    title: "",
    description: "",
    timeGuide: "20 minutes",
    wordLimit: "Minimum 150 words",
    tips: [""],
  });
  const [task2, setTask2] = useState<IELTSWritingTask>({
    taskType: "task2",
    title: "",
    description: "",
    timeGuide: "40 minutes",
    wordLimit: "Minimum 250 words",
    tips: [""],
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    type: 'writing',
    category: 'all'
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<IELTSTest | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, [filters]);

  const fetchTests = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        search: searchTerm
      } as any);

      const response = await fetch(`/api/fetch-test?${queryParams}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tests");
      }

      const { data, total } = await response.json();
      setTests(data);
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Error fetching tests");
      console.error("Error fetching tests:", error);
    }
  };

  // Handle tips array for task1
  const handleTask1TipChange = (index: number, value: string) => {
    const newTips = [...task1.tips];
    newTips[index] = value;
    setTask1({ ...task1, tips: newTips });
  };

  const addTask1Tip = () => {
    setTask1({ ...task1, tips: [...task1.tips, ""] });
  };

  const removeTask1Tip = (index: number) => {
    const newTips = task1.tips.filter((_, i) => i !== index);
    setTask1({ ...task1, tips: newTips });
  };

  // Handle tips array for task2
  const handleTask2TipChange = (index: number, value: string) => {
    const newTips = [...task2.tips];
    newTips[index] = value;
    setTask2({ ...task2, tips: newTips });
  };

  const addTask2Tip = () => {
    setTask2({ ...task2, tips: [...task2.tips, ""] });
  };

  const removeTask2Tip = (index: number) => {
    const newTips = task2.tips.filter((_, i) => i !== index);
    setTask2({ ...task2, tips: newTips });
  };

  const handleAddTest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      Analytics.track('test_creation_started', { category });

      // Validate form
      if (!title.trim()) {
        throw new Error("Test title is required");
      }

      if (!task1.title.trim() || !task1.description.trim()) {
        throw new Error("Task 1 title and description are required");
      }

      if (!task2.title.trim() || !task2.description.trim()) {
        throw new Error("Task 2 title and description are required");
      }

      const testData = {
        title,
        category,
        type: 'writing',
        tasks: [task1, task2]
      };

      const response = await fetch("/api/add-test", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      await response.json();
      toast.success("Test added successfully");
      Analytics.track('test_creation_completed', { category });

      // Reset form
      setTitle("");
      setTask1({
        taskType: "task1",
        title: "",
        description: "",
        timeGuide: "20 minutes",
        wordLimit: "Minimum 150 words",
        tips: [""],
      });
      setTask2({
        taskType: "task2",
        title: "",
        description: "",
        timeGuide: "40 minutes",
        wordLimit: "Minimum 250 words",
        tips: [""],
      });

      fetchTests(); // Refresh the list
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Error adding test");
      Analytics.track('test_creation_failed', { error: err.message, category });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTest = (test: IELTSTest) => {
    setCurrentTest(test);
    setIsViewModalOpen(true);
  };

  const handleDeleteTest = async (id: string) => {
    if (confirmDelete === id) {
      try {
        const response = await fetch(`/api/delete-test/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete test");
        }

        toast.success("Test deleted successfully");
        fetchTests(); // Refresh the list
        setConfirmDelete(null);
      } catch (error: unknown) {
        const err = error as Error;
        toast.error(err.message || "Error deleting test");
      }
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000); // Reset after 3 seconds
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex space-x-2 text-gray-600">
          <li><a href="/admin">Admin</a></li>
          <li>/</li>
          <li><a href="/admin/addtest">Tests</a></li>
          <li>/</li>
          <li className="text-gray-900">Writing</li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold mb-6">IELTS Writing Test Management</h1>

      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add New IELTS Writing Test</h2>
        <form onSubmit={handleAddTest} className="space-y-6">
          <div>
            <label htmlFor="test-category" className="block text-sm font-medium text-gray-700">
              Test Category
            </label>
            <select
              id="test-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as IELTSWritingCategory)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="academic">Academic</option>
              <option value="general">General Training</option>
            </select>
          </div>

          <div>
            <label htmlFor="test-title" className="block text-sm font-medium text-gray-700">
              Test Title
            </label>
            <input
              type="text"
              id="test-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., IELTS Academic Writing Test 1"
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">
              {category === "academic" ? "Academic Task 1" : "General Training Task 1"}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="task1-title" className="block text-sm font-medium text-gray-700">
                  Task 1 Title
                </label>
                <input
                  type="text"
                  id="task1-title"
                  value={task1.title}
                  onChange={(e) => setTask1({ ...task1, title: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Chart Analysis (Academic) or Letter Writing (General)"
                />
              </div>

              <div>
                <label htmlFor="task1-description" className="block text-sm font-medium text-gray-700">
                  Task 1 Question/Prompt
                </label>
                <textarea
                  id="task1-description"
                  value={task1.description}
                  onChange={(e) => setTask1({ ...task1, description: e.target.value })}
                  required
                  rows={5}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={category === "academic" 
                    ? "Describe the chart/graph and report the main features..." 
                    : "Write a letter to..."}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task1-time" className="block text-sm font-medium text-gray-700">
                    Time Guide
                  </label>
                  <input
                    type="text"
                    id="task1-time"
                    value={task1.timeGuide}
                    onChange={(e) => setTask1({ ...task1, timeGuide: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="task1-wordlimit" className="block text-sm font-medium text-gray-700">
                    Word Limit
                  </label>
                  <input
                    type="text"
                    id="task1-wordlimit"
                    value={task1.wordLimit}
                    onChange={(e) => setTask1({ ...task1, wordLimit: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tips for Students
                </label>
                {task1.tips.map((tip, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => handleTask1TipChange(index, e.target.value)}
                      className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Add a helpful tip"
                    />
                    <button
                      type="button"
                      onClick={() => removeTask1Tip(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTask1Tip}
                  className="text-blue-600 hover:text-blue-800"
                >
                  + Add Tip
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Task 2 (Essay)</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="task2-title" className="block text-sm font-medium text-gray-700">
                  Task 2 Title
                </label>
                <input
                  type="text"
                  id="task2-title"
                  value={task2.title}
                  onChange={(e) => setTask2({ ...task2, title: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Essay on Technology"
                />
              </div>

              <div>
                <label htmlFor="task2-description" className="block text-sm font-medium text-gray-700">
                  Task 2 Question/Prompt
                </label>
                <textarea
                  id="task2-description"
                  value={task2.description}
                  onChange={(e) => setTask2({ ...task2, description: e.target.value })}
                  required
                  rows={5}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Write an essay discussing..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task2-time" className="block text-sm font-medium text-gray-700">
                    Time Guide
                  </label>
                  <input
                    type="text"
                    id="task2-time"
                    value={task2.timeGuide}
                    onChange={(e) => setTask2({ ...task2, timeGuide: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="task2-wordlimit" className="block text-sm font-medium text-gray-700">
                    Word Limit
                  </label>
                  <input
                    type="text"
                    id="task2-wordlimit"
                    value={task2.wordLimit}
                    onChange={(e) => setTask2({ ...task2, wordLimit: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tips for Students
                </label>
                {task2.tips.map((tip, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => handleTask2TipChange(index, e.target.value)}
                      className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Add a helpful tip"
                    />
                    <button
                      type="button"
                      onClick={() => removeTask2Tip(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTask2Tip}
                  className="text-blue-600 hover:text-blue-800"
                >
                  + Add Tip
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isSubmitting ? "Adding Test..." : "Add Test"}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Existing Tests</h2>
          <div className="flex space-x-2">
            <input
              type="search"
              placeholder="Search tests..."
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => {
                setFilters(f => ({ ...f, page: 1 }));
                fetchTests();
              }}
              className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="category-filter" className="mr-2 text-sm font-medium text-gray-700">
            Category:
          </label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="academic">Academic</option>
            <option value="general">General Training</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No tests found. Add your first test above.
                  </td>
                </tr>
              )}
              {tests.map((test) => (
                <tr key={test.id}>
                  <td className="px-6 py-4">{test.title}</td>
                  <td className="px-6 py-4 capitalize">{test.category}</td>
                  <td className="px-6 py-4">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewTest(test)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test.id)}
                      className={`${
                        confirmDelete === test.id 
                          ? "text-red-800 font-bold" 
                          : "text-red-600 hover:text-red-900"
                      }`}
                    >
                      {confirmDelete === test.id ? "Confirm Delete" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Page {filters.page} of {totalPages || 1}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              disabled={filters.page === 1}
              className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              disabled={filters.page === totalPages || totalPages === 0}
              className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Test View Modal */}
      {isViewModalOpen && currentTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">{currentTest.title}</h2>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Category: <span className="capitalize">{currentTest.category}</span> | 
                  Created: {new Date(currentTest.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-6 space-y-6">
                {currentTest.tasks.map((task, index) => (
                  <div key={index} className="border-t pt-4">
                    <h3 className="font-medium text-lg">{task.title}</h3>
                    <p className="mt-2 whitespace-pre-line">{task.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div>
                        <span className="font-medium">Time Guide:</span> {task.timeGuide}
                      </div>
                      <div>
                        <span className="font-medium">Word Limit:</span> {task.wordLimit}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-sm">Tips for Students:</h4>
                      <ul className="list-disc pl-5 mt-1 text-sm">
                        {task.tips.map((tip, tipIndex) => (
                          <li key={tipIndex}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TestManagementWithErrorBoundary = () => (
  <ErrorBoundary
    fallback={<div className="p-6">Something went wrong. Please try again later.</div>}
    onError={(error) => {
      console.error('Error in test management:', error);
      Analytics.track('test_management_error', { error: error.message });
    }}
  >
    <AddTest />
  </ErrorBoundary>
);

export default TestManagementWithErrorBoundary;
