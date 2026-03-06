-- avatars: AI characters created by creators
create table public.avatars (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles on delete cascade,
  name text not null,
  slug text unique not null,
  tagline text,
  domain text not null check (domain in ('language_coaching', 'fitness', 'sales', 'mentoring', 'support', 'custom')),
  personality_traits text,
  appearance_description text,
  anchor_image_url text,
  scene_images text[] default '{}',
  voice_id text default 'shimmer',
  conversation_mode text default 'coaching' check (conversation_mode in ('coaching', 'sales', 'support', 'freeform')),
  knowledge_base jsonb,
  system_instruction_override text,
  social_links jsonb default '{}',
  is_published boolean default false,
  session_count int default 0,
  rating decimal(2,1) default 5.0,
  created_at timestamptz not null default now()
);

alter table public.avatars enable row level security;

-- Anyone can read published avatars (public profile pages)
create policy "Anyone can read published avatars"
  on public.avatars for select using (is_published = true);

-- Creators can read all their own avatars
create policy "Creators can read own avatars"
  on public.avatars for select using (auth.uid() = creator_id);

create policy "Creators can insert own avatars"
  on public.avatars for insert with check (auth.uid() = creator_id);

create policy "Creators can update own avatars"
  on public.avatars for update using (auth.uid() = creator_id);

create policy "Creators can delete own avatars"
  on public.avatars for delete using (auth.uid() = creator_id);

-- Add avatar_id FK to sessions
alter table public.sessions
  add constraint sessions_avatar_id_fkey
  foreign key (avatar_id) references public.avatars(id) on delete set null;
