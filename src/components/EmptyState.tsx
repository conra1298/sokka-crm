import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
}

export default function EmptyState({
  title,
  description,
  action,
  icon: Icon = FolderOpen,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-center my-6">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-[#274283] mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-display font-semibold text-lg text-slate-800 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
