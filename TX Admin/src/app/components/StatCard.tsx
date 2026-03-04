import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export default function StatCard({ icon, label, value, change, changeType = 'neutral' }: StatCardProps) {
  const changeColor = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-neutral-400'
  };

  return (
    <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-[#0f0f0f] rounded-xl">
          {icon}
        </div>
        {change && (
          <span className={`text-sm ${changeColor[changeType]}`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-neutral-400 text-sm mb-1">{label}</p>
        <p className="text-2xl text-white">{value}</p>
      </div>
    </div>
  );
}
