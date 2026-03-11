create table public.social_connections (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles on delete cascade,
  platform text not null,
  platform_user_id text,
  platform_username text,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(creator_id, platform)
);

alter table public.social_connections enable row level security;

create policy "Creators can read own connections"
  on public.social_connections for select using (auth.uid() = creator_id);
