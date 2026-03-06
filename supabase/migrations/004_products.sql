-- creator products: things avatars can recommend/sell
create table public.creator_products (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles on delete cascade,
  avatar_id uuid references public.avatars on delete set null,
  name text not null,
  description text,
  price decimal(10,2),
  currency text default 'USD',
  checkout_url text not null,
  platform text,
  image_url text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

alter table public.creator_products enable row level security;

create policy "Anyone can read active products"
  on public.creator_products for select using (is_active = true);

create policy "Creators can manage own products"
  on public.creator_products for all using (auth.uid() = creator_id);
