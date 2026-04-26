import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-6"
      onClick={onClose}
      style={{
        background: 'oklch(15% 0.02 270 / .32)',
        backdropFilter: 'blur(4px)',
        animation: 'eh-fade-in .15s ease',
      }}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 24,
          boxShadow: '0 30px 80px -20px oklch(0% 0 0 / .25)',
          overflow: 'hidden',
          animation: 'eh-modal-in .2s cubic-bezier(.2,.7,.3,1.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={{ padding: '22px 24px 4px' }}>
            <div className="flex items-center justify-between">
              <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.01em', margin: 0, color: 'var(--ink)' }}>
                {title}
              </h2>
              <button
                onClick={onClose}
                className="eh-icon-btn eh-icon-btn-sm"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <div style={{ padding: '18px 24px 24px' }}>{children}</div>
      </div>
    </div>
  );
}
