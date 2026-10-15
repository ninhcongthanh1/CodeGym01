import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning';
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  subtitle
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>

      {(change || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`font-semibold px-1.5 py-0.5 rounded-sm ${
                changeType === 'positive'
                  ? 'bg-emerald-50 text-emerald-700'
                  : changeType === 'negative'
                  ? 'bg-rose-50 text-rose-700'
                  : changeType === 'warning'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
