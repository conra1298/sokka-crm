import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlightColor?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlightColor = '#274283',
}: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: highlightColor }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="font-display font-black text-2xl lg:text-3xl text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        {icon && (
          <div
            className="p-3 rounded-2xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: highlightColor }}
          >
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
          {trend && (
            <span
              className={`font-bold px-2 py-0.5 rounded-md ${
                trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
