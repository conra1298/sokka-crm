import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#274283] tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-slate-600 text-sm mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3 flex-wrap">{children}</div>}
    </div>
  );
}
