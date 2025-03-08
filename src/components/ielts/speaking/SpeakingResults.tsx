// import React, { useState } from 'react';
// import { SpeechAnalysisResult, getBandScoreDescription } from '@/services/speechAnalysis';
// import { Card } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Volume2, Download, ChevronDown, ChevronUp } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// interface SpeakingResultsProps {
//   result: SpeechAnalysisResult;
//   testDate: Date;
//   transcription?: string;
//   recordingUrl?: string;
// }



// const SpeakingResults: React.FC<SpeakingResultsProps> = ({
//   result,
//   testDate,
//   transcription,
//   recordingUrl
// }) => {
//   const [showTranscript, setShowTranscript] = useState(false);
  
//   // Helper to render score bars
//   const renderScoreBar = (score: number) => {
//     const percentage = (score / 9) * 100;
//     return (
//       <div className="w-full bg-gray-200 rounded-full h-2.5">
//         <div 
//           className="h-2.5 rounded-full" 
//           style={{ 
//             width: `${percentage}%`, 
//             backgroundColor: getScoreColor(score) 
//           }}
//         ></div>
//       </div>
//     );
//   };
  
//   // Helper to get color based on score
//   const getScoreColor = (score: number) => {
//     if (score >= 7.5) return '#4ade80'; // green
//     if (score >= 6) return '#f59e0b';   // amber
//     return '#ef4444';                   // red
//   };
  
//   // Format date for display
//   const formatDate = (date: Date) => {
//     return new Intl.DateTimeFormat('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     }).format(date);
//   };

//   return (
//     <div className="space-y-6">
//       <Card className="p-6">
//         <h2 className="text-2xl font-bold text-indigo-700 mb-4">Speaking Test Results</h2>
        
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//           <div>
//             <p className="text-gray-600 mb-1">Test Date: {formatDate(testDate)}</p>
//             <div className="flex items-center">
//               <span className="font-medium text-gray-700 mr-2">Overall Score:</span>
//               <span className="text-3xl font-bold" style={{ color: getScoreColor(result.overall.score) }}>
//                 {result.overall.score.toFixed(1)}
//               </span>
//               <span className="text-lg text-gray-600 ml-1">/9.0</span>
//               <span className="ml-2 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-sm">
//                 {getBandScoreDescription(result.overall.score)}
//               </span>
//             </div>
//           </div>
          
//           {recordingUrl && (
//             <div className="mt-4 md:mt-0">
//               <Button 
//                 variant="outline" 
//                 className="flex items-center space-x-2 border-indigo-500 text-indigo-700 hover:bg-indigo-50"
//                 onClick={() => window.open(recordingUrl, '_blank')}
//               >
//                 <Volume2 size={16} />
//                 <span>Play Recording</span>
//               </Button>
//             </div>
//           )}
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <h3 className="font-medium text-gray-700 mb-3">Score Breakdown</h3>
//             <div className="space-y-4">
//               {['fluency', 'vocabulary', 'grammar', 'pronunciation'].map((criterion) => (
//                 <div key={criterion} className="space-y-1">
//                   <div className="flex justify-between items-center">
//                     <span className="capitalize text-gray-700">{criterion}</span>
//                     <span className="font-medium" style={{ color: getScoreColor(result[criterion as keyof typeof result].score) }}>
//                       {result[criterion as keyof typeof result].score.toFixed(1)}
//                     </span>
//                   </div>
//                   {renderScoreBar(result[criterion as keyof typeof result].score)}
//                 </div>
//               ))}
//             </div>
//           </div>
          
//           <div>
//             <h3 className="font-medium text-gray-700 mb-3">Key Observations</h3>
//             <div className="space-y-3">
//               <div>
//                 <h4 className="text-sm font-medium text-green-700">Strengths</h4>
//                 <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
//                   {result.overall.strengths.map((strength, i) => (
//                     <li key={i}>{strength}</li>
//                   ))}
//                 </ul>
//               </div>
              
//               <div>
//                 <h4 className="text-sm font-medium text-amber-700">Areas for Improvement</h4>
//                 <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
//                   {result.overall.improvements.map((improvement, i) => (
//                     <li key={i}>{improvement}</li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {transcription && (
//           <div className="mt-4 border-t pt-4">
//             <Button
//               variant="ghost"
//               onClick={() => setShowTranscript(!showTranscript)}
//               className="flex items-center space-x-2 text-gray-700"
//             >
//               <span>Transcription</span>
//               {showTranscript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//             </Button>
            
//             {showTranscript && (
//               <div className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700 text-sm whitespace-pre-wrap">
//                 {transcription}
//               </div>
//             )}
//           </div>
//         )}
        
