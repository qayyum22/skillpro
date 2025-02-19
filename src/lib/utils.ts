import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// export function transformApiResponse(apiResponse : any) {
//   try {
//       // Extract JSON string (from first '[' to last ']')
//       const startIndex = apiResponse.response.indexOf("[");
//       const endIndex = apiResponse.response.lastIndexOf("]") + 1;
//       if (startIndex === -1 || endIndex === -1) throw new Error("Invalid JSON structure");

//       let jsonString = apiResponse.response.substring(startIndex, endIndex);

//       // Fix invalid JSON keys (replace unquoted keys with quoted keys)
//       jsonString = jsonString.replace(/(\w+):/g, '"$1":');

//       // Parse cleaned JSON string
//       const parsedData = JSON.parse(jsonString);

//       // Transform into desired format
//       if (!Array.isArray(parsedData)) throw new Error("Parsed data is not an array");
//       return parsedData.map((item: any) => ({
//           taskNumber: item.taskNumber,
//           prompt: item.prompt,
//           userAnswer: item.userAnswer,
//           modelAnswer: item.modelAnswer,
//           feedback: {
//               content: item.feedback?.content || "",
//               score: item.feedback?.score || 0,
//               breakdown: {
//                   taskAchievement: item.feedback?.breakdown?.taskAchievement || 0,
//                   coherenceCohesion: item.feedback?.breakdown?.coherenceCohesion || 0,
//                   lexicalResource: item.feedback?.breakdown?.lexicalResource || 0,
//                   grammaticalAccuracy: item.feedback?.breakdown?.grammaticalAccuracy || 0
//               }
//           }
//       }));
//   } catch (error) {
//       console.error("Error parsing API response:", error);
//       return [];
//   }
// }

// export function transformApiResponse(apiResponse: any) {
//   try {
//     // Extract JSON string (from first '[' to last ']')
//     const startIndex = apiResponse.response.indexOf("[");
//     const endIndex = apiResponse.response.lastIndexOf("]") + 1;
//     if (startIndex === -1 || endIndex === -1) throw new Error("Invalid JSON structure");

//     let jsonString = apiResponse.response.substring(startIndex, endIndex);

//     // Fix invalid JSON keys (replace unquoted keys with quoted keys)
//     jsonString = jsonString.replace(/([{,])\s*(\w+)\s*:/g, '$1 "$2":');

//     // Parse cleaned JSON string
//     const parsedData = JSON.parse(jsonString);

//     // Ensure parsed data is an array
//     if (!Array.isArray(parsedData)) throw new Error("Parsed data is not an array");

//     return parsedData.map((item: any) => ({
//       taskNumber: item.taskNumber,
//       prompt: item.prompt,
//       userAnswer: item.userAnswer,
//       modelAnswer: item.modelAnswer,
//       feedback: {
//         content: item.feedback?.content || "",
//         score: item.feedback?.score || 0,
//         breakdown: {
//           taskAchievement: item.feedback?.breakdown?.taskAchievement || 0,
//           coherenceCohesion: item.feedback?.breakdown?.coherenceCohesion || 0,
//           lexicalResource: item.feedback?.breakdown?.lexicalResource || 0,
//           grammaticalAccuracy: item.feedback?.breakdown?.grammaticalAccuracy || 0,
//         },
//       },
//     }));
//   } catch (error) {
//     console.error("Error parsing API response:", error);
//     return [];
//   }
// }

// export function transformApiResponse(apiResponse: any) {
//   try {
//     // Extract JSON string (from first '[' to last ']')
//     const startIndex = apiResponse.response.indexOf("[");
//     const endIndex = apiResponse.response.lastIndexOf("]") + 1;
//     if (startIndex === -1 || endIndex === -1) throw new Error("Invalid JSON structure");

//     let jsonString = apiResponse.response.substring(startIndex, endIndex);

//     // Fix invalid JSON: Ensure all keys are properly quoted
//     jsonString = jsonString
//       .replace(/([{,])\s*(\w+)\s*:/g, '$1 "$2":')  // Fix unquoted property names
//       .replace(/:\s*([\w\-]+)/g, ': "$1"')         // Wrap unquoted string values in quotes

//     // Parse cleaned JSON string
//     const parsedData = JSON.parse(jsonString);

//     // Ensure parsed data is an array
//     if (!Array.isArray(parsedData)) throw new Error("Parsed data is not an array");

