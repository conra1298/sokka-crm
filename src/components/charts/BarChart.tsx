import { formatCurrency } from '@/lib/utils/normalization';

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    count: number;
    color?: string;
  }>;
}

export default function BarChart({ data }: BarChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-xs text-slate-400 italic">Sin datos disponibles.</p>;
  }

  const maxValue = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      {data.map((item, idx) => {
        const barWidthPct = Math.max(Math.round((item.count / maxValue) * 100), 6);
        const barColor = item.color || '#274283';

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 truncate max-w-[200px]">{item.label}</span>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-bold text-slate-900">{item.count} negocio(s)</span>
                <span className="text-slate-400">({formatCurrency(item.value)})</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${barWidthPct}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
