import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './useLocalStorage';
import type { ExamSet, Question } from '../types';

const STORAGE_KEY = 'exam-master-data';

export function useExamSets() {
  const [sets, setSets] = useLocalStorage<ExamSet[]>(STORAGE_KEY, []);

  const addSet = useCallback(
    (data: Pick<ExamSet, 'title' | 'subtitle' | 'tags'>) => {
      const newSet: ExamSet = {
        id: uuidv4(),
        title: data.title,
        subtitle: data.subtitle,
        tags: data.tags,
        questions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSets((prev) => [...prev, newSet]);
      return newSet;
    },
    [setSets]
  );

  const updateSet = useCallback(
    (id: string, updates: Partial<Omit<ExamSet, 'id' | 'createdAt'>>) => {
      setSets((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
        )
      );
    },
    [setSets]
  );

  const deleteSet = useCallback(
    (id: string) => {
      setSets((prev) => prev.filter((s) => s.id !== id));
    },
    [setSets]
  );

  const getSet = useCallback(
    (id: string) => sets.find((s) => s.id === id),
    [sets]
  );

  const addQuestion = useCallback(
    (setId: string, question: Omit<Question, 'id' | 'history' | 'level' | 'nextReviewAt'>) => {
      const newQ: Question = {
        ...question,
        id: uuidv4(),
        history: [],
        level: 0,
        nextReviewAt: 0,
      };
      setSets((prev) =>
        prev.map((s) =>
          s.id === setId
            ? { ...s, questions: [...s.questions, newQ], updatedAt: Date.now() }
            : s
        )
      );
      return newQ;
    },
    [setSets]
  );

  const updateQuestion = useCallback(
    (setId: string, questionId: string, updates: Partial<Question>) => {
      setSets((prev) =>
        prev.map((s) =>
          s.id === setId
            ? {
                ...s,
                questions: s.questions.map((q) =>
                  q.id === questionId ? { ...q, ...updates } : q
                ),
                updatedAt: Date.now(),
              }
            : s
        )
      );
    },
    [setSets]
  );

  const deleteQuestion = useCallback(
    (setId: string, questionId: string) => {
      setSets((prev) =>
        prev.map((s) =>
          s.id === setId
            ? {
                ...s,
                questions: s.questions.filter((q) => q.id !== questionId),
                updatedAt: Date.now(),
              }
            : s
        )
      );
    },
    [setSets]
  );

  const reorderQuestions = useCallback(
    (setId: string, newOrder: Question[]) => {
      setSets((prev) =>
        prev.map((s) =>
          s.id === setId ? { ...s, questions: newOrder, updatedAt: Date.now() } : s
        )
      );
    },
    [setSets]
  );

  const importSet = useCallback(
    (examSet: ExamSet) => {
      setSets((prev) => {
        const exists = prev.find((s) => s.id === examSet.id);
        if (exists) {
          return prev.map((s) => (s.id === examSet.id ? { ...examSet, updatedAt: Date.now() } : s));
        }
        return [...prev, { ...examSet, updatedAt: Date.now() }];
      });
    },
    [setSets]
  );

  return {
    sets,
    addSet,
    updateSet,
    deleteSet,
    getSet,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    importSet,
  };
}
