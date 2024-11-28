import React from 'react';

const ProgressStats = () => {
  const stats = [
    { label: 'Practice Tests Completed', value: '12' },
    { label: 'Hours Practiced', value: '24' },
    { label: 'Current Band Score', value: '7.5' },
    { label: 'Days Streak', value: '5' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mx-4 -mt-8 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressStats;