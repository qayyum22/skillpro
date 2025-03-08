import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { TestService } from '@/services/firebase';
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        console.error("GROQ API key not set");
        return NextResponse.json({ error: 'Server Configuration error: Missing API key' }, { status: 500 });
    }

    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;
        const transcript = formData.get('transcript') as string;
        const testId = formData.get('testId') as string;
        const userId = formData.get('userId') as string;
        
        if (!audioFile || !transcript || !testId || !userId) {
            return NextResponse.json({ 
                error: 'Missing required data' 
            }, { status: 400 });
        }

        // Initialize Groq client
        const groq = new Groq({ apiKey: GROQ_API_KEY });
        
        // Analyze with Groq LLM
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are an IELTS speaking examiner with decades of experience. Analyze the provided transcript 
                    from an IELTS speaking test and provide a detailed evaluation.
                    
                    Evaluate the candidate on these four criteria:
                    1. Fluency and Coherence (how smooth and connected the speech is)
                    2. Lexical Resource (vocabulary range and accuracy)
                    3. Grammatical Range and Accuracy
                    4. Pronunciation
                    
                    For each criterion, provide:
                    - A score from 0-9 (with 0.5 increments allowed)
                    - Specific examples from the transcript that support your score
                    - Detailed feedback with strengths and areas for improvement
                    
                    Then provide an overall band score from 0-9 and summarize key strengths and weaknesses.
                    
                    Return your analysis as JSON with this structure:
                    {
                      "fluency": {
                        "score": number,
                        "examples": string[],
                        "feedback": string
                      },
                      "vocabulary": {
                        "score": number,
                        "examples": string[],
                        "feedback": string
                      },
                      "grammar": {
                        "score": number,
                        "examples": string[],
                        "feedback": string
                      },
                      "pronunciation": {
                        "score": number,
                        "examples": string[],
                        "feedback": string
                      },
                      "overall": {
                        "score": number,
                        "strengths": string[],
                        "improvements": string[]
                      }
                    }
                    
                    Wrap your JSON response in <json></json> tags.`
                },
                {
                    role: "user",
                    content: transcript
                },
            ],
        });

        const rawResponse = completion.choices[0]?.message?.content;
        if (!rawResponse) throw new Error("Groq API returned a null response");

        const jsonMatch = rawResponse.match(/<json>([\s\S]*?)<\/json>/);
        if (!jsonMatch) throw new Error("Groq API response format invalid");

        const analysisResult = JSON.parse(jsonMatch[1]);

        // Save the result to Firestore
        const testResult = await TestService.saveTestResult({
            testId,
            userId,
            type: 'speaking',
            scores: {
                overall: analysisResult.overall.score,
                fluency: analysisResult.fluency.score,
                vocabulary: analysisResult.vocabulary.score,
                grammar: analysisResult.grammar.score,
                pronunciation: analysisResult.pronunciation.score
            },
            feedback: {
                strengths: analysisResult.overall.strengths,
                improvements: analysisResult.overall.improvements || []
            },
            recordings: {
                full: {
                    url: URL.createObjectURL(audioFile),
                    transcription: transcript
                }
            }
        });

        return NextResponse.json({
            ...analysisResult,
            resultId: testResult.testId
        });
    } catch (error) {
        console.error("Error during speech analysis:", error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
} 