import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ExamSet, Question } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import {
  fetchAllSets,
  createSet as svcCreateSet,
  updateSet as svcUpdateSet,
  deleteSetRow,
  insertQuestion,
  updateQuestionRow,
  deleteQuestionRow,
  reorderQuestionsRows,
  bulkImportLocalSets,
} from '../lib/examSetsService';

const STORAGE_KEY = 'exam-master-data';

interface ExamSetsContextValue {
  sets: ExamSet[];
  loading: boolean;
  syncing: boolean;
  online: boolean;
  cloudEnabled: boolean;
  addSet: (data: Pick<ExamSet, 'title' | 'subtitle' | 'tags'>) => ExamSet;
  updateSet: (id: string, updates: Partial<Omit<ExamSet, 'id' | 'createdAt'>>) => void;
  deleteSet: (id: string) => void;
  getSet: (id: string) => ExamSet | undefined;
  addQuestion: (
    setId: string,
    question: Omit<Question, 'id' | 'history' | 'level' | 'nextReviewAt'>
  ) => Question;
  updateQuestion: (setId: string, questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (setId: string, questionId: string) => void;
  reorderQuestions: (setId: string, newOrder: Question[]) => void;
  importSet: (examSet: ExamSet) => void;
  refreshFromCloud: () => Promise<void>;
}

const ExamSetsContext = createContext<ExamSetsContextValue | null>(null);

function safeAsync(fn: () => Promise<void>) {
  fn().catch((err) => console.error('[examSets sync]', err));
}

export function ExamSetsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, configured } = useAuth();
  const [sets, setSetsLocal] = useLocalStorage<ExamSet[]>(STORAGE_KEY, []);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const cloudEnabled = configured && !!user;

  // online/offline listener
  useEffect(() => {
    const onUp = () => setOnline(true);
    const onDown = () => setOnline(false);
    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
    };
  }, []);

  // Initial load: when auth is settled and user is signed in, hydrate from cloud.
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      if (cloudEnabled && user) {
        setLoading(true);
        try {
          // 1) push any local-only sets the user had before login (one-shot import).
          if (sets.length > 0 && !localStorage.getItem('exam-master-pushed-' + user.id)) {
            try {
              await bulkImportLocalSets(user.id, sets);
              localStorage.setItem('exam-master-pushed-' + user.id, '1');
            } catch (e) {
              console.warn('[examSets] bulk import skipped', e);
            }
          }
          // 2) hydrate fresh state from cloud
          const cloud = await fetchAllSets(user.id);
          if (!cancelled) {
            setSetsLocal(cloud);
          }
        } catch (e) {
          console.error('[examSets] cloud hydrate failed, using local cache', e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      } else {
        // Anonymous / unconfigured: just use local cache.
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, cloudEnabled, user?.id]);

  const refreshFromCloud = useCallback(async () => {
    if (!cloudEnabled || !user) return;
    setSyncing(true);
    try {
      const cloud = await fetchAllSets(user.id);
      setSetsLocal(cloud);
    } finally {
      setSyncing(false);
    }
  }, [cloudEnabled, user, setSetsLocal]);

  // ---------- Mutations: optimistic local + remote write ----------
  const addSet = useCallback<ExamSetsContextValue['addSet']>(
    (data) => {
      const newSet: ExamSet = {
        id: uuidv4(),
        title: data.title,
        subtitle: data.subtitle,
        tags: data.tags,
        questions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSetsLocal((prev) => [newSet, ...prev]);
      if (cloudEnabled && user) {
        safeAsync(() =>
          svcCreateSet(user.id, {
            id: newSet.id,
            title: newSet.title,
            subtitle: newSet.subtitle,
            tags: newSet.tags,
          })
        );
      }
      return newSet;
    },
    [cloudEnabled, user, setSetsLocal]
  );

  const updateSet = useCallback<ExamSetsContextValue['updateSet']>(
    (id, updates) => {
      setSetsLocal((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s))
      );
      if (cloudEnabled && user) {
        const slim: Partial<Pick<ExamSet, 'title' | 'subtitle' | 'tags'>> = {};
        if (updates.title !== undefined) slim.title = updates.title;
        if (updates.subtitle !== undefined) slim.subtitle = updates.subtitle;
        if (updates.tags !== undefined) slim.tags = updates.tags;
        if (Object.keys(slim).length > 0) safeAsync(() => svcUpdateSet(id, slim));
      }
    },
    [cloudEnabled, user, setSetsLocal]
  );

  const deleteSet = useCallback<ExamSetsContextValue['deleteSet']>(
    (id) => {
      setSetsLocal((prev) => prev.filter((s) => s.id !== id));
      if (cloudEnabled && user) safeAsync(() => deleteSetRow(id));
    },
    [cloudEnabled, user, setSetsLocal]
  );

  const getSet = useCallback((id: string) => sets.find((s) => s.id === id), [sets]);

  const addQuestion = useCallback<ExamSetsContextValue['addQuestion']>(
    (setId, q) => {
      const newQ: Question = {
        ...q,
        id: uuidv4(),
        history: [],
        level: 0,
        nextReviewAt: 0,
      };
      let position = 0;
      setSetsLocal((prev) =>
        prev.map((s) => {
          if (s.id !== setId) return s;
          position = s.questions.length;
          return { ...s, questions: [...s.questions, newQ], updatedAt: Date.now() };
        })
      );
      if (cloudEnabled && user) {
        safeAsync(() => insertQuestion(user.id, setId, newQ, position));
      }
      return newQ;
    },
    [cloudEnabled, user, setSetsLocal]
  );

  const updateQuestion = useCallback<ExamSetsContextValue['updateQuestion']>(
    (setId, questionId, updates) => {
      setSetsLocal((prev) =>
        prev.map((s) =>
          s.id === setId
            ? {
                ...s,
                questions: s.questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
                updatedAt: Date.now(),
              }
            : s
        )
      );
      if (cloudEnabled && user) safeAsync(() => updateQuestionRow(questionId, updates));
    },
    [cloudEnabled, user, setSetsLocal]
  );

  const deleteQuestion = useCallback<ExamSetsContextValue['deleteQuestion']>(
    (setId, questionId) => {
      setSetsLocal((prev) =>
        prev.map((s) =>
          s.id === setId
            ? { ...s, questions: s.questions.filter((q) => q.id !== questionId), updatedAt: Date.now() }
            : s
        )
      );
      if (cloudEnabled && user) safeAsync(() => deleteQuestionRow(questionId));
    },
    [cloudEnabled, user, setSetsLocal]
  );

  const reorderQuestions = useCallback<ExamSetsContextValue['reorderQuestions']>(
    (setId, newOrder) => {
      setSetsLocal((prev) =>
        prev.map((s) =>
          s.id === setId ? { ...s, questions: newOrder, updatedAt: Date.now() } : s
        )
      );
      if (cloudEnabled && user) {
        const ordered = newOrder.map((q, idx) => ({ id: q.id, position: idx }));
        safeAsync(() => reorderQuestionsRows(setId, ordered));
      }
    },
    [cloudEnabled, user, setSetsLocal]
  );

  const importSet = useCallback<ExamSetsContextValue['importSet']>(
    (examSet) => {
      setSetsLocal((prev) => {
        const exists = prev.find((s) => s.id === examSet.id);
        if (exists) {
          return prev.map((s) => (s.id === examSet.id ? { ...examSet, updatedAt: Date.now() } : s));
        }
        return [{ ...examSet, updatedAt: Date.now() }, ...prev];
      });
      if (cloudEnabled && user) {
        safeAsync(() => bulkImportLocalSets(user.id, [examSet]));
      }
    },
    [cloudEnabled, user, setSetsLocal]
  );

  const value: ExamSetsContextValue = {
    sets,
    loading,
    syncing,
    online,
    cloudEnabled,
    addSet,
    updateSet,
    deleteSet,
    getSet,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    importSet,
    refreshFromCloud,
  };

  return <ExamSetsContext.Provider value={value}>{children}</ExamSetsContext.Provider>;
}

export function useExamSetsContext() {
  const ctx = useContext(ExamSetsContext);
  if (!ctx) throw new Error('useExamSetsContext must be used within ExamSetsProvider');
  return ctx;
}
