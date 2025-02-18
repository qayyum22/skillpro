import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Groq from "groq-sdk";
import clientPromise from '@/lib/mongodb'; // Ensure you have a MongoDB client setup



export async function POST(req: NextRequest) {

    const LEMONFOX_API_KEY = process.env.LEMONFOX_API_KEY;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!LEMONFOX_API_KEY || !GROQ_API_KEY) {
        console.error("API keys not set");
        return NextResponse.json({ error: 'Server Configuration error : Missing API keys' }, { status: 500 });
    }



    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;
        if (!audioFile) {
            console.log('No audio provided');
            return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
        }

        if(audioFile.size > 10 * 1024 * 1024) {
            console.log('File too large');
            return NextResponse.json({ error: 'File too large' }, { status: 400 });
        }

        console.log("Received file:", audioFile);

        // Save file temporarily
        const tempDir = path.join(process.cwd(), 'tmp'); // Use a local directory
        const fileName = `${Date.now()}-${audioFile.name}`;
        fs.mkdirSync(tempDir, { recursive: true });
        const filePath = path.join(tempDir, fileName);
        const fileBuffer = Buffer.from(await audioFile.arrayBuffer());
        fs.writeFileSync(filePath, fileBuffer);
        console.log(`File saved at ${filePath}`);

        // Transcribe with LemonFox Whisper API
        const formDataBody = new FormData();
        const fileStream = fs.createReadStream(filePath);
        const chunks: Uint8Array[] = [];
        for await (const chunk of fileStream) {
            chunks.push(chunk);
        }
        const fileBlob = new Blob(chunks, { type: 'audio/wav' });
        formDataBody.append('file', fileBlob, fileName);

        console.log('Sending request to Whisper API');
        const response = await fetch('https://api.lemonfox.ai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${LEMONFOX_API_KEY}`,
            },
            body: formDataBody,
            signal: AbortSignal.timeout(30000), // Timeout after 30 seconds
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Whisper API Transcription failed:', errorText);
           throw new Error(`Transcription failed: ${errorText}`);
        }

        // Log API response for troubleshooting
        const data = await response.json();
        if(typeof data.text !== 'string') {
            throw new Error('Invalid transcription response from Whisper API');
        }

        console.log("Transcription result:", data);

        fs.unlinkSync(filePath); // Clean up temp file
        
        // Send transcription to Groq API for evaluation
        const groq = new Groq({ apiKey: GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are an IELTS Test expert. Evaluate the following speaking test transcription and return a JSON inside <json></json> tags. Use this structure: { "score": number, "feedback": string }`
                },
                {
                    role: "user",
                    content: data.text,
                },
            ],
        });

        const rawResponse = completion.choices[0]?.message?.content;
        if (!rawResponse) throw new Error("Groq API returned a null response");

        const jsonMatch = rawResponse.match(/<json>([\s\S]*?)<\/json>/);
        if (!jsonMatch) throw new Error("Groq API response format invalid");

        const result = JSON.parse(jsonMatch[1]); // Extracted JSON

        // const client = await clientPromise;
        // const db = client.db("skillpro");
        // const grok = db.collection("speakingtest");

        console.log("Storing result:", result);
        // await grok.insertOne(result);

        return NextResponse.json({ transcription: data.text, evaluation: result });
    } catch (error) {
        console.error("Error during processing:", error); // Log the full error message
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}
