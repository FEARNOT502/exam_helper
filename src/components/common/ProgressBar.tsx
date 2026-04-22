interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  colorClass?: string;
}

export function ProgressBar({
  value,
  max,
  className = '',
  colorClass = 'bg-blue-500',
}: ProgressBarProps) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={`h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
