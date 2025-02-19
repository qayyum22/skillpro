// import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { input } = await req.json();
    // const client = await clientPromise;
    // if (!client) {
    //   throw new Error("Failed to connect to the database");
    // }
    // const db = client.db("testprephaven");
    // // Save or update user in MongoDB for OAuth providers
    // const writingTest = await db
    //   .collection("writingtest")
    //   .findOne({ "tasks2.test_id": "02" });

    const writingTest = "hello";

    return NextResponse.json({ response: writingTest + input }, { status: 200 });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
