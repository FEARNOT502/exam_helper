interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  /** Optional legacy color hint — now mapped to eh-bar-* modifiers. */
  colorClass?: string;
}

export function ProgressBar({
  value,
  max,
  className = '',
  colorClass = '',
}: ProgressBarProps) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  // map any legacy Tailwind color class to a design-system modifier
  let tone = '';
  if (/green/.test(colorClass)) tone = 'eh-bar-ok';
  else if (/orange|yellow|amber/.test(colorClass)) tone = 'eh-bar-warn';
  else if (/blue|indigo|violet|purple/.test(colorClass)) tone = 'eh-bar-accent';

  return (
    <div className={`eh-bar ${tone} ${className}`}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
