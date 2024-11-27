import React from 'react';
import { Download, ExternalLink } from 'lucide-react';

interface Resource {
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'article' | 'practice';
  url: string;
}

interface ResourceTabProps {
  resources: Resource[];
}

const ResourceTab: React.FC<ResourceTabProps> = ({ resources }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <Download className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'article':
        return 'bg-blue-100 text-blue-800';
      case 'practice':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyle(resource.type)}`}>
                {resource.type}
              </span>
            </div>
            <p className="mt-2 text-gray-600">{resource.description}</p>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              {getTypeIcon(resource.type)}
              <span className="ml-2">Access Resource</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourceTab;