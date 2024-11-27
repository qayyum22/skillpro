import React from "react";

interface BillingToggleProps {
  isYearly: boolean;
  onChange: (isYearly: boolean) => void;
}

export const BillingToggle: React.FC<BillingToggleProps> = ({
  isYearly,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-sm ${
          !isYearly ? "font-medium text-gray-900" : "text-gray-500"
        }`}
      >
        Monthly
      </span>
      <button
        onClick={() => onChange(!isYearly)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isYearly ? "bg-blue-600" : "bg-gray-200"
        }`}
        title={isYearly ? "Switch to yearly billing" : "Switch to monthly billing"}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isYearly ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span
        className={`text-sm ${
          isYearly ? "font-medium text-gray-900" : "text-gray-500"
        }`}
      >
        Yearly (Save up to 20%)
      </span>
    </div>
  );
};
