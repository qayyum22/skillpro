import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

const tasks = {
  test_id: "01",
  tasks: [
    {
      type: "task1",
      title: "General Task 1: ",
      description:
        "Your English-speaking friend has asked for your help with a college project helshe is doing about celebrating New Year in different countries. \n\n Write a letter to your friend. In your letter \n • say how important New Year is to people in your country \n • describe how New Year is celebrated in your country \n • explain what you like about New Year celebrations in your country",
      // imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80',
      timeGuide: "20 minutes",
      wordLimit: "Minimum 150 words",
      tips: [
        "Spend no more than 20 minutes on this task",
        "You do NOT need to write any addresses",
        "Begin your letter as follows : ",
        "Dear .......................",
      ],
    },
    {
      type: "task2",
      title: "General Training 2: Essay",
      description:
        "Some people say that it is better to work for a large company than a small one.",
      timeGuide: "40 minutes",
      wordLimit: "Minimum 250 words",
      tips: [
        "Spend about 40 minutes on this task",
        "Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
      ],
    },
  ],
};

const tasks2 = {
  test_id: "02",
  task1:
    "Your English-speaking friend has asked for your help with a college project helshe is doing about celebrating New Year in different countries. \n\n Write a letter to your friend. In your letter \n • say how important New Year is to people in your country \n • describe how New Year is celebrated in your country \n • explain what you like about New Year celebrations in your country",
  task2:
    "Some people say that it is better to work for a large company than a small one.",
};

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    if (!client) {
      throw new Error("Failed to connect to the database");
    }
    const db = client.db("skillpro");
    // Save or update user in MongoDB for OAuth providers
    const writingTest = await db.collection("writingtest").insertOne({
      tasks2,
    });

    return NextResponse.json({ response: writingTest });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
