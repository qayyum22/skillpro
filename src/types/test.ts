export type IELTSTestType = 'writing' | 'speaking' | 'reading' | 'listening';
export type IELTSWritingCategory = 'academic' | 'general';
export type IELTSWritingTaskType = 'task1' | 'task2';

export interface IELTSWritingTask {
  taskType: IELTSWritingTaskType;
  title: string;
  description: string;
  timeGuide: string;
  wordLimit: string;
  tips: string[];
  sampleAnswer?: string;
}

export interface IELTSTest {
  id: string;
  title: string;
  category: IELTSWritingCategory;
  type: IELTSTestType;
  tasks: IELTSWritingTask[];
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