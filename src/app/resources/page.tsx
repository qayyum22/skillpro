// "use client"
// import React, { useState } from 'react';
// import { Book, BookOpen, Headphones, Pen, Mic, GraduationCap } from 'lucide-react';
// import ResourceContent from '@/components/resources/ResourceContent';
// import { academicResources, generalResources, readingResources, writingResources, listeningResources, speakingResources } from '@/components/resources/resourceData';
// // import { academicResources, generalResources } from './resourcesData';


// interface Resource {
//   title: string;
//   description: string;
//   type: string;
//   content: {
//     text?: string;
//     videoUrl?: string;
//     pdfUrl?: string;
//     practice?: {
//       questions: {
//         options: string[];
//         answer: string;
//       }[];
//     };
//   };
// }

// const ResourcesPage = () => {
//   const [activeTab, setActiveTab] = useState('academic');
//   const [selectedResource, setSelectedResource] = useState(academicResources[0]);

//   const tabs = [
//     { id: 'academic', label: 'Academic', icon: GraduationCap },
//     { id: 'general', label: 'General Training', icon: Book },
//     { id: 'reading', label: 'Reading', icon: BookOpen },
//     { id: 'writing', label: 'Writing', icon: Pen },
//     { id: 'listening', label: 'Listening', icon: Headphones },
//     { id: 'speaking', label: 'Speaking', icon: Mic }
//   ];

//   const getActiveResources = () => {
//     switch (activeTab) {
//       case 'academic':
//         return academicResources;
//       case 'general':
//         return generalResources;
//       case 'reading':
//         return readingResources;
//       case 'writing':
//         return writingResources;
//       case 'listening':
//         return listeningResources;
//       case 'speaking':
//         return speakingResources;
//       default:
//         return [];
//     }
//   };

//   const handleTabChange = (tabId: string) => {
//     setActiveTab(tabId);
//     setSelectedResource(getActiveResources()[0]);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="text-center mb-12">
//           <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
//             IELTS Resources
//           </h1>
//           <p className="mt-4 text-xl text-gray-500">
//             Comprehensive study materials for IELTS preparation
//           </p>
//         </div>

//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Sidebar Navigation */}
//           <div className="lg:w-64 flex-shrink-0">
//             <nav className="space-y-1">
//               {tabs.map(({ id, label, icon: Icon }) => (
//                 <button
//                   key={id}
//                   onClick={() => handleTabChange(id)}
//                   className={`
//                     w-full flex items-center px-3 py-2 text-sm font-medium rounded-md
//                     ${activeTab === id
//                       ? 'bg-blue-50 text-blue-700'
//                       : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                     }
//                   `}
//                 >
//                   <Icon className="mr-3 h-5 w-5" />
//                   {label}
//                 </button>
//               ))}
//             </nav>

//             <div className="mt-8">
//               <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                 Available Resources
//               </h3>
//               <div className="mt-2 space-y-1">
//                 {getActiveResources().map((resource, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setSelectedResource(resource)}
//                     className={`
//                       w-full flex items-center px-3 py-2 text-sm rounded-md
//                       ${selectedResource === resource
//                         ? 'bg-gray-100 text-gray-900 font-medium'
//                         : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                       }
//                     `}
//                   >
//                     {resource.title}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Main Content Area */}
//           <div className="flex-1 bg-white rounded-lg shadow">
//             <ResourceContent resource={selectedResource} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResourcesPage;


"use client"
import React, { useState } from 'react';
import { Book, BookOpen, Headphones, Pen, Mic, GraduationCap } from 'lucide-react';
import ResourceContent from '@/components/resources/ResourceContent';
import { academicResources, generalResources, readingResources, writingResources, listeningResources, speakingResources } from '@/components/resources/resourceData';



interface Resource {
  title: string;
  description: string;
  type: "article" | "video" | "practice" | "pdf";
  content: {
    text?: string;
    videoUrl?: string;
    practice?: {
      questions: {
        question: string;
        options: string[];
        answer: string;
      }[];
    };
  };
}

const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState('academic');
  const [selectedResource, setSelectedResource] = useState<Resource>(academicResources[0]);

  const tabs = [
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'general', label: 'General Training', icon: Book },
    { id: 'reading', label: 'Reading', icon: BookOpen },
    { id: 'writing', label: 'Writing', icon: Pen },
    { id: 'listening', label: 'Listening', icon: Headphones },
    { id: 'speaking', label: 'Speaking', icon: Mic }
  ];

  const getActiveResources = (): Resource[] => {
    switch (activeTab) {
      case 'academic':
        return academicResources;
      case 'general':
        return generalResources;
      case 'reading':
        return readingResources;
      case 'writing':
        return writingResources;
      case 'listening':
        return listeningResources;
      case 'speaking':
        return speakingResources;
      default:
        return [];
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedResource(getActiveResources()[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            IELTS Resources
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Comprehensive study materials for IELTS preparation
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${activeTab === id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Available Resources
              </h3>
              <div className="mt-2 space-y-1">
                {getActiveResources().map((resource, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedResource(resource)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm rounded-md
                      ${selectedResource === resource
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {resource.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-lg shadow">
            <ResourceContent resource={selectedResource} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;