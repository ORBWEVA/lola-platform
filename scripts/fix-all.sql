-- LoLA Platform: Fix-All Migration
-- Run in Supabase SQL Editor for project udftjfjfxyvghngqywth
-- This is safe to run multiple times (all operations are idempotent)

-- =============================================
-- STEP 1: Profiles columns
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'learner';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits int DEFAULT 15;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_data jsonb DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;

-- =============================================
-- STEP 2: Avatars table (already exists, ensure columns)
-- =============================================
CREATE TABLE IF NOT EXISTS public.avatars (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles on delete cascade,
  name text not null,
  slug text unique not null,
  tagline text,
  domain text not null,
  personality_traits text,
  appearance_description text,
  anchor_image_url text,
  scene_images text[] default '{}',
  voice_id text default 'shimmer',
  conversation_mode text default 'coaching',
  knowledge_base jsonb,
  system_instruction_override text,
  social_links jsonb default '{}',
  is_published boolean default false,
  session_count int default 0,
  rating decimal(2,1) default 5.0,
  created_at timestamptz not null default now()
);
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published avatars" ON public.avatars;
CREATE POLICY "Anyone can read published avatars" ON public.avatars FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Creators can read own avatars" ON public.avatars;
CREATE POLICY "Creators can read own avatars" ON public.avatars FOR SELECT USING (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Creators can insert own avatars" ON public.avatars;
CREATE POLICY "Creators can insert own avatars" ON public.avatars FOR INSERT WITH CHECK (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Creators can update own avatars" ON public.avatars;
CREATE POLICY "Creators can update own avatars" ON public.avatars FOR UPDATE USING (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Creators can delete own avatars" ON public.avatars;
CREATE POLICY "Creators can delete own avatars" ON public.avatars FOR DELETE USING (auth.uid() = creator_id);
DROP POLICY IF EXISTS "Service can insert avatars" ON public.avatars;
CREATE POLICY "Service can insert avatars" ON public.avatars FOR INSERT WITH CHECK (true);

-- =============================================
-- STEP 3: Sessions table
-- =============================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  avatar_id uuid,
  profile_label text,
  profile_data jsonb default '{}',
  duration_seconds int default 0,
  credits_used int default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own sessions" ON public.sessions;
CREATE POLICY "Users can read own sessions" ON public.sessions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.sessions;
CREATE POLICY "Users can insert own sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own sessions" ON public.sessions;
CREATE POLICY "Users can update own sessions" ON public.sessions FOR UPDATE USING (auth.uid() = user_id);

-- FK from sessions to avatars
DO $$ BEGIN
  ALTER TABLE public.sessions ADD CONSTRAINT sessions_avatar_id_fkey
    FOREIGN KEY (avatar_id) REFERENCES public.avatars(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- STEP 4: Transcript entries
-- =============================================
CREATE TABLE IF NOT EXISTS public.transcript_entries (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.sessions on delete cascade,
  role text not null check (role in ('user', 'model')),
  content text not null,
  seq int not null,
  created_at timestamptz not null default now()
);
ALTER TABLE public.transcript_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own transcripts" ON public.transcript_entries;
CREATE POLICY "Users can read own transcripts" ON public.transcript_entries FOR SELECT
  USING (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can insert own transcripts" ON public.transcript_entries;
CREATE POLICY "Users can insert own transcripts" ON public.transcript_entries FOR INSERT
  WITH CHECK (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));

-- =============================================
-- STEP 5: Creator products
-- =============================================
CREATE TABLE IF NOT EXISTS public.creator_products (
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
ALTER TABLE public.creator_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active products" ON public.creator_products;
CREATE POLICY "Anyone can read active products" ON public.creator_products FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Creators can manage own products" ON public.creator_products;
CREATE POLICY "Creators can manage own products" ON public.creator_products FOR ALL USING (auth.uid() = creator_id);

-- =============================================
-- STEP 6: Credit purchases
-- =============================================
CREATE TABLE IF NOT EXISTS public.credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  stripe_payment_intent text,
  credits_added int not null,
  amount_cents int not null,
  currency text default 'usd',
  created_at timestamptz not null default now()
);
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own purchases" ON public.credit_purchases;
CREATE POLICY "Users can read own purchases" ON public.credit_purchases FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- STEP 7: Creator subscriptions
-- =============================================
CREATE TABLE IF NOT EXISTS public.creator_subscriptions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles on delete cascade,
  tier text not null default 'free',
  stripe_subscription_id text,
  status text default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);
ALTER TABLE public.creator_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Creators can read own subscriptions" ON public.creator_subscriptions;
CREATE POLICY "Creators can read own subscriptions" ON public.creator_subscriptions FOR SELECT USING (auth.uid() = creator_id);

-- =============================================
-- STEP 8: Content library
-- =============================================
CREATE TABLE IF NOT EXISTS public.content_library (
  id uuid primary key default gen_random_uuid(),
  avatar_id uuid not null references public.avatars on delete cascade,
  platform text,
  post_url text,
  caption text,
  scene_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Creators can read own content" ON public.content_library;
CREATE POLICY "Creators can read own content" ON public.content_library FOR SELECT
  USING (exists (select 1 from public.avatars a where a.id = avatar_id and a.creator_id = auth.uid()));
DROP POLICY IF EXISTS "Service role can insert content" ON public.content_library;
CREATE POLICY "Service role can insert content" ON public.content_library FOR INSERT WITH CHECK (true);

-- =============================================
-- STEP 9: Helper functions
-- =============================================
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount int)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles SET credits = greatest(credits - p_amount, 0) WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_session_count(p_avatar_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.avatars SET session_count = session_count + 1 WHERE id = p_avatar_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STEP 10: Seed ALL demo avatars (including Sara)
-- =============================================
DO $$
DECLARE
  demo_user_id uuid;
BEGIN
  SELECT id INTO demo_user_id FROM public.profiles LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'No profiles found. Sign up first, then re-run.';
  END IF;

  -- Update demo user to creator role
  UPDATE public.profiles SET role = 'creator', credits = 999, display_name = COALESCE(display_name, 'LoLA Demo') WHERE id = demo_user_id;

  -- Sara (language coaching, female voice)
  INSERT INTO public.avatars (creator_id, name, slug, domain, personality_traits, tagline, appearance_description, anchor_image_url, scene_images, voice_id, conversation_mode, is_published)
  VALUES (
    demo_user_id,
    'Sara',
    'sara',
    'language_coaching',
    'Energetic, adaptable, multilingual, encouraging, fun conversationalist',
    'Pick a language, any language — I''ll keep up. Let''s talk.',
    'Young woman in her mid-20s with warm olive skin, dark wavy hair, bright expressive eyes, casual stylish outfit',
    '/avatars/sara/anchor.jpg',
    ARRAY[]::text[],
    'shimmer',
    'coaching',
    true
  ) ON CONFLICT (slug) DO UPDATE SET
    voice_id = 'shimmer',
    is_published = true,
    anchor_image_url = EXCLUDED.anchor_image_url;

  -- Sakura Sensei
  INSERT INTO public.avatars (creator_id, name, slug, domain, personality_traits, tagline, appearance_description, anchor_image_url, scene_images, voice_id, conversation_mode, is_published)
  VALUES (
    demo_user_id,
    'Sakura Sensei',
    'sakura-sensei',
    'language_coaching',
    'Warm, encouraging, patient with beginners, uses gentle humor, celebrates small wins',
    'Your personal Japanese language coach — multilingual and always patient',
    'Young Japanese woman in her late 20s, long dark hair, warm smile, casual-chic outfit',
    'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/anchor.png',
    ARRAY[
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/scene-0.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/scene-1.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/scene-2.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/scene-3.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/scene-4.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/scene-5.png'
    ],
    'shimmer',
    'coaching',
    true
  ) ON CONFLICT (slug) DO UPDATE SET
    anchor_image_url = EXCLUDED.anchor_image_url,
    scene_images = EXCLUDED.scene_images,
    is_published = true;

  -- Coach Marcus
  INSERT INTO public.avatars (creator_id, name, slug, domain, personality_traits, tagline, appearance_description, anchor_image_url, scene_images, voice_id, conversation_mode, is_published)
  VALUES (
    demo_user_id,
    'Coach Marcus',
    'coach-marcus',
    'fitness',
    'Motivating, direct but empathetic, evidence-based, high energy, tough love with heart',
    'Your AI fitness coach — adapts to your level, speaks your language',
    'Athletic Black man in his early 30s, short fade haircut, bright confident smile, fitted athletic shirt',
    'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/anchor.png',
    ARRAY[
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/scene-0.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/scene-1.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/scene-2.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/scene-3.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/scene-4.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/scene-5.png'
    ],
    'echo',
    'coaching',
    true
  ) ON CONFLICT (slug) DO UPDATE SET
    anchor_image_url = EXCLUDED.anchor_image_url,
    scene_images = EXCLUDED.scene_images,
    is_published = true;

  -- Alex Rivera
  INSERT INTO public.avatars (creator_id, name, slug, domain, personality_traits, tagline, appearance_description, anchor_image_url, scene_images, voice_id, conversation_mode, is_published)
  VALUES (
    demo_user_id,
    'Alex Rivera',
    'alex-rivera',
    'sales',
    'Charismatic, strategic, asks great questions, consultative approach, data-driven',
    'Your AI sales advisor — closes deals, builds relationships',
    'Professional Hispanic man in his mid-35s, well-groomed short dark hair, tailored navy blazer',
    'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/anchor.png',
    ARRAY[
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/scene-0.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/scene-1.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/scene-2.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/scene-3.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/scene-4.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/scene-5.png'
    ],
    'alloy',
    'sales',
    true
  ) ON CONFLICT (slug) DO UPDATE SET
    anchor_image_url = EXCLUDED.anchor_image_url,
    scene_images = EXCLUDED.scene_images,
    is_published = true;

  -- Emma Lindgren
  INSERT INTO public.avatars (creator_id, name, slug, domain, personality_traits, tagline, appearance_description, anchor_image_url, scene_images, voice_id, conversation_mode, is_published)
  VALUES (
    demo_user_id,
    'Emma Lindgren',
    'emma-lindgren',
    'mentoring',
    'Strategic, empathetic, direct but warm, asks powerful questions, experienced startup advisor',
    'Your AI business mentor — strategic thinking, real talk',
    'Professional Scandinavian woman in her early 40s, blonde hair in a relaxed updo, confident warm smile, tailored blazer',
    'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/anchor.png',
    ARRAY[
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/scene-0.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/scene-1.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/scene-2.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/scene-3.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/scene-4.png',
      'https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/scene-5.png'
    ],
    'nova',
    'coaching',
    true
  ) ON CONFLICT (slug) DO UPDATE SET
    anchor_image_url = EXCLUDED.anchor_image_url,
    scene_images = EXCLUDED.scene_images,
    is_published = true;

  RAISE NOTICE 'All 5 demo avatars seeded with creator_id: %', demo_user_id;
END $$;

-- =============================================
-- DIAGNOSTIC: Show what was created
-- =============================================
SELECT 'avatars' as tbl, count(*) from public.avatars
UNION ALL SELECT 'sessions', count(*) from public.sessions
UNION ALL SELECT 'transcript_entries', count(*) from public.transcript_entries
UNION ALL SELECT 'creator_products', count(*) from public.creator_products
UNION ALL SELECT 'credit_purchases', count(*) from public.credit_purchases;

-- Show seeded avatars
SELECT name, slug, voice_id, is_published FROM public.avatars ORDER BY name;
