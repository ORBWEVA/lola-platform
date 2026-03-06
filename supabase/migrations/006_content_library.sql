-- content library: tracks social media posts per avatar
create table public.content_library (
  id uuid primary key default gen_random_uuid(),
  avatar_id uuid not null references public.avatars on delete cascade,
  platform text,
  post_url text,
  caption text,
  scene_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.content_library enable row level security;

create policy "Creators can read own content"
  on public.content_library for select
  using (exists (
    select 1 from public.avatars a where a.id = avatar_id and a.creator_id = auth.uid()
  ));

create policy "Service role can insert content"
  on public.content_library for insert with check (true);
