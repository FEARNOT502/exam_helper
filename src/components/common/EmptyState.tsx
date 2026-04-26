import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: 'var(--surface-2)',
          display: 'grid',
          placeItems: 'center',
          marginBottom: 16,
          color: 'var(--ink-3)',
          fontFamily: 'var(--font-mono)',
          fontSize: 20,
        }}
      >
        {icon ?? '·'}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--ink)', margin: 0, marginBottom: 6 }}>{title}</h3>
      {description && (
        <p className="eh-muted" style={{ fontSize: 13.5, lineHeight: 1.55, maxWidth: 360, margin: 0, marginBottom: actionLabel ? 20 : 0 }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
