import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Question } from '../../types';
import { Badge } from '../common/Badge';
import { getLevelLabel } from '../../utils/spaced-repetition';
import { renderPreview } from '../../utils/blank-parser';

interface QuestionListProps {
  setId: string;
  questions: Question[];
  onReorder: (questions: Question[]) => void;
  onDelete: (id: string) => void;
}

function SortableItem({
  question,
  setId,
  onDelete,
}: {
  question: Question;
  setId: string;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });
  const [showAnswer, setShowAnswer] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '14px 14px 14px 10px',
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 12,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <button
        {...attributes}
        {...listeners}
        aria-label="드래그하여 순서 변경"
        style={{
          marginTop: 2,
          color: 'var(--ink-4)',
          cursor: 'grab',
          touchAction: 'none',
          background: 'none',
          border: 'none',
          padding: 4,
          lineHeight: 1,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="4" r="1.1"/><circle cx="5" cy="8" r="1.1"/><circle cx="5" cy="12" r="1.1"/><circle cx="11" cy="4" r="1.1"/><circle cx="11" cy="8" r="1.1"/><circle cx="11" cy="12" r="1.1"/></svg>
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          <Badge className={question.type === 'blank' ? 'eh-chip-accent' : 'eh-chip-soft'}>
            {question.type === 'blank' ? '단답형' : '서술형'}
          </Badge>
          <Badge>{getLevelLabel(question.level)}</Badge>
          {question.tags.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: 0, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {question.type === 'blank' ? renderPreview(question.content) : question.content}
        </p>
        {showAnswer && (
          <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 13, color: 'var(--ink)' }}>
            <span style={{ fontWeight: 600, marginRight: 6, color: 'var(--ok)' }}>정답:</span>
            {question.type === 'blank' 
              ? question.content.match(/\{\{([^}]+)\}\}/g)?.map(m => m.slice(2, -2)).join(', ') || '없음'
              : (question.answer || '없음')}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <button
          onClick={() => setShowAnswer((s) => !s)}
          className="eh-icon-btn eh-icon-btn-sm"
          aria-label="정답 보기"
          title="정답 보기"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3c-4 0-7 5-7 5s3 5 7 5 7-5 7-5-3-5-7-5z"/><circle cx="8" cy="8" r="2.5"/></svg>
        </button>
        <button
          onClick={() => navigate(`/set/${setId}/edit/${question.id}`)}
          className="eh-icon-btn eh-icon-btn-sm"
          aria-label="편집"
          title="편집"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2.5l2.5 2.5L5 13.5H2.5V11z"/></svg>
        </button>
        <button
          onClick={() => onDelete(question.id)}
          className="eh-icon-btn eh-icon-btn-sm eh-icon-btn-danger"
          aria-label="삭제"
          title="삭제"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h10M6 4V2.5h4V4M4.5 4l.5 9.5h6L11.5 4"/></svg>
        </button>
      </div>
    </div>
  );
}

export function QuestionList({ setId, questions, onReorder, onDelete }: QuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      onReorder(arrayMove(questions, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {questions.map((q) => (
            <SortableItem key={q.id} question={q} setId={setId} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
