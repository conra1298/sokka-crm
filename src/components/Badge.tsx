import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent1' | 'accent2' | 'slate' | 'success' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-[#274283]/10 text-[#274283] border-[#274283]/20',
    secondary: 'bg-[#5CB2D4]/20 text-[#0f172a] border-[#5CB2D4]/30',
    accent1: 'bg-[#EDA143]/20 text-[#9a5b00] border-[#EDA143]/30',
    accent2: 'bg-[#EB7638]/15 text-[#c24f15] border-[#EB7638]/30',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs font-semibold',
    md: 'px-3 py-1 text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
