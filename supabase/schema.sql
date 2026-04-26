-- ===============================================
-- Exam Helper :: Supabase schema
-- Run this in the Supabase SQL editor.
-- ===============================================

create extension if not exists "uuid-ossp";

-- ---------- exam_sets ----------
create table if not exists public.exam_sets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subtitle text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exam_sets_user_idx on public.exam_sets(user_id, updated_at desc);

-- ---------- questions ----------
create table if not exists public.questions (
  id uuid primary key default uuid_generate_v4(),
  set_id uuid not null references public.exam_sets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('blank','essay')),
  content text not null,
  answer text,
  tags text[] not null default '{}',
  level int not null default 0 check (level between 0 and 3),
  next_review_at bigint not null default 0,
  history jsonb not null default '[]'::jsonb,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists questions_set_idx on public.questions(set_id, position);
create index if not exists questions_user_idx on public.questions(user_id);

-- ---------- study_sessions (학습 기록) ----------
create table if not exists public.study_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id uuid not null references public.exam_sets(id) on delete cascade,
  started_at timestamptz not null default now(),
  duration_sec int not null default 0,
  total int not null,
  correct int not null,
  mode text not null default 'study'
);

create index if not exists study_sessions_user_started_idx
  on public.study_sessions(user_id, started_at desc);

-- ---------- updated_at trigger ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_exam_sets_touch on public.exam_sets;
create trigger trg_exam_sets_touch
  before update on public.exam_sets
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_questions_touch on public.questions;
create trigger trg_questions_touch
  before update on public.questions
  for each row execute function public.touch_updated_at();

-- ===============================================
-- Row Level Security
-- ===============================================
alter table public.exam_sets       enable row level security;
alter table public.questions       enable row level security;
alter table public.study_sessions  enable row level security;

-- exam_sets
drop policy if exists "exam_sets owner all" on public.exam_sets;
create policy "exam_sets owner all"
  on public.exam_sets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- questions
drop policy if exists "questions owner all" on public.questions;
create policy "questions owner all"
  on public.questions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- study_sessions
drop policy if exists "study_sessions owner all" on public.study_sessions;
create policy "study_sessions owner all"
  on public.study_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
