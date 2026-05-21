// components/StatsCard.tsx
import React from "react";

interface Props {
  label: string;
  value: string;
  subValue?: string;
  isGain?: boolean | null; // true=green, false=red, null=neutral
}

const StatsCard: React.FC<Props> = ({ label, value, subValue, isGain }) => {
  const colour =
    isGain === true ? "text-green-600" :
    isGain === false ? "text-red-600" :
    "text-gray-900";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
        {label}
      </p>
      <p className={`text-xl font-bold ${colour}`}>{value}</p>
      {subValue && <p className={`text-sm mt-0.5 ${colour}`}>{subValue}</p>}
    </div>
  );
};

export default StatsCard;
