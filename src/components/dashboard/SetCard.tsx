import { useNavigate } from 'react-router-dom';
import type { ExamSet } from '../../types';
import { Badge } from '../common/Badge';
import { isDueForReview } from '../../utils/spaced-repetition';

interface SetCardProps {
  set: ExamSet;
  onDelete: (id: string) => void;
}

export function SetCard({ set, onDelete }: SetCardProps) {
  const navigate = useNavigate();
  const total = set.questions.length;
  const memorized = set.questions.filter((q) => q.level === 3).length;
  const dueCount = set.questions.filter(isDueForReview).length;
  const pct = total === 0 ? 0 : Math.round((memorized / total) * 100);

  return (
    <div
      className="eh-card"
      onClick={() => navigate(`/set/${set.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--line-strong)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--line)';
        e.currentTarget.style.transform = '';
      }}
      style={{
        padding: 20,
        cursor: 'pointer',
        transition: 'all .16s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{
            fontSize: 15.5, fontWeight: 600, color: 'var(--ink)',
            margin: 0, letterSpacing: '-.015em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {set.title}
          </h3>
          {set.subtitle && (
            <p className="eh-muted" style={{
              fontSize: 12.5, margin: 0, marginTop: 4,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {set.subtitle}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(set.id);
          }}
          className="eh-icon-btn eh-icon-btn-sm"
          aria-label="삭제"
          title="삭제"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
        </button>
      </div>

      {set.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {set.tags.slice(0, 3).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          {set.tags.length > 3 && <Badge>+{set.tags.length - 3}</Badge>}
        </div>
      )}

      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11.5, fontFamily: 'var(--font-mono)',
          color: 'var(--ink-3)', marginBottom: 8,
          letterSpacing: '.01em',
        }}>
          <span>{memorized} / {total}</span>
          <span>{pct}%</span>
        </div>
        <div className="eh-bar eh-bar-ok">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      {dueCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: 'var(--warn)',
          borderTop: '1px solid var(--line)',
          marginTop: 8, paddingTop: 12,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--warn)' }} />
          오늘 복습 {dueCount}문제
        </div>
      )}
    </div>
  );
}
