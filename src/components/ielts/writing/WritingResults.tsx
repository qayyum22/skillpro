"use client"
import React, { useState } from "react";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Feedback {
    content: string;
    score: number;
    breakdown: {
        taskAchievement: number;
        coherenceCohesion: number;
        lexicalResource: number;
        grammaticalAccuracy: number;
    };
}

interface EvaluationResult {
    taskNumber: number;
    prompt: string;
    userAnswer: string;
    modelAnswer: string;
    feedback: Feedback;
}


    // const evaluationResults = [
    //     {
    //         taskNumber: 1,
    //         prompt: "You recently missed a flight. You think this was the airline’s fault. Write a letter to the airline. In your letter, \n\n •explain why u believe airline is at fault \n\n •describe the impact it had on your journey. \n\n •say what you want the airline to do",
    //         userAnswer: "Dear Sir or Madam,\n\nI hope this letter finds you well. I am writing this letter to express dissatisfaction regarding my flight.\n\nAllow me to elaborate on the problem. Firstly, this is my first experience choosing your airline company for my trip, my flight was scheduled on June 22nd,2022, departed from Paris at 2AM and arrived in Japan at 3PM with flight number SA123. However, your airline company didn't provide any announcement about the early departure. Therefore, I missed my flight.\n\nFurthermore, I have already prepared my travel plan ahead, including the hotel that I booked and the tickets for tourist attractions. Additionally, I also promise to meet my friend but I have no choice but to cancel all the occasions due to this inconvenience.\n\n As a compensation, I would like the company to investigate this issue promptly and kindly request the airline company to cover all my costs for my trip. Moreover, I suggested that your company could be more professional when informing the reschedule flight as fast as possible.\n\nI look forward to your understanding and reply.\n\nYour Sincerely,\n\nJun",
    //         modelAnswer: "Dear sir,\nI hope this letter finds you well. I am writing regarding a flight I missed due to the negligence of your airline’s staff that I felt needed to be reported.\n\nPost the security check, I was asked by the crew members to wait in a lounge after getting the boarding pass as there was a delay in the flight. Later, I found out after enquiring that the flight already left without an announcement.\n\nI was supposed to be at my destination by evening for a business purpose. Eventually, it led to a potential loss of an important client of ours. Nonetheless, the reputation of our firm also got damaged.\n\nAlthough it is not possible to undo the damage caused I would like your airline to reimburse me with the full ticket and a free travel voucher for my next trip owing to the inconvenience I had to suffer.\n\nI look forward to your comments on this matter.\n\nWarm Regards,\n\nKaran Mehta",
    //         feedback: {
    //             content: "Good structure and ideas. Consider adding more specific examples.",
    //             score: 7.5,
    //             breakdown: {
    //                 taskAchievement: 7,
    //                 coherenceCohesion: 8,
    //                 lexicalResource: 7,
    //                 grammaticalAccuracy: 8
    //             }
    //         }
    //     },
    //     {
    //         taskNumber: 2,
    //         prompt: "A lot of places in the world rely on tourism as a main source of income. Unfortunately, tourism can also be a source of problems if it is not managed correctly. \n Describe the advantages and disadvantages of tourism in the modern world. \n Do you think that benefits of tourism outweigh its drawbacks?",
    //         userAnswer: "Some individuals believe that a lot of areas on Earth depend on tourism as a key source of income. However, tourism can also cause problems if it is not managed in the right way. This essay will explore both the benefits and drawbacks of  tourism and why the advantages of tourism outweigh its disadvantages. \n First and foremost, the main advantages of  tourism are the economic growth in some countries. It means that tourism can be used as a source of income to develop countries'  economies. For instance, countries such as Kazakhstan, which is one of the most economically developed countries in the world because they have well-developed tourism. Moreover, another advantage of tourism is cultural development. In fact, the tourists who come to the country can increase the popularity of traditional or cultural aspects of the country. For example, the culture of Japan, which was known by the whole world because of tourists. \n Turning to the other side of the argument, tourism can also have a negative impact on the environment of the country. Because a lot of visitors do not care about the nature of the other country. The prime example of this is  scientific research, which is written about the environment of India. In this research, scientists discovered that India has millions of visitors per month, although because of that, they are the most dirty country in the world. \n Although the drawbacks of the tours are not significant, they are easily manageable with the right strategies and do not overshadow the advantages.\n In conclusion, the advantages of tourism are always better than their disadvantages because of economic growth and cultural development.",
    //         modelAnswer: "Although there are problems associated with tourism, in my opinion, there are many positive outcomes of tourism. \n Tourism provides highly profitable employment opportunities to people in many poor countries, for example, Nepal, Tanzania, and Guatemala considering their currency rates. In addition, tourism introduces the tasty cuisines to local communities of that visited country. For instance, in Los Angeles, there are a lot of authentic Spanish restaurants that bring appetizing Hispanic dishes.Moreover, travellers from other countries can mingle with locals very easily by learning basic expressions. For example, non-English speaking Chinese tourists can use some user-friendly translator services to manage talking to English speakers for day-to-day basic activities like ordering food.\n The influx of tourists in many popular destinations causes nightmares to some government authorities with city management. Firstly, traffic congestion arises as too many tourist vehicles occupy the roads during peak travel hours. So this causes city councils to employ more patrols. Secondly, due to a lot of tourists crossing borders, it’s hard for immigration officers to investigate each and every traveller. Due to a lack of time and staff during security checks, some people with the intention of causing harm can enter the country.Additionally, many peaceful places where people go for de-stressing can get crowded and the peaceful nature of that place is spoiled such as Machu Picchu in Peru which is always crowded with tourists. \n In conclusion, the positive aspects of tourism in terms of employment opportunities and cultural adaptation outweigh all the negative aspects in relation to traffic congestion, public security, and serenity of a popular destination.",
    //         feedback: {
    //             content: "Well-formatted letter with clear purpose. Could improve vocabulary range.",
    //             score: 6.5,
    //             breakdown: {
    //                 taskAchievement: 7,
    //                 coherenceCohesion: 6,
    //                 lexicalResource: 6,
    //                 grammaticalAccuracy: 7
    //             }
    //         }
    //     }
    // ]

    const WritingResults = ({ evaluationResults }: { evaluationResults: EvaluationResult[] }) => {
        const [currentTask, setCurrentTask] = useState(0); // Default to Task 1
      
        const getBandColor = (score: number) => {
          if (score >= 8) return "text-green-600";
          if (score >= 6.5) return "text-blue-600";
          if (score >= 5) return "text-yellow-600";
          return "text-red-600";
        };
      
        const getFeedbackIcon = (score: number) => {
          if (score >= 8) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
          if (score >= 6.5) return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
          if (score >= 5) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
          return <XCircle className="w-5 h-5 text-red-600" />;
        };
      
        return (
          <div className="bg-gray-50 p-6 rounded-lg max-w-4xl mx-auto">
            {/* Task Selection */}
            <div className="flex gap-4 mb-6">
              {evaluationResults.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTask(index)}
                  className={`px-4 py-2 rounded-lg ${currentTask === index ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  Task {index + 1}
                </button>
              ))}
            </div>
      
            {/* Current Task Results */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Task Prompt</h3>
                <p className="text-gray-700">{evaluationResults[currentTask].prompt}</p>
      
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h3 className="text-lg font-semibold">Your Answer</h3>
                    <p className="bg-white p-4 rounded-lg border">{evaluationResults[currentTask].userAnswer}</p>
                  </div>
      
                  <div>
                    <h3 className="text-lg font-semibold">Model Answer</h3>
                    <p className="bg-white p-4 rounded-lg border">{evaluationResults[currentTask].modelAnswer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
      
            {/* Feedback Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Feedback</h3>
                <p className="text-gray-700 mb-6">{evaluationResults[currentTask].feedback.content}</p>
      
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(evaluationResults[currentTask].feedback.breakdown).map(([criterion, score]) => (
                    <div key={criterion} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <span className="text-gray-600 capitalize">{criterion.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className={getBandColor(score)}>{score.toFixed(1)}</span>
                      {getFeedbackIcon(score)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      };
      
      export default WritingResults;
      

