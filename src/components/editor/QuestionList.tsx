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
import { getLevelLabel, getLevelColor } from '../../utils/spaced-repetition';
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 text-gray-400 cursor-grab active:cursor-grabbing touch-none"
      >
        ⠿
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge
            className={
              question.type === 'blank'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
            }
          >
            {question.type === 'blank' ? '단답형' : '서술형'}
          </Badge>
          <Badge className={getLevelColor(question.level)}>{getLevelLabel(question.level)}</Badge>
          {question.tags.map((t) => (
            <Badge key={t} className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {t}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
          {question.type === 'blank' ? renderPreview(question.content) : question.content}
        </p>
      </div>

      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => navigate(`/set/${setId}/edit/${question.id}`)}
          className="p-1.5 text-gray-400 hover:text-blue-500 rounded transition-colors"
          title="편집"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(question.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
          title="삭제"
        >
          🗑️
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
        <div className="space-y-2">
          {questions.map((q) => (
            <SortableItem key={q.id} question={q} setId={setId} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
