import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  bgColor: string;
  onClick: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon: Icon,
  bgColor,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-200 text-left"
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default ModuleCard;