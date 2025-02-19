// import React, { useState } from 'react';
// import { Mic, Square, Play, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
// import Timer from '@/components/Timer';
// import { parts } from './speakingData';
// import { evaluateSpeaking } from '@/app/api/evaluation/route';
// import { toast } from 'react-hot-toast';

// interface SpeakingModuleProps {
//   onComplete?: (answers: any) => void;
//   isFullTest?: boolean;
// }

// const SpeakingModule: React.FC<SpeakingModuleProps> = ({ onComplete, isFullTest = false }) => {
//   const [currentPart, setCurrentPart] = useState(0);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordings, setRecordings] = useState<Record<string, string>>({});
//   const [evaluating, setEvaluating] = useState(false);
//   const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
//   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       setAudioStream(stream);
      
//       const recorder = new MediaRecorder(stream);
//       const chunks: BlobPart[] = [];

//       recorder.ondataavailable = (e) => chunks.push(e.data);
//       recorder.onstop = async () => {
//         const blob = new Blob(chunks, { type: 'audio/webm' });
//         const audioUrl = URL.createObjectURL(blob);
//         setRecordings(prev => ({
//           ...prev,
//           [`part${currentPart + 1}`]: audioUrl
//         }));
//       };

//       recorder.start();
//       setMediaRecorder(recorder);
//       setIsRecording(true);
//     } catch (error) {
//       toast.error('Failed to access microphone');
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder) {
//       mediaRecorder.stop();
//       setIsRecording(false);
//     }
//     if (audioStream) {
//       audioStream.getTracks().forEach(track => track.stop());
//       setAudioStream(null);
//     }
//   };

//   const handleSubmit = async () => {
//     setEvaluating(true);
//     try {
//       const evaluations = await Promise.all(
//         Object.entries(recordings).map(([partId, audioUrl]) =>
//           evaluateSpeaking({
//             partId,
//             audioUrl,
//             duration: parts[parseInt(partId.slice(-1)) - 1].duration * 60
//           })
//         )
//       );

//       if (onComplete) {
//         onComplete(evaluations);
//       } else {
//         toast.success('Speaking evaluation completed successfully!');
//       }
//     } catch (error) {
//       toast.error('Failed to evaluate speaking submissions');
//     } finally {
//       setEvaluating(false);
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-6">
//       <div className="bg-white rounded-xl shadow-lg p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">IELTS Speaking Test</h2>
//           <div className="flex items-center space-x-4">
//             <Timer initialMinutes={parts[currentPart].duration} />
//             {!isFullTest && (
//               <button
//                 onClick={handleSubmit}
//                 disabled={evaluating}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
//               >
//                 {evaluating ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Evaluating...
//                   </>
//                 ) : (
//                   'Submit Test'
//                 )}
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="flex gap-4 mb-6">
//           {['Part 1', 'Part 2', 'Part 3'].map((part, index) => (
//             <button
//               key={part}
//               onClick={() => setCurrentPart(index)}
//               className={`px-4 py-2 rounded-lg ${
//                 currentPart === index
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//               }`}
//             >
//               {part}
//             </button>
//           ))}
//         </div>

//         <div className="grid md:grid-cols-2 gap-6">
//           <div className="bg-gray-50 p-6 rounded-lg">
//             <h3 className="text-xl font-semibold mb-4">{parts[currentPart].title}</h3>
//             <div className="space-y-4">
//               <p className="text-gray-700">{parts[currentPart].description}</p>
              
//               <div className="bg-white p-4 rounded-lg shadow-sm">
//                 <h4 className="font-medium text-gray-800 mb-2">Questions:</h4>
//                 <ul className="space-y-2">
//                   {parts[currentPart].questions.map((question, index) => (
//                     <li key={index} className="text-gray-700">• {question}</li>
//                   ))}
//                 </ul>
//               </div>

//               {parts[currentPart].preparationTime && (
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <p className="text-sm text-blue-800">
//                     Preparation time: {parts[currentPart].preparationTime} minute(s)
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="bg-gray-50 p-6 rounded-lg">
//             <div className="space-y-6">
//               <div className="flex justify-center">
//                 <button
//                   onClick={isRecording ? stopRecording : startRecording}
//                   className={`p-6 rounded-full ${
//                     isRecording
//                       ? 'bg-red-600 hover:bg-red-700'
//                       : 'bg-blue-600 hover:bg-blue-700'
//                   } text-white transition-colors`}
//                 >
//                   {isRecording ? (
//                     <Square className="w-8 h-8" />
//                   ) : (
//                     <Mic className="w-8 h-8" />
//                   )}
//                 </button>
//               </div>

//               {recordings[`part${currentPart + 1}`] && (
//                 <div className="bg-white p-4 rounded-lg shadow-sm">
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-700">Recording {currentPart + 1}</span>
//                     <audio
//                       src={recordings[`part${currentPart + 1}`]}
//                       controls
//                       className="w-48"
//                     />
//                   </div>
//                 </div>
//               )}

//               <div className="bg-blue-50 p-4 rounded-lg">
//                 <h4 className="font-medium text-blue-800 mb-2">Tips:</h4>
//                 <ul className="space-y-1 text-sm text-blue-700">
//                   {parts[currentPart].tips.map((tip, index) => (
//                     <li key={index}>• {tip}</li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-between mt-6">
//           <button
//             onClick={() => setCurrentPart(prev => Math.max(0, prev - 1))}
//             disabled={currentPart === 0}
//             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
//           >
//             <ChevronLeft size={20} /> Previous Part
//           </button>
//           <button
//             onClick={() => setCurrentPart(prev => Math.min(2, prev + 1))}
//             disabled={currentPart === 2}
//             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
//           >
//             Next Part <ChevronRight size={20} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SpeakingModule;

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { parts } from './speakingData';
import WaveSurfer from 'wavesurfer.js';


interface SpeakingModuleProps {
  onComplete?: (answers: any) => void;
  isFullTest?: boolean;
}

const SpeakingModule: React.FC<SpeakingModuleProps> = ({ onComplete, isFullTest}) => {
  const [currentPart, setCurrentPart] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Record<string, string>>({});
  const [evaluating, setEvaluating] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const waveformRef = useRef<WaveSurfer | null>(null);
  const waveformContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (waveformContainerRef.current) {
      waveformRef.current = WaveSurfer.create({
        container: waveformContainerRef.current,
        waveColor: 'violet',
        interact: false,
        cursorWidth: 0,
      });
    }
    return () => {
      waveformRef.current?.destroy();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        setRecordings((prev) => ({
          ...prev,
          [`part${currentPart + 1}`]: audioUrl,
        }));
        await sendAudioToAPI(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Visualize audio input
      if (waveformRef.current) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.fftSize);
        const draw = () => {
          analyser.getByteTimeDomainData(dataArray);
          const buffer = audioContext.createBuffer(1, dataArray.length, audioContext.sampleRate);
          const float32Array = new Float32Array(dataArray.buffer);
          buffer.copyToChannel(float32Array, 0);
          const blobUrl = URL.createObjectURL(new Blob([dataArray.buffer], { type: 'audio/webm' }));
          waveformRef.current?.load(blobUrl);
          requestAnimationFrame(draw);
        };
        draw();
      }
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }
  };

  const sendAudioToAPI = async (blob: Blob) => {
    setEvaluating(true);
    const formData = new FormData();
    formData.append('audio', blob, `part${currentPart + 1}.webm`);
    formData.append('partId', `part${currentPart + 1}`);

    try {
      const response = await fetch('/api/audio', { // Ensure this matches your API route
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.transcription) {
        toast.success('Evaluation completed!');
        console.log('Transcription:', data.transcription); // Display the transcription
      }
    } catch (error) {
      toast.error('Failed to evaluate speaking submission');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold">IELTS Speaking Test</h2>
      <p>{parts[currentPart].title}</p>
      <div className="mb-4">
        <p className="text-red-600">Please ensure your microphone is working properly before starting the test.</p>
        <p className="text-red-600">Speak clearly and loudly enough for the microphone to pick up your voice.</p>
      </div>
      <div ref={waveformContainerRef} className="w-full h-24 bg-gray-200 mb-4"></div>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-6 rounded-full ${
          isRecording ? 'bg-red-600' : 'bg-blue-600'
        } text-white transition-colors`}
      >
        {isRecording ? <Square size={24} /> : <Mic size={24} />}
      </button>
      {evaluating && <Loader2 className="w-6 h-6 animate-spin" />}
    </div>
  );
};

export default SpeakingModule;
