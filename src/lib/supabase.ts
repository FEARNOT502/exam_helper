import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export type Database = {
  public: {
    Tables: {
      exam_sets: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          subtitle: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          subtitle?: string | null;
          tags?: string[];
        };
        Update: Partial<{
          title: string;
          subtitle: string | null;
          tags: string[];
        }>;
      };
      questions: {
        Row: {
          id: string;
          set_id: string;
          user_id: string;
          type: 'blank' | 'essay';
          content: string;
          answer: string | null;
          tags: string[];
          level: number;
          next_review_at: number;
          history: unknown;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          set_id: string;
          user_id: string;
          type: 'blank' | 'essay';
          content: string;
          answer?: string | null;
          tags?: string[];
          level?: number;
          next_review_at?: number;
          history?: unknown;
          position?: number;
        };
        Update: Partial<Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'created_at'>>;
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          set_id: string;
          started_at: string;
          duration_sec: number;
          total: number;
          correct: number;
          mode: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          set_id: string;
          started_at?: string;
          duration_sec?: number;
          total: number;
          correct: number;
          mode?: string;
        };
        Update: Partial<Omit<Database['public']['Tables']['study_sessions']['Row'], 'id' | 'user_id'>>;
      };
    };
  };
};
