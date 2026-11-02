import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'amber',
}) => {
  const colorMap = {
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const iconBgMap = {
    amber: 'bg-amber-500/15 text-amber-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    blue: 'bg-blue-500/15 text-blue-400',
    purple: 'bg-purple-500/15 text-purple-400',
    rose: 'bg-rose-500/15 text-rose-400',
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${iconBgMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};
