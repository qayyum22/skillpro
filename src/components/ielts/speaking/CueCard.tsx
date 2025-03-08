import React from 'react';
import { Card } from '@/components/ui/card';

interface CueCardProps {
  topic: string;
  bulletPoints: string[];
  preparationTime: number;
}

const CueCard: React.FC<CueCardProps> = ({ topic, bulletPoints, preparationTime }) => {
  return (
    <Card className="p-6 bg-white shadow-md">
      <h3 className="text-lg font-semibold mb-4">{topic}</h3>
      <div className="space-y-2">
        <p>You should say:</p>
        <ul className="list-disc list-inside space-y-2">
          {bulletPoints.map((point, index) => (
            <li key={index} className="text-gray-700">{point}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>You have {preparationTime} seconds to prepare your answer.</p>
      </div>
    </Card>
  );
};

export default CueCard;
