import React from 'react';
import { Play, FileText, BookOpen } from 'lucide-react';

interface Resource {
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'article' | 'practice';
  content: {
    text?: string;
    videoUrl?: string;
    practice?: {
      questions: Array<{
        question: string;
        options?: string[];
        answer?: string;
      }>;
    };
  };
}

interface ResourceContentProps {
  resource: Resource;
}

const ResourceContent: React.FC<ResourceContentProps> = ({ resource }) => {
  const renderContent = () => {
    switch (resource.type) {
      case 'video':
        return (
          <div className="aspect-w-16 aspect-h-9">
            <div className="flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <Play className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Video content will be played here</p>
              </div>
            </div>
          </div>
        );

      case 'practice':
        return (
          <div className="space-y-6">
            {resource.content.practice?.questions.map((q, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900 mb-3">{q.question}</p>
                {q.options && (
                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="prose max-w-none">
            {resource.content.text?.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        );
    }
  };

  const getIcon = () => {
    switch (resource.type) {
      case 'video':
        return <Play className="h-6 w-6" />;
      case 'practice':
        return <BookOpen className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          {getIcon()}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{resource.title}</h2>
          <p className="text-gray-500">{resource.description}</p>
        </div>
      </div>
      
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ResourceContent;