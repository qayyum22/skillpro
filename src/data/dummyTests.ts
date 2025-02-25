import { IELTSTest } from "@/types/test";

export const dummyIELTSTests: IELTSTest[] = [
  {
    id: "1",
    title: "IELTS Academic Writing Test 1",
    category: "academic",
    type: "writing",
    tasks: [
      {
        taskType: "task1",
        title: "Academic Task 1: Chart Analysis",
        description: "The graph below shows the consumption of fish and different types of meat in a European country between 1979 and 2004. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
        timeGuide: "20 minutes",
        wordLimit: "Minimum 150 words",
        tips: [
          "Spend about 20 minutes on this task",
          "Describe the main trends and significant changes",
          "Make comparisons between data points",
          "Do not give your opinion or explain causes"
        ]
      },
      {
        taskType: "task2",
        title: "Academic Task 2: Essay",
        description: "Some people believe that technological innovations have made our lives more complicated rather than simpler. To what extent do you agree or disagree with this opinion?",
        timeGuide: "40 minutes",
        wordLimit: "Minimum 250 words",
        tips: [
          "Spend about 40 minutes on this task",
          "Plan your essay structure before writing",
          "Include an introduction, body paragraphs, and conclusion",
          "Support your opinions with examples and explanations",
          "Check your grammar and spelling"
        ]
      }
    ],
    createdAt: new Date("2024-03-01").toISOString(),
    updatedAt: new Date("2024-03-01").toISOString(),
  },
  {
    id: "2",
    title: "IELTS General Training Writing Test 1",
    category: "general",
    type: "writing",
    tasks: [
      {
        taskType: "task1",
        title: "General Task 1: Letter Writing",
        description: "Your English-speaking friend has asked for your help with a college project they are doing about celebrating New Year in different countries. Write a letter to your friend. In your letter:\n• say how important New Year is to people in your country\n• describe how New Year is celebrated in your country\n• explain what you like about New Year celebrations in your country",
        timeGuide: "20 minutes",
        wordLimit: "Minimum 150 words",
        tips: [
          "Spend no more than 20 minutes on this task",
          "You do NOT need to write any addresses",
          "Begin your letter as follows: Dear .....................",
          "Use an appropriate tone (friendly for personal letters, formal for official letters)"
        ]
      },
      {
        taskType: "task2",
        title: "General Task 2: Essay",
        description: "Some people say that it is better to work for a large company than a small one. Do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
        timeGuide: "40 minutes",
        wordLimit: "Minimum 250 words",
        tips: [
          "Spend about 40 minutes on this task",
          "Write a well-structured essay with clear paragraphs",
          "Provide specific examples to support your views",
          "Use a range of vocabulary and grammatical structures"
        ]
      }
    ],
    createdAt: new Date("2024-03-02").toISOString(),
    updatedAt: new Date("2024-03-02").toISOString(),
  }
]; 