//         <div className="mt-4 flex justify-end">
//           <Button 
//             variant="outline" 
//             className="flex items-center space-x-2"
//             onClick={() => {
//               // Create a blob with the analysis results
//               const blob = new Blob(
//                 [JSON.stringify({ result, transcription, testDate: testDate.toISOString() }, null, 2)], 
//                 { type: 'application/json' }
//               );
//               const url = URL.createObjectURL(blob);
//               const a = document.createElement('a');
//               a.href = url;
//               a.download = `speaking-results-${new Date().toISOString().split('T')[0]}.json`;
//               document.body.appendChild(a);
//               a.click();
//               document.body.removeChild(a);
//               URL.revokeObjectURL(url);
//             }}
//           >
//             <Download size={16} />
//             <span>Download Results</span>
//           </Button>
//         </div>
//       </Card>
      
//       <Tabs defaultValue="fluency">
//         <TabsList className="mb-4">
//           <TabsTrigger value="fluency">Fluency & Coherence</TabsTrigger>
//           <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
//           <TabsTrigger value="grammar">Grammar</TabsTrigger>
//           <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
//         </TabsList>
        
//         {['fluency', 'vocabulary', 'grammar', 'pronunciation'].map((criterion) => (
//           <TabsContent key={criterion} value={criterion}>
//             <Card className="p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <h3 className="text-xl font-bold capitalize">{criterion}</h3>
//                 <div className="flex items-center">
//                   <span className="text-2xl font-bold mr-1" style={{ color: getScoreColor(result[criterion as keyof typeof result].score) }}>
//                     {result[criterion as keyof typeof result].score.toFixed(1)}
//                   </span>
//                   <span className="text-gray-600">/9</span>
//                 </div>
//               </div>
              
//               <div className="mb-4">
//                 <h4 className="font-medium text-gray-700 mb-2">Feedback</h4>
//                 <p className="text-gray-700">
//                   {result[criterion as keyof typeof result].feedback !== undefined 
//                     ? result[criterion as keyof typeof result].feedback 
//                     : "No feedback available."}
//                 </p>
//               </div>
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-2">Examples from Your Speaking</h4>
//                 <div className="bg-gray-50 p-3 rounded-lg text-gray-700 space-y-2">
//                   {result[criterion as keyof typeof result].examples.map((example, i) => (
//                     <div key={i} className="italic">"{example}"</div>
//                   ))}
//                 </div>
//               </div>
//             </Card>
//           </TabsContent>
//         ))}
//       </Tabs>
      
//       <Card className="p-6">
//         <h3 className="text-xl font-bold text-indigo-700 mb-4">Recommendations</h3>
//         <div className="space-y-4">
//           {['fluency', 'vocabulary', 'grammar', 'pronunciation'].map((criterion) => {
//             const score = result[criterion as keyof typeof result].score;
//             if (score < 6) {
//               return (
//                 <div key={criterion} className="bg-amber-50 p-3 rounded-lg border border-amber-200">
//                   <h4 className="font-medium text-amber-800 capitalize mb-2">{criterion} Improvement Plan</h4>
//                   <p className="text-gray-700">
//                     {criterion === 'fluency' && "Practice speaking without pauses by recording yourself discussing familiar topics. Try shadowing techniques by repeating after native speakers."}
//                     {criterion === 'vocabulary' && "Build your vocabulary by learning 5 new words daily. Use a spaced repetition app and practice using these words in sentences."}
//                     {criterion === 'grammar' && "Focus on mastering one grammar structure at a time. Practice using complex sentences and get feedback on your errors."}
//                     {criterion === 'pronunciation' && "Work on specific sounds you struggle with. Record yourself reading passages and compare with native pronunciations."}
//                   </p>
//                 </div>
//               );
//             }
//             return null;
//           })}
          
//           <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
//             <h4 className="font-medium text-indigo-800 mb-2">Suggested Resources</h4>
//             <ul className="list-disc list-inside space-y-1 text-gray-700">
//               <li>IELTS Speaking Part 1, 2 & 3 Practice Sessions</li>
//               <li>Pronunciation Workshops (Focus: Word Stress & Intonation)</li>
//               <li>Advanced Grammar for Speaking</li>
//               <li>Vocabulary Building for Academic Topics</li>
//             </ul>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default SpeakingResults;

import React, { useState } from 'react';
import { SpeechAnalysisResult, getBandScoreDescription } from '@/services/speechAnalysis';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Volume2, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpeakingResultsProps {
  result: SpeechAnalysisResult;
  testDate: Date;
  transcription?: string;
  recordingUrl?: string;
}

