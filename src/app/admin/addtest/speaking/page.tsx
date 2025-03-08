'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// Removed Input and Textarea imports due to missing module errors
import { IELTSTest, IELTSSpeakingTask } from '@/types/test';
import { TestService } from '@/services/firebase';
import { toast } from 'sonner'; // Ensure 'sonner' is installed and imported correctly
import { Loader2, Plus, Trash, Eye, ArrowLeft, Save, Download } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

// Standard IELTS Speaking Test Instructions
const SPEAKING_TEST_INSTRUCTIONS = {
  general: "This is the IELTS Speaking test. The test is divided into three parts, and it will last for 11-14 minutes. The test is recorded.",
  part1: "Part 1 lasts for 4-5 minutes. You will be asked general questions about yourself and familiar topics such as your home, family, work, studies, and interests.",
  part2: "In Part 2, you will be given a task card with a topic and some points to include in your talk. You will have 1 minute to prepare and then you will need to speak for 1-2 minutes on the topic.",
  part3: "Part 3 lasts for 4-5 minutes. You will be asked more abstract questions related to the topic in Part 2. This part allows you to discuss more complex ideas and issues."
};

const AddSpeakingTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState<IELTSTest[]>([]);
  const [title, setTitle] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Part 1 Questions
  const [part1Questions, setPart1Questions] = useState<{
    id: string;
    text: string;
    followUp: string[];
  }[]>([{ id: '1', text: '', followUp: [''] }]);
  
  // Part 2 Questions (Cue Cards)
  const [part2Questions, setPart2Questions] = useState<{
    id: string;
    text: string;
    cueCard: {
      topic: string;
      bulletPoints: string[];
      preparationTime: number;
    };
  }[]>([{
    id: '1',
    text: '',
    cueCard: {
      topic: '',
      bulletPoints: ['', '', ''], // Initialize with 3 empty bullet points
      preparationTime: 60
    }
  }]);
  
  // Part 3 Questions
  const [part3Questions, setPart3Questions] = useState<{
    id: string;
    text: string;
    followUp: string[];
  }[]>([{ id: '1', text: '', followUp: [''] }]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      errors.title = 'Test title is required';
    }
    
    // Validate Part 1
    const part1Valid = part1Questions.every((q, idx) => {
      if (!q.text.trim()) {
        errors[`part1_${idx}`] = 'Question text is required';
        return false;
      }
      if (!q.followUp.every(f => f.trim())) {
        errors[`part1_followup_${idx}`] = 'Follow-up questions cannot be empty';
        return false;
      }
      return true;
    });
    
    // Validate Part 2
    const part2Valid = part2Questions.every((q, idx) => {
      if (!q.cueCard.topic.trim()) {
        errors[`part2_topic_${idx}`] = 'Topic is required';
        return false;
      }
      if (!q.cueCard.bulletPoints.every(p => p.trim())) {
        errors[`part2_points_${idx}`] = 'All bullet points are required';
        return false;
      }
      if (q.cueCard.preparationTime < 30 || q.cueCard.preparationTime > 120) {
        errors[`part2_time_${idx}`] = 'Preparation time must be between 30 and 120 seconds';
        return false;
      }
      return true;
    });
    
    // Validate Part 3
    const part3Valid = part3Questions.every((q, idx) => {
      if (!q.text.trim()) {
        errors[`part3_${idx}`] = 'Question text is required';
        return false;
      }
      if (!q.followUp.every(f => f.trim())) {
        errors[`part3_followup_${idx}`] = 'Follow-up questions cannot be empty';
        return false;
      }
      return true;
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Auto-save draft
  useEffect(() => {
    if (isDirty && !isPreview) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      
      const timer = setTimeout(async () => {
        try {
          const draftData = {
            title,
            part1Questions,
            part2Questions,
            part3Questions
          };
          localStorage.setItem('speaking_test_draft', JSON.stringify(draftData));
          setIsDirty(false);
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      }, 2000);
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [title, part1Questions, part2Questions, part3Questions, isDirty, isPreview]);

  // Load draft on mount
  useEffect(() => {
    const draftData = localStorage.getItem('speaking_test_draft');
    if (draftData) {
      try {
        const { title, part1Questions, part2Questions, part3Questions } = JSON.parse(draftData);
        setTitle(title);
        setPart1Questions(part1Questions);
        setPart2Questions(part2Questions);
        setPart3Questions(part3Questions);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const result = await TestService.getTests({
        type: 'speaking',
        page: 1,
        limit: 10
      });
      setTests(result.tests);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to fetch tests');
    }
  };

  // Modified handlers to mark form as dirty
  const handleTitleChange = (value: string) => {
    setTitle(value);
    setIsDirty(true);
  };

  const handlePart1QuestionChange = (index: number, value: string) => {
    setPart1Questions(prev => prev.map((q, i) => 
      i === index ? { ...q, text: value } : q
    ));
    setIsDirty(true);
  };

  const handlePart1FollowUpChange = (questionIndex: number, followUpIndex: number, value: string) => {
    setPart1Questions(prev => prev.map((q, i) => 
      i === questionIndex ? {
        ...q,
        followUp: q.followUp?.map((f, fi) => 
          fi === followUpIndex ? value : f
        ) || []
      } : q
    ));
    setIsDirty(true);
  };

  const addPart1Question = () => {
    setPart1Questions([...part1Questions, {
      id: (part1Questions.length + 1).toString(),
      text: '',
      followUp: ['']
    }]);
    setIsDirty(true);
  };

  const addPart1FollowUp = (questionIndex: number) => {
    const newQuestions = [...part1Questions];
    newQuestions[questionIndex].followUp.push('');
    setPart1Questions(newQuestions);
    setIsDirty(true);
  };

  const removePart1Question = (index: number) => {
    setPart1Questions(prev => prev.filter((_, i) => i !== index));
  };

  const removePart1FollowUp = (questionIndex: number, followUpIndex: number) => {
    setPart1Questions(prev => prev.map((q, i) => 
      i === questionIndex ? {
        ...q,
        followUp: q.followUp?.filter((_, fi) => fi !== followUpIndex)
      } : q
    ));
  };

  // Part 2 Handlers
  const handlePart2QuestionChange = (index: number, field: 'text' | 'preparationTime', value: string | number) => {
    setPart2Questions(prev => prev.map((q, i) => 
      i === index ? {
        ...q,
        [field]: value
      } : q
    ));
    setIsDirty(true);
  };

  const handlePart2BulletPointChange = (questionIndex: number, pointIndex: number, value: string) => {
    setPart2Questions(prev => prev.map((q, i) => 
      i === questionIndex ? {
        ...q,
        cueCard: {
          ...q.cueCard,
          bulletPoints: q.cueCard.bulletPoints.map((p, pi) => 
            pi === pointIndex ? value : p
          )
        }
      } : q
    ));
    setIsDirty(true);
  };

  const addPart2Question = () => {
    setPart2Questions([...part2Questions, {
      id: (part2Questions.length + 1).toString(),
      text: '',
      cueCard: {
        topic: '',
        bulletPoints: ['', '', ''],
        preparationTime: 60
      }
    }]);
    setIsDirty(true);
  };

  const removePart2Question = (index: number) => {
    setPart2Questions(prev => prev.filter((_, i) => i !== index));
  };

  const removePart2BulletPoint = (questionIndex: number, pointIndex: number) => {
    setPart2Questions(prev => prev.map((q, i) => 
      i === questionIndex ? {
        ...q,
        cueCard: {
          ...q.cueCard,
          bulletPoints: q.cueCard.bulletPoints.filter((_, pi) => pi !== pointIndex)
        }
      } : q
    ));
  };

  // Part 3 Handlers
  const handlePart3QuestionChange = (index: number, value: string) => {
    setPart3Questions(prev => prev.map((q, i) => 
      i === index ? { ...q, text: value } : q
    ));
    setIsDirty(true);
  };

  const handlePart3FollowUpChange = (questionIndex: number, followUpIndex: number, value: string) => {
    setPart3Questions(prev => prev.map((q, i) => 
      i === questionIndex ? {
        ...q,
        followUp: q.followUp?.map((f, fi) => 
          fi === followUpIndex ? value : f
        ) || []
      } : q
    ));
    setIsDirty(true);
  };

  const addPart3Question = () => {
    setPart3Questions([...part3Questions, {
      id: (part3Questions.length + 1).toString(),
      text: '',
      followUp: ['']
    }]);
    setIsDirty(true);
  };

  const addPart3FollowUp = (questionIndex: number) => {
    const newQuestions = [...part3Questions];
    newQuestions[questionIndex].followUp.push('');
    setPart3Questions(newQuestions);
    setIsDirty(true);
  };

  const removePart3Question = (index: number) => {
    setPart3Questions(prev => prev.filter((_, i) => i !== index));
  };

  const removePart3FollowUp = (questionIndex: number, followUpIndex: number) => {
    setPart3Questions(prev => prev.map((q, i) => 
      i === questionIndex ? {
        ...q,
        followUp: q.followUp?.filter((_, fi) => fi !== followUpIndex)
      } : q
    ));
  };

  // Add this function after the other utility functions
  const generateTestJSON = () => {
    const testData: Partial<IELTSTest> = {
      title,
      type: 'speaking',
      tasks: [
        {
          partType: 'part1',
          taskType: 'task1',
          title: 'Part 1',
          description: 'Part 1',
          questions: part1Questions,
          timeGuide: '4-5 minutes',
          wordLimit: '150-200 words',
          tips: ['Listen carefully to each question', 'Give detailed responses', 'Use examples from your personal experience']
        },
        {
          partType: 'part2',
          taskType: 'task2',
          title: 'Part 2',
          description: 'Part 2',
          questions: part2Questions,
          timeGuide: '3-4 minutes',
          wordLimit: '150-200 words',
          tips: ['Use your 1-minute preparation time wisely', 'Cover all bullet points', 'Structure your talk with an introduction and conclusion']
        },
        {
          partType: 'part3',
          taskType: 'task3',
          title: 'Part 3',
          description: 'Part 3',
          questions: part3Questions,
          timeGuide: '4-5 minutes',
          tips: ['Express and justify your opinions', 'Use advanced vocabulary and complex sentences', 'Stay relevant to the topic']
        }
      ]
    };
    return JSON.stringify(testData, null, 2);
  };

  const handleViewJSON = () => {
    const jsonString = generateTestJSON();
    // Create a modal-like div to show the JSON
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    modal.style.maxWidth = '90%';
    modal.style.maxHeight = '90vh';
    modal.style.overflow = 'auto';
    modal.style.zIndex = '1000';

    const pre = document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.wordBreak = 'break-word';
    pre.textContent = jsonString;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#4F46E5';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    };

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '999';
    overlay.onclick = () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    };

    modal.appendChild(pre);
    modal.appendChild(closeButton);
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
  };

  const handleDownloadJSON = () => {
    const jsonString = generateTestJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speaking_test_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Preview component
  const TestPreview = () => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-indigo-700">{title}</h2>
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={handleViewJSON}
              className="flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>View JSON</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadJSON}
              className="flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Download JSON</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPreview(false)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Edit Test</span>
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-indigo-600 text-white flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save Test</span>
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Test Instructions</h3>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-gray-700 mb-4">{SPEAKING_TEST_INSTRUCTIONS.general}</p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="part1" className="space-y-4">
          <TabsList>
            <TabsTrigger value="part1">Part 1</TabsTrigger>
            <TabsTrigger value="part2">Part 2</TabsTrigger>
            <TabsTrigger value="part3">Part 3</TabsTrigger>
          </TabsList>

          <TabsContent value="part1">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700">{SPEAKING_TEST_INSTRUCTIONS.part1}</p>
                </div>
                {part1Questions.map((question, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <Input
                          value={question.text}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePart1QuestionChange(index, e.target.value)}
                          placeholder={`Part 1 Question ${index + 1}`}
                          className="mb-2"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removePart1Question(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Follow-up questions */}
                    <div className="ml-4 space-y-2">
                      {question.followUp?.map((followUp, followUpIndex) => (
                        <div key={followUpIndex} className="flex items-center gap-2">
                          <Input
                            value={followUp}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePart1FollowUpChange(index, followUpIndex, e.target.value)}
                            placeholder="Follow-up question"
                            className="flex-grow"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removePart1FollowUp(index, followUpIndex)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPart1FollowUp(index)}
                      >
                        Add Follow-up
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="part2">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700">{SPEAKING_TEST_INSTRUCTIONS.part2}</p>
                </div>
                {part2Questions.map((question, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow space-y-2">
                        <Input
                          value={question.text}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePart2QuestionChange(index, 'text', e.target.value)}
                          placeholder="Topic"
                          className="mb-2"
                        />
                        {question.cueCard.bulletPoints.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-center gap-2">
                            <Input
                              value={point}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePart2BulletPointChange(index, pointIndex, e.target.value)}
                              placeholder={`Bullet point ${pointIndex + 1}`}
                              className="flex-grow"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removePart2BulletPoint(index, pointIndex)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removePart2Question(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="part3">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700">{SPEAKING_TEST_INSTRUCTIONS.part3}</p>
                </div>
                {part3Questions.map((question, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <Input
                          value={question.text}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePart3QuestionChange(index, e.target.value)}
                          placeholder={`Part 3 Question ${index + 1}`}
                          className="mb-2"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removePart3Question(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Follow-up questions */}
                    <div className="ml-4 space-y-2">
                      {question.followUp?.map((followUp, followUpIndex) => (
                        <div key={followUpIndex} className="flex items-center gap-2">
                          <Input
                            value={followUp}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePart3FollowUpChange(index, followUpIndex, e.target.value)}
                            placeholder="Follow-up question"
                            className="flex-grow"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removePart3FollowUp(index, followUpIndex)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPart3FollowUp(index)}
                      >
                        Add Follow-up
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      setIsPreview(false);
      return;
    }
    
    setLoading(true);

    try {
      const tasks: IELTSSpeakingTask[] = [
        {
          partType: 'part1',
          taskType: 'task1',
          title: 'Part 1',
          description: 'Part 1',
          questions: part1Questions.map(q => ({
            id: q.id,
            text: q.text,
            followUp: q.followUp
          })),
          timeGuide: '4-5 minutes',
          tips: [
            'Listen carefully to the questions',
            'Answer with full sentences',
            'Provide relevant examples',
            'Stay on topic'
          ]
        },
        {
          partType: 'part2',
          taskType: 'task2',
          title: 'Part 2',
          description: 'Part 2',
          questions: part2Questions.map(q => ({
            id: q.id,
            text: q.text,
            cueCard: {
              topic: q.cueCard.topic,
              bulletPoints: q.cueCard.bulletPoints,
              preparationTime: q.cueCard.preparationTime
            }
          })),
          timeGuide: '3-4 minutes',
          tips: [
            'Use your preparation time wisely',
            'Cover all points on the cue card',
            'Structure your response clearly',
            'Speak for the full time'
          ]
        },
        {
          partType: 'part3',
          taskType: 'task3',
          title: 'Part 3',
          description: 'Part 3',
          questions: part3Questions.map(q => ({
            id: q.id,
            text: q.text,
            followUp: q.followUp
          })),
          timeGuide: '4-5 minutes',
          tips: [
            'Express and justify opinions',
            'Use advanced vocabulary',
            'Discuss abstract concepts',
            'Provide detailed explanations'
          ]
        }
      ];

      const newTest = await TestService.addTest({
        title,
        type: 'speaking',
        tasks
      });

      toast.success('Speaking test created successfully!');
      setTests(prevTests => [...prevTests, newTest]);
      
      // Clear draft after successful submission
      localStorage.removeItem('speaking_test_draft');
      
      // Reset form
      setTitle('');
      setPart1Questions([{ id: '1', text: '', followUp: [''] }]);
      setPart2Questions([{
        id: '1',
        text: '',
        cueCard: {
          topic: '',
          bulletPoints: ['', '', ''],
          preparationTime: 60
        }
      }]);
      setPart3Questions([{ id: '1', text: '', followUp: [''] }]);
      setIsPreview(false);
      setFormErrors({});
      setIsDirty(false);
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Failed to create test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      await TestService.deleteTest(id);
      toast.success('Test deleted successfully');
      fetchTests();
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error('Failed to delete test');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Speaking Test</h1>
        <Link href="/admin/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {isPreview ? (
            <TestPreview />
          ) : (
            <>
              <div className="flex justify-end space-x-4 mb-4">
                <Button
                  variant="outline"
                  onClick={handleViewJSON}
                  className="flex items-center space-x-2"
                >
                  <Eye size={16} />
                  <span>View JSON</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadJSON}
                  className="flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download JSON</span>
                </Button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                setIsPreview(true);
              }} className="space-y-6">
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Test Details</h2>
                  <input
                    placeholder="Test Title"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    className="mb-4"
                  />
                </Card>

                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Part 1 - Introduction & Interview</h2>
                  {part1Questions.map((question, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <Input
                            value={question.text}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePart1QuestionChange(index, e.target.value)}
                            placeholder={`Part 1 Question ${index + 1}`}
                            className="mb-2"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removePart1Question(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Follow-up questions */}
                      <div className="ml-4 space-y-2">
                        {question.followUp?.map((followUp, followUpIndex) => (
                          <div key={followUpIndex} className="flex items-center gap-2">
                            <Input
                              value={followUp}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePart1FollowUpChange(index, followUpIndex, e.target.value)}
                              placeholder="Follow-up question"
                              className="flex-grow"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removePart1FollowUp(index, followUpIndex)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addPart1FollowUp(index)}
                        >
                          Add Follow-up
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPart1Question}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </Card>

                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Part 2 - Cue Card</h2>
                  {part2Questions.map((question, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow space-y-2">
                          <Input
                            value={question.text}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePart2QuestionChange(index, 'text', e.target.value)}
                            placeholder="Topic"
                            className="mb-2"
                          />
                          {question.cueCard.bulletPoints.map((point, pointIndex) => (
                            <div key={pointIndex} className="flex items-center gap-2">
                              <Input
                                value={point}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePart2BulletPointChange(index, pointIndex, e.target.value)}
                                placeholder={`Bullet point ${pointIndex + 1}`}
                                className="flex-grow"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => removePart2BulletPoint(index, pointIndex)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removePart2Question(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </Card>

                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Part 3 - Discussion</h2>
                  {part3Questions.map((question, qIndex) => (
                    <div key={question.id} className="mb-4 p-4 border rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <Input
                            value={question.text}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePart3QuestionChange(qIndex, e.target.value)}
                            placeholder={`Part 3 Question ${qIndex + 1}`}
                            className="mb-2"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removePart3Question(qIndex)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Follow-up questions */}
                      <div className="ml-4 space-y-2">
                        {question.followUp.map((followUp, fIndex) => (
                          <div key={fIndex} className="flex items-center gap-2">
                            <Input
                              value={followUp}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePart3FollowUpChange(qIndex, fIndex, e.target.value)}
                              placeholder="Follow-up Question"
                              className="flex-grow"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removePart3FollowUp(qIndex, fIndex)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPart3FollowUp(qIndex)}
                      >
                        Add Follow-up Question
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPart3Question}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </Card>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding Test...
                    </>
                  ) : (
                    'Add Test'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        <div>
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Existing Tests</h2>
            <div className="space-y-4">
              {tests.map((test) => (
                <div key={test.id} className="p-4 border rounded flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{test.title}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(test.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/ielts/speaking/test/${test.id}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTest(test.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddSpeakingTest;
