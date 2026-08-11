'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface FilterSelectProps {
  name: string;
  options: { label: string; value: string }[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export function FilterSelect({
  name,
  options,
  defaultValue = '',
  placeholder = 'Todos',
  className = 'px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5CB2D4]',
}: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val) {
      params.set(name, val);
    } else {
      params.delete(name);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      name={name}
      defaultValue={defaultValue}
      onChange={handleChange}
      className={className}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
