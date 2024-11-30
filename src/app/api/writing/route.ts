import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { task1question, task1answer, task2question, task2answer } =
      await req.json();

    const openai = new OpenAI({
      apiKey: process.env.xAI_API,
      baseURL: "https://api.x.ai/v1",
    });

    const completion = await openai.chat.completions.create({
      model: "grok-beta",
      messages: [
        {
          role: "system",
          content: `You are Grok, a IELTS Test expert and IELTS Test Evaluator, evaluate IELTS writing results and return the results in this format 
          [{
            taskNumber: 1 or 2,
            prompt: "",
            userAnswer: "",
            modelAnswer: "",
            feedback: {
                content: "",
                score: ,
                breakdown: {
                    taskAchievement: ,
                    coherenceCohesion: ,
                    lexicalResource: ,
                    grammaticalAccuracy: ,
                }
            }
            },
            {
            taskNumber: 2,
            prompt: "",
            userAnswer: "",
            modelAnswer: "",
            feedback: {
                content: "",
                score: ,
                breakdown: {
                    taskAchievement: ,
                    coherenceCohesion: ,
                    lexicalResource: ,
                    grammaticalAccuracy: ,
                }
            }
        }],`,
        },
        {
          role: "user",
          content: `task1question: ${task1question}, task1answer: ${task1answer}, task2question: ${task2question}, task2answer: ${task2answer}`,
        },
      ],
    });
    const client = await clientPromise;
    const db = client.db("skillpro");
    const grok = db.collection("xAI_Response");
    await grok.insertOne({ completion });

    return NextResponse.json({ response: completion.choices[0].message.content }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