const SpeakingResults: React.FC<SpeakingResultsProps> = ({
  result,
  testDate,
  transcription,
  recordingUrl
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  
  // Define criteria with literal types
  const criteria = ['fluency', 'vocabulary', 'grammar', 'pronunciation'] as const;

  // Helper to render score bars
  const renderScoreBar = (score: number) => {
    const percentage = (score / 9) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="h-2.5 rounded-full" 
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: getScoreColor(score) 
          }}
        ></div>
      </div>
    );
  };
  
  // Helper to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 7.5) return '#4ade80'; // green
    if (score >= 6) return '#f59e0b';   // amber
    return '#ef4444';                   // red
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Speaking Test Results</h2>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-gray-600 mb-1">Test Date: {formatDate(testDate)}</p>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 mr-2">Overall Score:</span>
              <span className="text-3xl font-bold" style={{ color: getScoreColor(result.overall.score) }}>
                {result.overall.score.toFixed(1)}
              </span>
              <span className="text-lg text-gray-600 ml-1">/9.0</span>
              <span className="ml-2 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-sm">
                {getBandScoreDescription(result.overall.score)}
              </span>
            </div>
          </div>
          
          {recordingUrl && (
            <div className="mt-4 md:mt-0">
              <Button 
                variant="outline" 
                className="flex items-center space-x-2 border-indigo-500 text-indigo-700 hover:bg-indigo-50"
                onClick={() => window.open(recordingUrl, '_blank')}
              >
                <Volume2 size={16} />
                <span>Play Recording</span>
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Score Breakdown</h3>
            <div className="space-y-4">
              {criteria.map((criterion) => (
                <div key={criterion} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="capitalize text-gray-700">{criterion}</span>
                    <span className="font-medium" style={{ color: getScoreColor(result[criterion].score) }}>
                      {result[criterion].score.toFixed(1)}
                    </span>
                  </div>
                  {renderScoreBar(result[criterion].score)}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Key Observations</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-green-700">Strengths</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                  {result.overall.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-amber-700">Areas for Improvement</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                  {result.overall.improvements.map((improvement, i) => (
                    <li key={i}>{improvement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {transcription && (
          <div className="mt-4 border-t pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center space-x-2 text-gray-700"
            >
              <span>Transcription</span>
              {showTranscript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
            
            {showTranscript && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700 text-sm whitespace-pre-wrap">
                {transcription}
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={() => {
              const blob = new Blob(
                [JSON.stringify({ result, transcription, testDate: testDate.toISOString() }, null, 2)], 
                { type: 'application/json' }
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `speaking-results-${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            <Download size={16} />
            <span>Download Results</span>
          </Button>
        </div>
      </Card>
      
      <Tabs defaultValue="fluency">
        <TabsList className="mb-4">
          <TabsTrigger value="fluency">Fluency & Coherence</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="grammar">Grammar</TabsTrigger>
          <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
        </TabsList>
        
        {criteria.map((criterion) => (
          <TabsContent key={criterion} value={criterion}>
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold capitalize">{criterion}</h3>
                <div className="flex items-center">
                  <span className="text-2xl font-bold mr-1" style={{ color: getScoreColor(result[criterion].score) }}>
                    {result[criterion].score.toFixed(1)}
                  </span>
                  <span className="text-gray-600">/9</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Feedback</h4>
                <p className="text-gray-700">{result[criterion].feedback}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Examples from Your Speaking</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-gray-700 space-y-2">
                  {result[criterion].examples.map((example, i) => (
                    <div key={i} className="italic">"{example}"</div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      <Card className="p-6">
        <h3 className="text-xl font-bold text-indigo-700 mb-4">Recommendations</h3>
        <div className="space-y-4">
          {criteria.map((criterion) => {
            const score = result[criterion].score;
            if (score < 6) {
              return (
                <div key={criterion} className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-800 capitalize mb-2">{criterion} Improvement Plan</h4>
                  <p className="text-gray-700">
                    {criterion === 'fluency' && "Practice speaking without pauses by recording yourself discussing familiar topics. Try shadowing techniques by repeating after native speakers."}
                    {criterion === 'vocabulary' && "Build your vocabulary by learning 5 new words daily. Use a spaced repetition app and practice using these words in sentences."}
                    {criterion === 'grammar' && "Focus on mastering one grammar structure at a time. Practice using complex sentences and get feedback on your errors."}
                    {criterion === 'pronunciation' && "Work on specific sounds you struggle with. Record yourself reading passages and compare with native pronunciations."}
                  </p>
                </div>
              );
            }
            return null;
          })}
          
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
            <h4 className="font-medium text-indigo-800 mb-2">Suggested Resources</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>IELTS Speaking Part 1, 2 & 3 Practice Sessions</li>
              <li>Pronunciation Workshops (Focus: Word Stress & Intonation)</li>
              <li>Advanced Grammar for Speaking</li>
              <li>Vocabulary Building for Academic Topics</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SpeakingResults;