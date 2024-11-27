import React from 'react';

interface CurrencyToggleProps {
  currency: 'USD' | 'INR';
  onChange: (currency: 'USD' | 'INR') => void;
}

export const CurrencyToggle: React.FC<CurrencyToggleProps> = ({ currency, onChange }) => {
  return (
    <div className="flex items-center rounded-lg border border-gray-200 p-1">
      <button
        onClick={() => onChange('USD')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          currency === 'USD'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        USD
      </button>
      <button
        onClick={() => onChange('INR')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          currency === 'INR'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        INR
      </button>
    </div>
  );
};