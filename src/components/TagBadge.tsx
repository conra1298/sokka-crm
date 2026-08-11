interface TagBadgeProps {
  name: string;
  color?: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export default function TagBadge({ name, color = '#5CB2D4', onRemove, size = 'sm' }: TagBadgeProps) {
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border transition-all ${
        isSm ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
      style={{
        backgroundColor: `${color}18`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:opacity-75 focus:outline-none"
        >
          ×
        </button>
      )}
    </span>
  );
}
