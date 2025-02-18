import { NextResponse, NextRequest } from "next/server";
// import OpenAI from "openai";
import clientPromise from "@/lib/mongodb";
import Groq from "groq-sdk";

// export async function POST(req: NextRequest) {
//   try {
//     const { task1question, task1answer, task2question, task2answer } =
//       await req.json();

//     const openai = new OpenAI({
//       apiKey: process.env.xAI_API,
//       baseURL: "https://api.x.ai/v1",
//     });

//     const completion = await openai.chat.completions.create({
//       model: "grok-beta",
//       messages: [
//         {
//           role: "system",
//           content: `You are Grok, a IELTS Test expert and IELTS Test Evaluator, evaluate IELTS writing results and return the results in this format 
//           [{
//             taskNumber: 1 or 2,
//             prompt: "",
//             userAnswer: "",
//             modelAnswer: "",
//             feedback: {
//                 content: "",
//                 score: ,
//                 breakdown: {
//                     taskAchievement: ,
//                     coherenceCohesion: ,
//                     lexicalResource: ,
//                     grammaticalAccuracy: ,
//                 }
//             }
//             },
//             {
//             taskNumber: 2,
//             prompt: "",
//             userAnswer: "",
//             modelAnswer: "",
//             feedback: {
//                 content: "",
//                 score: ,
//                 breakdown: {
//                     taskAchievement: ,
//                     coherenceCohesion: ,
//                     lexicalResource: ,
//                     grammaticalAccuracy: ,
//                 }
//             }
//         }],`,
//         },
//         {
//           role: "user",
//           content: `task1question: ${task1question}, task1answer: ${task1answer}, task2question: ${task2question}, task2answer: ${task2answer}`,
//         },
//       ],
//     });
//     const client = await clientPromise;
//     const db = client.db("skillpro");
//     const grok = db.collection("xAI_Response");
//     await grok.insertOne({ completion });

//     return NextResponse.json({ response: completion.choices[0].message.content }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "An error occurred while processing your request." },
//       { status: 500 }
//     );
//   }
// }


export async function POST(req: NextRequest) {
  try {
    const { task1question, task1answer, task2question, task2answer } = await req.json();
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an IELTS Test expert. Evaluate the answers and return a JSON inside <json></json> tags. Use this structure:

          <json>
          [
            {
              "taskNumber": 1,
              "prompt": "",
              "userAnswer": "",
              "modelAnswer": "",
              "feedback": {
                  "content": "",
                  "score": 0,
                  "breakdown": {
                      "taskAchievement": 0,
                      "coherenceCohesion": 0,
                      "lexicalResource": 0,
                      "grammaticalAccuracy": 0
                  }
              }
            },
            {
              "taskNumber": 2,
              "prompt": "",
              "userAnswer": "",
              "modelAnswer": "",
              "feedback": {
                  "content": "",
                  "score": 0,
                  "breakdown": {
                      "taskAchievement": 0,
                      "coherenceCohesion": 0,
                      "lexicalResource": 0,
                      "grammaticalAccuracy": 0
                  }
              }
            }
          ]
          </json>

          Only return JSON inside <json></json>. No extra text.`,
        },
        {
          role: "user",
          content: JSON.stringify({ task1question, task1answer, task2question, task2answer }),
        },
      ],
    });

    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) throw new Error("Groq API returned a null response");

    const jsonMatch = rawResponse.match(/<json>([\s\S]*?)<\/json>/);
    if (!jsonMatch) throw new Error("Groq API response format invalid");

    const result = JSON.parse(jsonMatch[1]); // Extracted JSON

    const client = await clientPromise;
    const db = client.db("skillpro");
    const grok = db.collection("writingtest");

    console.log("Storing result:", result);
    await grok.insertOne({ ...result }); // Store directly, no extra `{ result }` wrapper

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}



