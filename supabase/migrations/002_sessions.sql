-- sessions: voice conversation sessions
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  avatar_id uuid, -- fk added after avatars table
  profile_label text,
  profile_data jsonb default '{}',
  duration_seconds int default 0,
  credits_used int default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

alter table public.sessions enable row level security;

create policy "Users can read own sessions"
  on public.sessions for select using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.sessions for update using (auth.uid() = user_id);

-- transcript entries
create table public.transcript_entries (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.sessions on delete cascade,
  role text not null check (role in ('user', 'model')),
  content text not null,
  seq int not null,
  created_at timestamptz not null default now()
);

alter table public.transcript_entries enable row level security;

create policy "Users can read own transcripts"
  on public.transcript_entries for select
  using (exists (
    select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()
  ));

create policy "Users can insert own transcripts"
  on public.transcript_entries for insert
  with check (exists (
    select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()
  ));
