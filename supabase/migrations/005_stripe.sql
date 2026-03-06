-- credit purchases
create table public.credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  stripe_payment_intent text,
  credits_added int not null,
  amount_cents int not null,
  currency text default 'usd',
  created_at timestamptz not null default now()
);

alter table public.credit_purchases enable row level security;

create policy "Users can read own purchases"
  on public.credit_purchases for select using (auth.uid() = user_id);

-- creator subscriptions
create table public.creator_subscriptions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'creator', 'pro', 'enterprise')),
  stripe_subscription_id text,
  status text default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.creator_subscriptions enable row level security;

create policy "Creators can read own subscriptions"
  on public.creator_subscriptions for select using (auth.uid() = creator_id);
