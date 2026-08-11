interface PieChartProps {
  data: Array<{
    label: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}

export default function PieChart({ data }: PieChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-xs text-slate-400 italic">Sin datos de origen de leads.</p>;
  }

  const total = data.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="space-y-4">
      {/* Progress stack bar for donut-style view */}
      <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 p-0.5 border border-slate-200">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.color,
            }}
            title={`${item.label}: ${item.count} (${item.percentage}%)`}
          />
        ))}
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-semibold text-slate-700 truncate">{item.label}</span>
            </div>
            <span className="font-bold font-mono text-slate-900 ml-1">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