//     return parsedData.map((item: any) => ({
//       taskNumber: item.taskNumber,
//       prompt: item.prompt,
//       userAnswer: item.userAnswer,
//       modelAnswer: item.modelAnswer,
//       feedback: {
//         content: item.feedback?.content || "",
//         score: item.feedback?.score || 0,
//         breakdown: {
//           taskAchievement: item.feedback?.breakdown?.taskAchievement || 0,
//           coherenceCohesion: item.feedback?.breakdown?.coherenceCohesion || 0,
//           lexicalResource: item.feedback?.breakdown?.lexicalResource || 0,
//           grammaticalAccuracy: item.feedback?.breakdown?.grammaticalAccuracy || 0,
//         },
//       },
//     }));
//   } catch (error) {
//     console.error("Error parsing API response:", error);
//     return [];
//   }
// }

// export function transformApiResponse(apiResponse: any) {
//   try {
//     let jsonString = apiResponse.response;

//     // Extract only the JSON part (from first '[' to last ']')
//     const startIndex = jsonString.indexOf("[");
//     const endIndex = jsonString.lastIndexOf("]") + 1;

//     if (startIndex === -1 || endIndex === -1) {
//       throw new Error("Invalid JSON structure: Could not find JSON array.");
//     }

//     jsonString = jsonString.substring(startIndex, endIndex);

//     // Fix invalid JSON keys: ensure property names are quoted correctly
//     jsonString = jsonString.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');

//     // Parse extracted JSON
//     const parsedData = JSON.parse(jsonString);

//     // Ensure parsedData is an array
//     if (!Array.isArray(parsedData)) throw new Error("Parsed data is not an array");

//     return parsedData.map((item: any) => ({
//       taskNumber: item.taskNumber,
//       prompt: item.prompt,
//       userAnswer: item.userAnswer,
//       modelAnswer: item.modelAnswer,
//       feedback: {
//         content: item.feedback?.content || "",
//         score: item.feedback?.score || 0,
//         breakdown: {
//           taskAchievement: item.feedback?.breakdown?.taskAchievement || 0,
//           coherenceCohesion: item.feedback?.breakdown?.coherenceCohesion || 0,
//           lexicalResource: item.feedback?.breakdown?.lexicalResource || 0,
//           grammaticalAccuracy: item.feedback?.breakdown?.grammaticalAccuracy || 0,
//         },
//       },
//     }));
//   } catch (error) {
//     console.error("Error parsing API response:", error);
//     return [];
//   }
// }


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

interface ParsedItem {
  taskNumber: number | null;
  prompt: string;
  userAnswer: string;
  modelAnswer: string;
  feedback: Feedback;
}

export function transformApiResponse(apiResponse: { response?: string; choices?: { message?: { content?: string } }[] }) {
  try {
    console.log("Raw API Response:", JSON.stringify(apiResponse, null, 2));

    // Extract response content from API output
    let jsonString =
      apiResponse?.choices?.[0]?.message?.content ||
      apiResponse?.response ||
      "";

    if (!jsonString || typeof jsonString !== "string") {
      console.error("API response is empty or malformed:", apiResponse);
      throw new Error("Invalid API response format: Response is empty or not a string.");
    }

    // Trim spaces to prevent accidental parsing issues
    jsonString = jsonString.trim();

    // Debug: Show extracted response
    console.log("Extracted Raw Response:", jsonString);

    // Extract JSON from the first '[' to the last ']'
    const startIndex = jsonString.indexOf("[");
    const endIndex = jsonString.lastIndexOf("]") + 1;

    if (startIndex === -1 || endIndex === 0) {
      console.error("Malformed JSON structure:", jsonString);
      throw new Error("Invalid JSON structure: Could not find JSON array.");
    }

    jsonString = jsonString.substring(startIndex, endIndex);

    // Fix unquoted keys (convert `key: value` → `"key": value`)
    jsonString = jsonString.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');

    console.log("Extracted JSON String:", jsonString);

    // Parse JSON
    const parsedData = JSON.parse(jsonString);

    if (!Array.isArray(parsedData)) {
      console.error("Parsed data is not an array:", parsedData);
      throw new Error("Parsed data is not an array.");
    }

    return parsedData.map((item: any): ParsedItem => ({
      taskNumber: item.taskNumber || null,
      prompt: item.prompt || "",
      userAnswer: item.userAnswer || "",
      modelAnswer: item.modelAnswer || "",
      feedback: {
        content: item.feedback?.content || "",
        score: item.feedback?.score || 0,
        breakdown: {
          taskAchievement: item.feedback?.breakdown?.taskAchievement || 0,
          coherenceCohesion: item.feedback?.breakdown?.coherenceCohesion || 0,
          lexicalResource: item.feedback?.breakdown?.lexicalResource || 0,
          grammaticalAccuracy: item.feedback?.breakdown?.grammaticalAccuracy || 0,
        },
      },
    }));
  } catch (error) {
    console.error("Error parsing API response:", error);
    return [];
  }
}








// const cleanedData = transformApiResponse(apiResponse);
// console.log(cleanedData);