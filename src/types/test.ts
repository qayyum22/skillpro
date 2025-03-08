export type IELTSTestType = 'writing' | 'speaking' | 'reading' | 'listening';
export type IELTSWritingCategory = 'academic' | 'general';
export type IELTSWritingTaskType = 'task1' | 'task2';
export type IELTSSpeakingPartType = 'part1' | 'part2' | 'part3';

export interface IELTSQuestion {
  id: string;
  text: string;
}

export interface IELTSSpeakingQuestion extends IELTSQuestion {
  followUp?: string[];
  cueCard?: {
    topic: string;
    bulletPoints: string[];
    preparationTime: number;
  };
}

export interface IELTSTask {
  partType: string;
  timeGuide: string;
  tips: string[];
}

export interface IELTSSpeakingTask extends IELTSTask {
  
  partType: 'part1' | 'part2' | 'part3';
  taskType: 'task1' | 'task2' | 'task3';
  title: string;
  description: string;
  questions: IELTSSpeakingQuestion[];
  timeGuide: string;
  tips: string[];
}

export interface IELTSWritingTask extends IELTSTask {
  taskType: "task1" | "task2";
  questions: IELTSQuestion[]; // Fixed the type to IELTSQuestion
  title: string;
  description: string;
  timeGuide: string;
  wordLimit: string;
  tips: string[]; // Moved tips inside the interface
  partType: string;
}

export interface IELTSTest {
  id: string;
  title: string;
  category?: IELTSWritingCategory;
  type: IELTSTestType;
  tasks: (IELTSSpeakingTask | IELTSWritingTask)[];
  createdAt: string;
  updatedAt: string;
}

export interface TestError {
  message: string;
  code: string;
}

export interface TestFilters {
  type?: IELTSTestType;
  category?: IELTSWritingCategory;
  search?: string;
  page: number;
  limit: number;
}

export interface TestResult {
  testId: string;
  userId: string;
  type: IELTSTestType;
  scores: {
    overall: number;
    fluency?: number;
    vocabulary?: number;
    grammar?: number;
    pronunciation?: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
  };
  recordings?: {
    [key: string]: {
      url: string;
      transcription?: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
} 