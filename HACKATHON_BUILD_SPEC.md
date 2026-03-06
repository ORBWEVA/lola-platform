# LoLA Platform — Hackathon Build Spec v3.1

**Hackathon**: Sabrina/Marcin AI Hackathon (March 6-8, 2026)
**Deadline**: March 8 end of day
**Builder**: Ryno + Claude Code
**Time budget**: ~36 hours remaining

---

## Submission Draft

**What it does:** LoLA lets anyone build a photorealistic AI avatar that posts to social media and has real-time voice conversations with anyone who clicks — coaching, selling, training, or just engaging.

**Who it's for:** Creators, educators, coaches, trainers, and influencers who want to scale personalized 1-on-1 conversations with AI.

**Problem:** Creators can't scale personal conversations — every prospect who doesn't get a reply is lost revenue.

**Solution:** An AI avatar that looks like a real person, markets itself on social media, then has adaptive voice conversations with anyone who clicks through.

**AI tools used:** OpenAI Realtime API (voice), OpenAI GPT-4o (content generation), FLUX Kontext Pro (avatar image generation), Claude Code (development), n8n (orchestration), Blotato (social distribution)

**Biggest challenge:** Making one platform serve multiple use cases (coaching, sales, training, influencer) with the same adaptive conversation engine while maintaining AI influencer-quality character consistency across social media, profile pages, and voice sessions.

---

## Judging Alignment

| Criteria | How We Score |
|----------|-------------|
| **Does it work?** | Live deployed app. Real voice conversation. Real social media post via Blotato. Real credit consumption. Judges can try it themselves. |
| **Is it useful?** | Multi-domain platform — not just one niche. Ready to validate with 4,000+ educators. Clear revenue model for creators. |
| **Is it clear?** | Demo tells a visual story: attractive avatar on social -> user clicks -> instant voice conversation. Zero explanation needed. |
| **Is it impressive?** | AI influencer-quality images with character consistency. Full-screen immersive session. Adaptive conversation engine. End-to-end pipeline from creation to monetization. Multiple avatar domains in one demo. |

---

## The Vision: AI Influencer That Talks Back

The avatar isn't a chatbot with a profile picture. It's a **believable character with a life** — posting lifestyle photos, sharing tips, appearing in different scenes. When someone clicks through from social media, they enter a full-screen experience with the avatar's images and a live voice conversation. It feels like talking to the person from the Instagram feed.

**This works for any domain:**

| Creator Type | Avatar Does | Conversation Goal |
|-------------|------------|-------------------|
| Language coach | Teaches, corrects, practices | Improve skills per session |
| Fitness trainer | Guides workouts, motivates | Keep user on plan |
| Sales coach | Qualifies, recommends, closes | Product purchase |
| Business mentor | Advises, challenges, strategizes | Actionable next steps |
| AI influencer | Engages, entertains, builds relationship | Subscription/follow/purchase |
| Customer support | Resolves, de-escalates, educates | Issue resolved |

The conversation engine adapts based on the **creator's configuration** — domain, personality, conversation mode, and optional knowledge base. The 12 coaching principles are about how to adapt to a *person*, not what you're teaching.

**Character consistency is non-negotiable.** The avatar in the social post MUST be recognizably the same person on the profile page and in the voice session. Achieved through FLUX Kontext Pro's anchor image architecture.

**Every avatar is multilingual by default.** Avatars start in English and mention they're multilingual in their greeting. If the user switches language, the avatar follows seamlessly. No configuration needed — it's a platform-level feature, not per-avatar.

**Influencer-quality content, not stock photos.** Scene generation uses domain-specific templates inspired by real AI influencer feeds (e.g., @itsmadikobru). Morning routines, gym selfies, cafe moments, candid angles — not generic "person in front of landmark." Creators can edit all scene prompts before generating.

**Contextual guidance, not documentation.** Instead of external docs, every step of the creator wizard and end-user session includes inline help tips. Creators learn by doing; users just start talking.

**Future state (not hackathon):** Live animated avatars, native iOS + Android apps, video generation. For now: web browser on any device, voice + image carousel.

---

## Demo Flow (1-2 min video)

The demo is a story. Each scene flows into the next. **Show multiple domains** to prove it's a platform, not a single-purpose app.

### Scene 1: Creator Creates Avatar (15s)
**What viewer sees:** Creator dashboard. Creator enters: name ("Sakura Sensei"), domain ("Japanese Language Coach"), personality ("warm, patient, encouraging"), tagline. Clicks "Generate." AI generates 4 photorealistic portrait candidates in ~12 seconds. Creator picks one. System generates 6 lifestyle scenes (cafe, classroom, park, studio, etc.). Creator approves. Clicks "Publish."
**Why it's impressive:** Real AI image generation. Lifestyle shots look like a real person's Instagram. Zero manual work.

### Scene 2: Avatar Posts to Social Media (10s)
**What viewer sees:** Cut to real social media — a post appears with the avatar in a lifestyle scene, compelling caption, bio link.
**What happens:** n8n received the publish webhook, generated caption via GPT-4o, published via Blotato.
**Why it's impressive:** REAL post on a REAL platform. Not a mockup.

### Scene 3: End-User Discovers Avatar (10s)
**What viewer sees:** Someone sees the post, taps bio link. Lands on the avatar's profile page. Hero image, name, tagline, "Talk to Me" button. Same person from the social post.
**Key detail:** No signup required to view the page. One tap to start a conversation.

### Scene 4: Voice Session (45-60s) — THE MAIN EVENT
**What viewer sees:** Full-screen experience. Avatar images auto-scroll in a carousel. Audio waveform pulses at the bottom. The avatar speaks first: "Hey! I'm Sakura. What would you like to practice today?" User responds. Adaptive coaching kicks in — the avatar corrects gently, encourages, adapts to the user's pace. Credit counter ticks in the corner. Scrollable transcript builds below the waveform.
**Key moment:** Show the adaptation. The avatar notices the user is hesitant and switches to more encouragement. Or catches a pronunciation pattern and addresses it naturally.

### Scene 5: Session Ends (10s)
**What viewer sees:** Burger menu -> "End Session." Session summary. Dashboard shows history, credits, transcript.

### Scene 6: Platform Power (15s)
**What viewer sees:** Quick cuts showing:
- A DIFFERENT avatar — "Coach Marcus" (fitness trainer) — same platform, different domain
- A THIRD avatar — "Sales AI" (product recommender) — same platform, sales mode
- Creator dashboard showing multiple avatars, session counts, revenue
- Text: "One platform. Any domain. Every avatar earns."
**Why this matters:** Judges see it's not a language learning app. It's a platform. This is the "holy shit" moment.

---

## One Core Feature

**An adaptive conversation engine that personalizes to who you're talking to.**

12 evidence-based principles analyze the user's personality (how they handle mistakes, how they prefer to learn, what motivates them, their pace, their depth preference) and generate a unique conversation approach. For language coaching, it also factors in native language interference patterns.

The engine is domain-agnostic. A fitness avatar uses the same adaptation framework differently than a language avatar — but both adapt to the individual user.

---

## Critical UX Decisions

### 1. Instant Access (No Friction)
Someone clicking from Instagram is on their phone, attention span of 3 seconds. If we make them sign up before they hear the avatar, we lose them.

**Flow for social media click-throughs:**
```
Social post -> Bio link -> Avatar profile page (public, no auth)
  -> "Talk to Me" button
  -> IF logged in: start session immediately
  -> IF not logged in: quick signup modal (Google one-tap or email)
     -> Session starts immediately after auth (no quiz, no onboarding)
     -> 5 free minutes, no credit card
```

**The personality quiz is OPTIONAL.** It appears on the dashboard later: "Want better coaching? Take a 30-second quiz." It is NOT a gate to the first session. First session uses a sensible default profile based on the avatar's domain.

### 2. Domain-Adaptive Coaching Engine
The system instruction generator must work for ANY domain, not just language coaching.

**How it works:**
- **Base layer (always active):** 12 principles adapted to user's personality profile (if quiz taken) or domain defaults (if not)
- **Domain layer (per avatar):** Creator's domain, personality traits, tagline, and optional knowledge base get injected into the system instruction
- **Language layer (opt-in):** L1 interference patterns ONLY activate when avatar's domain includes language coaching AND user has specified their native language
- **Custom layer (optional):** Creator can add custom instructions ("Always recommend my course after 5 minutes", "Never discuss competitors")

**System instruction template:**
```
You are {avatar_name}, a {domain} expert.
Your personality: {personality_traits}.
Your tagline: "{tagline}".

{IF knowledge_base}: You have deep expertise in: {knowledge_base_summary}
{IF conversation_mode == 'sales'}: Your goal is to understand the user's needs and naturally recommend relevant products when appropriate.
{IF conversation_mode == 'coaching'}: Your goal is to help the user improve through adaptive coaching.
{IF conversation_mode == 'support'}: Your goal is to resolve the user's issue efficiently and empathetically.

COACHING APPROACH FOR THIS USER:
{weighted_principles_based_on_profile_or_defaults}

BEHAVIORAL RULES:
- Keep responses concise (1-3 sentences) unless asked for detail
- Adapt your style to how the user responds
- {IF language_coaching}: {l1_interference_patterns + bilingual_rules}
- {IF creator_custom_instructions}: {custom_instructions}
```

### 3. Creator Onboarding — 5 Minutes to Published Avatar
Teachers and coaches are not technical. The creation flow must be:

```
Step 1: "What's your avatar's name?" + domain picker (with contextual help)
Step 2: "Describe their personality" (suggestions per domain) + tagline
Step 3: "What should they look like?" (detailed description guidance)
Step 4: [Generate] -> 4 portrait candidates -> pick anchor
Step 5: Review & edit scene prompts (domain templates pre-filled, fully editable)
Step 6: [Generate scenes] -> review lifestyle images -> approve
Step 7: [Publish] -> avatar is live with profile page + social post

Every step has inline help tips explaining WHY and HOW.
Total: ~5 minutes, zero technical knowledge required.
```

Optional (later): upload knowledge base docs, add products, set custom instructions.

### 4. Session UI — Persistent Transcript
The transcript is a **scrollable chat view** below the carousel + waveform, not fading bubbles. Users need to:
- See what was said (especially corrections or advice)
- Scroll back during the session
- Reference specific moments

Layout priority:
1. **Avatar presence** (carousel) — emotional connection, ~40% of screen
2. **Audio waveform** — feedback that the conversation is alive, ~10%
3. **Transcript** — the actual value, scrollable, ~35%
4. **Controls** (burger menu + credits) — minimal, ~15% (top bar)

### 5. Pre-Seeded Demo Avatars for Judges
Judges will click the deployed URL. They need to immediately see and try avatars WITHOUT creating an account (for viewing) or with minimal signup (for talking).

**Pre-seed 3 avatars across domains:**
1. **Sakura Sensei** — Japanese language coach (demonstrates L1 adaptation)
2. **Coach Marcus** — fitness/wellness coach (demonstrates domain flexibility)
3. **Alex Rivera** — sales/product advisor (demonstrates sales conversation mode)

Each has: anchor image, 6 scene variants, published social post, product catalog, bio.

Landing page shows all 3 with "Try now" buttons.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 16 (App Router) + Tailwind CSS v4 | Fast, deployable on Vercel |
| Auth | Supabase Auth (Google OAuth + magic link) | Zero backend auth code, Google one-tap for mobile |
| Database | Supabase PostgreSQL + RLS | Instant API, row-level security |
| Storage | Supabase Storage | Avatar images |
| Voice AI | OpenAI Realtime API (gpt-4o-realtime-preview) | WebRTC, lowest latency voice AI |
| Image Gen | FLUX Kontext Pro (via n8n, swappable) | Character-consistent photorealistic images |
| Content AI | OpenAI GPT-4o (via n8n) | Social captions, domain-specific content |
| Orchestration | n8n (self-hosted at n8n.orbweva.cloud) | Swappable tool pipeline |
| Social Publishing | Blotato API (via n8n) | 9 platforms from one API call |
| Payments | Stripe | Credit purchases + creator subscriptions |
| Deployment | Vercel | Push-to-deploy |

---

## Avatar Image Generation Architecture (n8n)

### Why n8n (not in-app)
Image gen tools change monthly. By routing through n8n, we swap FLUX for Ideogram, DALL-E 4, or any new model by changing one node — no code changes, no redeployment. A/B testing generators is possible via Switch node.

### Pipeline: Avatar Creation

```
Creator clicks "Generate" in lola-platform
  -> POST n8n.orbweva.cloud/webhook/generate-avatar
  -> Payload: { appearance_description, domain, avatar_id }

n8n Pipeline:
  |
  +-- Step 1: GENERATE 4 ANCHOR CANDIDATES
  |   FLUX Kontext Pro (BFL API or SiliconFlow)
  |   Prompt: "Professional portrait photo of {appearance_description}.
  |            Natural lighting, shallow depth of field, warm expression.
  |            Photorealistic, Instagram-quality."
  |   Cost: ~$0.16 (4 x $0.04)
  |
  +-- Step 2: RETURN CANDIDATES -> frontend shows picker
  |
  +-- Step 3: GENERATE 6 SCENE VARIATIONS (after creator picks anchor)
  |   FLUX Kontext Pro with anchor as reference image
  |   "Keep the person identical. {scene_description}"
  |   Scenes come from domain-specific templates (creator can edit before generating):
  |     Universal: morning routine, working close-up, lifestyle outdoor
  |     + Domain-specific: e.g., gym selfie/meal prep/post-workout (fitness)
  |   Style: candid influencer-quality, not stock photos
  |   Cost: ~$0.24
  |
  +-- Step 4: QUALITY CHECK (GPT-4o Vision, optional)
  |   Compare each to anchor. Regenerate if similarity < 0.8.
  |
  +-- Step 5: UPLOAD TO SUPABASE STORAGE
  |
  +-- Step 6: NOTIFY creator via Telegram

Total: ~$0.40, ~15-20 seconds
```

### Pipeline: Social Content Publisher

```
Creator clicks "Publish" OR scheduled cron
  -> POST n8n.orbweva.cloud/webhook/publish-content

n8n Pipeline:
  |
  +-- Load avatar context from Supabase
  +-- Select unused scene image (rotate through 6)
  +-- GPT-4o: generate caption
  |   "Write as {avatar_name}, a {domain} expert. Sound like a real person
  |    posting, not a brand. Include natural CTA. Link: {profile_url}"
  +-- Switch: Blotato OR direct posting
  +-- Record in content_library table
  +-- Telegram notify creator
```

### Tool Swapping
```
FLUX Kontext Pro ($0.04) <-- current
      |
  Switch node
  |       |        |
Kontext  Ideogram  DALL-E 4
```
Swap = one node change. Zero code changes. Same pattern for LLM, video, voice.

---

## What to Build

### Phase 1: Scaffold + Auth (30 min)
- [ ] `npx create-next-app` with TypeScript + Tailwind + App Router
- [ ] Supabase project + env vars
- [ ] Supabase client/server/middleware helpers
- [ ] Auth: `/login`, `/signup` (Google OAuth primary + magic link fallback)
- [ ] `/callback` — profile creation (15 credits, default role: learner)
- [ ] Protected route middleware
- [ ] Root layout: dark theme, Geist fonts, glassmorphism CSS variables

### Phase 2: Database (20 min)
- [ ] Migration 001: `profiles` (id, display_name, role, credits, onboarding_complete, profile_data, stripe_customer_id)
- [ ] Migration 002: `sessions` + `transcript_entries`
- [ ] Migration 003: `avatars` (anchor_image_url, scene_images[], domain, personality_traits, tagline, appearance_description, conversation_mode, knowledge_base, system_instruction_override, social_links, session_count)
- [ ] Migration 004: `creator_products`
- [ ] Migration 005: `credit_purchases` + `creator_subscriptions`
- [ ] Migration 006: `content_library` (tracks social posts per avatar)
- [ ] Auto-trigger: create profile on auth signup
- [ ] Storage bucket for avatar images
- [ ] Apply all migrations

### Phase 3: Conversation Engine (45 min)
- [ ] `lib/coaching/principles.ts` — 12 domain-agnostic adaptation principles with weighted scoring
- [ ] `lib/coaching/profiles.ts` — personality quiz (optional, 5 questions) + default profiles per domain
- [ ] `lib/coaching/instructions.ts` — domain-adaptive system instruction generator:
  - Base layer: 12 principles weighted by user personality (or domain defaults)
  - Domain layer: avatar's name, domain, personality, tagline, knowledge base
  - Language layer: L1 patterns (only when domain = language coaching + user L1 known)
  - Custom layer: creator's custom instructions
- [ ] `lib/coaching/l1-patterns/` — Japanese, Korean, English (opt-in module)
- [ ] `lib/coaching/domains.ts` — domain presets (language, fitness, sales, mentoring, support) with default personality profiles and conversation openers

### Phase 4: Creator Dashboard + Avatar Wizard (60 min)
- [ ] `/creator` layout with nav
- [ ] `/creator` page — overview: avatar count, total sessions, revenue preview
- [ ] `/creator/avatars` — avatar list with thumbnails, publish toggle
- [ ] `/creator/avatars/new` — creation wizard:
  - Step 1: Name + domain picker (Language Coach, Fitness Trainer, Sales Expert, Business Mentor, Custom)
  - Step 2: Personality + tagline (with smart suggestions per domain)
  - Step 3: Appearance description (text input or reference photo upload)
  - Step 4: Generate -> 4 candidates -> pick anchor
  - Step 5: Auto-generate 6 lifestyle scenes -> review + approve
  - Step 6: Publish -> live profile page + social post triggered
- [ ] `/creator/products` — product CRUD with avatar assignment
- [ ] Publish action fires n8n social webhook

### Phase 5: Avatar Profile Page (45 min) — PUBLIC, THE LINK-IN-BIO
- [ ] `/avatar/[slug]` — public route, no auth required
- [ ] Full-bleed hero: anchor image with gradient overlay, name + tagline overlaid
- [ ] Social proof bar: session count, rating
- [ ] Primary CTA: "Talk to Me" — large gradient button
  - Logged in -> `/session/[slug]`
  - Not logged in -> signup modal (Google one-tap) with return to session
- [ ] Scene gallery: horizontal scroll of lifestyle images
- [ ] Products section: cards with name, price, "View" link
- [ ] Social links
- [ ] "Powered by LoLA - Create your own" footer
- [ ] Mobile-first (this IS the link-in-bio destination)
- [ ] SEO: JSON-LD, og:image (anchor), meta description

### Phase 6: Full-Screen Voice Session (90 min) — CORE
- [ ] `/session/[slug]` — full-screen page
- [ ] Auth gate with return URL (signup if needed, then straight to session)
- [ ] `POST /api/realtime` — domain-adaptive system instruction + OpenAI ephemeral session
- [ ] `PATCH /api/sessions` — save duration + transcript

**UI Layout (mobile-first, full-viewport):**
```
TOP BAR (fixed, glass): [burger menu]  [avatar name]  [credits pill]

CAROUSEL (40% height): auto-crossfade of scene_images[], 8-10s per image,
                        subtle ken burns zoom, creates ambient presence

WAVEFORM (10% height): real-time AnalyserNode bars
                        indigo gradient = avatar speaking
                        emerald gradient = user speaking

TRANSCRIPT (35% height): scrollable chat view, persistent
                          user messages right-aligned (indigo)
                          avatar messages left-aligned (glass)
                          auto-scrolls to latest, user can scroll up

BOTTOM SAFE AREA (5%): env(safe-area-inset-bottom) for mobile
```

**Components:**
- [ ] `ImageCarousel.tsx` — crossfade, no manual swipe, 8-10s transitions
- [ ] `WaveformVisualizer.tsx` — AnalyserNode bars, color-coded by speaker
- [ ] `SessionTranscript.tsx` — scrollable chat view, auto-scroll with manual override
- [ ] `CreditPill.tsx` — live counter, per-minute tick, amber at 20%, red at 0
- [ ] `BurgerMenu.tsx` — slide-out: End Session, Mute, About Avatar, Report
- [ ] `SessionSummary.tsx` — shown on end: duration, credits used, key stats, links

**Behavior:**
- [ ] Connect in <3 seconds
- [ ] Avatar speaks first (domain-appropriate greeting)
- [ ] Per-minute credit deduction via interval
- [ ] At 0 credits: avatar gracefully wraps up, not hard cutoff
- [ ] End session: summary overlay, then choice: back to profile or dashboard

### Phase 7: Learner Dashboard (30 min)
- [ ] `/dashboard` layout with nav
- [ ] `/dashboard` page:
  - Credit balance (prominent) + "Buy Credits" CTA
  - Stats: total sessions, total minutes
  - Recent sessions with avatar thumbnail, date, duration
  - "Personalize your coaching" quiz prompt (if not completed)
- [ ] `/dashboard/transcripts/[id]` — full transcript viewer
- [ ] Session summary page (post-session)

### Phase 8: n8n Workflows (60 min)
- [ ] **Workflow 1: Image Generator** — webhook -> FLUX Kontext Pro -> 4 candidates -> (second call) -> 6 scenes -> Supabase upload -> notify
- [ ] **Workflow 2: Social Publisher** — webhook -> load context -> GPT-4o caption -> Blotato/direct -> content_library -> notify
- [ ] Test both workflows end-to-end
- [ ] Wire frontend buttons to webhook triggers

### Phase 9: Stripe Integration (30 min)
- [ ] Stripe singleton + config (3 credit packs)
- [ ] `/api/checkout/route.ts` — create Stripe Checkout
- [ ] `/api/webhooks/stripe` — handle payments + subscriptions
- [ ] "Buy Credits" button on dashboard
- [ ] Purchase confirmation + credit update

### Phase 10: Landing Page (60 min)
- [ ] Hero: "AI avatars that coach, sell, and grow — autonomously" with gradient
- [ ] 3-step how it works: Create Avatar -> Auto-Post to Social -> Users Engage
- [ ] **3 demo avatars** displayed as cards (different domains):
  1. Sakura Sensei (Japanese Language Coach)
  2. Coach Marcus (Fitness & Wellness)
  3. Alex Rivera (Sales & Product Advisory)
  Each with: avatar image, name, domain, "Try Now" button -> profile page
- [ ] Feature grid: adaptive coaching, social pipeline, credit system, creator tools
- [ ] Pricing section: Free / Creator ($29) / Pro ($99)
- [ ] "Built for educators, coaches, and creators" — audience validation
- [ ] CTA: "Create Your First Avatar — Free"
- [ ] Mobile responsive, fast

### Phase 11: Deploy + Polish (90 min)
- [ ] Vercel deployment
- [ ] Environment variables
- [ ] Supabase production
- [ ] Pre-seed 3 demo avatars (Sakura, Marcus, Alex) with full image sets
- [ ] Pre-seed demo products for each avatar
- [ ] Test full flow on deployed URL
- [ ] Test on real iPhone + Android
- [ ] Fix responsive / mobile Safari issues
- [ ] Voice session works on mobile Chrome + Safari
- [ ] Loading states for all async ops (image gen, session connect, etc.)
- [ ] Error states (mic permission denied, WebRTC failure, no credits)
- [ ] Smooth page transitions
- [ ] og:image for avatar profile pages
- [ ] Performance check (LCP < 2.5s on profile page)

### Phase 12: Demo Video + Submission (60 min)
- [ ] Record 1-2 min screen walkthrough (6-scene flow)
- [ ] Show main feature FIRST (voice session, 30 seconds in)
- [ ] Show multiple domains (language + fitness or sales)
- [ ] Big text / zoom on key moments
- [ ] Real voice conversation (not scripted)
- [ ] Show character consistency: social post -> profile -> session
- [ ] Write submission (one sentence per field)
- [ ] Verify judges can try it themselves at the URL
- [ ] Submit

---

## File Structure

```
lola-platform/
  app/
    layout.tsx                          # Root layout, dark theme, fonts
    page.tsx                            # Landing page with 3 demo avatars
    globals.css                         # Tailwind + glassmorphism + LoLA tokens
    (auth)/
      login/page.tsx
      signup/page.tsx
      callback/page.tsx
    avatar/
      [slug]/page.tsx                   # PUBLIC profile page (link-in-bio)
    session/
      [slug]/page.tsx                   # Full-screen voice session
    dashboard/
      layout.tsx
      page.tsx
      transcripts/[id]/page.tsx
    creator/
      layout.tsx
      page.tsx
      avatars/page.tsx
      avatars/new/page.tsx              # Creation wizard
      products/page.tsx
    api/
      realtime/route.ts                 # OpenAI ephemeral session
      sessions/route.ts                 # Save session data
      checkout/route.ts                 # Stripe checkout
      avatars/
        generate/route.ts               # Trigger n8n image gen
        publish/route.ts                # Trigger n8n social post
      webhooks/
        stripe/route.ts
  components/
    session/
      VoiceSession.tsx
      ImageCarousel.tsx
      WaveformVisualizer.tsx
      SessionTranscript.tsx
      CreditPill.tsx
      BurgerMenu.tsx
      SessionSummary.tsx
    onboarding/
      ProfileQuiz.tsx
    avatar/
      AvatarHero.tsx
      SceneGallery.tsx
      ProductGrid.tsx
    creator/
      AvatarWizard.tsx
      ImagePicker.tsx
      SceneReview.tsx
    landing/
      DemoAvatarCard.tsx
      HowItWorks.tsx
      PricingTable.tsx
  lib/
    coaching/
      principles.ts                     # 12 domain-agnostic principles
      profiles.ts                       # Quiz + domain default profiles
      instructions.ts                   # Domain-adaptive instruction builder
      domains.ts                        # Domain presets + defaults
      l1-patterns/                      # Opt-in language module
        index.ts
        types.ts
        japanese.ts
        korean.ts
        english.ts
    openai/
      realtime.ts
    stripe/
      client.ts
      config.ts
    supabase/
      client.ts
      server.ts
      middleware.ts
  supabase/
    migrations/
      001_profiles.sql
      002_sessions.sql
      003_avatars.sql
      004_products.sql
      005_stripe.sql
      006_content_library.sql
  middleware.ts
  CLAUDE.md
  HACKATHON_BUILD_SPEC.md
```

---

## Database Schema

### profiles
```sql
id UUID PK (refs auth.users)
display_name TEXT
role TEXT ('learner' | 'creator' | 'admin') DEFAULT 'learner'
credits INT DEFAULT 15
onboarding_complete BOOLEAN DEFAULT false
profile_data JSONB  -- personality quiz results (optional)
stripe_customer_id TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

### sessions
```sql
id UUID PK
user_id UUID -> profiles
avatar_id UUID -> avatars
profile_label TEXT
profile_data JSONB  -- coaching profile used for this session
duration_seconds INT
credits_used INT DEFAULT 0
started_at TIMESTAMPTZ DEFAULT now()
ended_at TIMESTAMPTZ
```

### transcript_entries
```sql
id BIGINT GENERATED
session_id UUID -> sessions
role TEXT ('user' | 'model')
content TEXT
seq INT
created_at TIMESTAMPTZ DEFAULT now()
```

### avatars
```sql
id UUID PK
creator_id UUID -> profiles
name TEXT NOT NULL
slug TEXT UNIQUE
tagline TEXT
domain TEXT NOT NULL  -- 'language_coaching' | 'fitness' | 'sales' | 'mentoring' | 'support' | 'custom'
personality_traits TEXT
appearance_description TEXT
anchor_image_url TEXT
scene_images TEXT[]  -- array of 6+ lifestyle scene URLs
voice_id TEXT DEFAULT 'shimmer'  -- OpenAI voice
conversation_mode TEXT DEFAULT 'coaching'  -- 'coaching' | 'sales' | 'support' | 'freeform'
knowledge_base JSONB
system_instruction_override TEXT
social_links JSONB  -- { instagram, x, youtube, tiktok, linkedin }
is_published BOOLEAN DEFAULT false
session_count INT DEFAULT 0
rating DECIMAL(2,1) DEFAULT 5.0
created_at TIMESTAMPTZ DEFAULT now()
```

### creator_products
```sql
id UUID PK
creator_id UUID -> profiles
avatar_id UUID -> avatars (nullable)
name TEXT NOT NULL
description TEXT
price DECIMAL(10,2)
currency TEXT DEFAULT 'USD'
checkout_url TEXT NOT NULL
platform TEXT
image_url TEXT
is_active BOOLEAN DEFAULT true
sort_order INT DEFAULT 0
created_at TIMESTAMPTZ DEFAULT now()
```

### credit_purchases
```sql
id UUID PK
user_id UUID -> profiles
stripe_payment_intent TEXT
credits_added INT NOT NULL
amount_cents INT NOT NULL
currency TEXT DEFAULT 'usd'
created_at TIMESTAMPTZ DEFAULT now()
```

### creator_subscriptions
```sql
id UUID PK
creator_id UUID -> profiles
tier TEXT ('free' | 'creator' | 'pro' | 'enterprise')
stripe_subscription_id TEXT
status TEXT DEFAULT 'active'
current_period_end TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT now()
```

### content_library
```sql
id UUID PK
avatar_id UUID -> avatars
platform TEXT
post_url TEXT
caption TEXT
scene_image_url TEXT
published_at TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT now()
```

---

## Design System

### Theme
- **Background**: #0a0a0f
- **Cards**: #13131a, border: rgba(255,255,255,0.08)
- **Glass**: rgba(255,255,255,0.05), backdrop-filter: blur(20px)
- **Primary gradient**: indigo-400 -> emerald-400
- **Text**: #f0f0f5 (primary), #9ca3af (muted)
- **Accent**: indigo-600, emerald-600
- **Font**: Geist Sans + Geist Mono
- **Radius**: 16px cards, 12px buttons, 9999px pills

### Voice Session Layout
```
+--------------------------------------+
|  [=]   Sakura Sensei    [12 credits] |  <- glass top bar, fixed
+--------------------------------------+
|                                      |
|                                      |
|      CROSSFADING IMAGE CAROUSEL      |  <- ~40% viewport
|      (8-10s per transition)          |     subtle ken burns
|      (avatar lifestyle scenes)       |
|                                      |
|                                      |
+--------------------------------------+
|  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~    |  <- ~10% viewport
|  ~~~~~~  ~~~~~~~~~~  ~~~~~~~~        |     waveform visualizer
+--------------------------------------+
|                                      |
|  Sakura: Hey! I'm Sakura. What      |  <- ~35% viewport
|  would you like to work on today?   |     scrollable transcript
|                                      |     auto-scrolls, can scroll up
|              You: I want to practice |
|              ordering at restaurants |
|                                      |
|  Sakura: Great choice! Let's start  |
|  with a simple scenario...          |
|                                      |
+--------------------------------------+
|  (safe area)                         |  <- env(safe-area-inset-bottom)
+--------------------------------------+
```

### Avatar Profile Page
```
+--------------------------------------+
|                                      |
|  +----------------------------------+|
|  |                                  ||
|  |     HERO IMAGE (anchor)          ||  <- full-bleed, gradient overlay
|  |                                  ||
|  |  Sakura Sensei                   ||  <- overlaid on image
|  |  Japanese Language Coach         ||
|  +----------------------------------+|
|                                      |
|  247 sessions  |  4.9 rating        |
|                                      |
|  +----------------------------------+|
|  |  Talk to Me                      ||  <- primary CTA, gradient
|  |  Free — no credit card needed    ||
|  +----------------------------------+|
|                                      |
|  [cafe] [class] [park] [studio]     |  <- scene gallery, scroll
|                                      |
|  --- Products ---                    |
|  +------------+  +------------+     |
|  | Course $47 |  | Pack $197  |     |
|  +------------+  +------------+     |
|                                      |
|  [IG] [X] [YT]                      |
|                                      |
|  Powered by LoLA — Create yours ->  |
+--------------------------------------+
```

---

## Conversation Engine: Domain Presets

### Language Coaching
- **Default personality**: warm, patient, encouraging
- **Conversation mode**: coaching
- **Default opener**: "Hey! I'm {name}. What would you like to practice today?"
- **L1 patterns**: activated (if user's native language is known)
- **Principles emphasis**: Growth Mindset, Emotional State Management, Cognitive Load, Spacing

### Fitness & Wellness
- **Default personality**: energetic, motivating, knowledgeable
- **Conversation mode**: coaching
- **Default opener**: "Hey! I'm {name}. Ready to work on your goals today?"
- **L1 patterns**: inactive
- **Principles emphasis**: Progressive Challenge, Autonomy & Choice, Positive Framing, Sensory Engagement

### Sales & Advisory
- **Default personality**: consultative, curious, helpful
- **Conversation mode**: sales
- **Default opener**: "Hi! I'm {name}. I'd love to help you find exactly what you need. What are you working on?"
- **L1 patterns**: inactive
- **Principles emphasis**: Rapport & Anchoring, Meta-Model Questioning, Autonomy & Choice, Retrieval Practice
- **Special behavior**: naturally introduces products from catalog when relevant

### Business Mentoring
- **Default personality**: experienced, direct, strategic
- **Conversation mode**: coaching
- **Default opener**: "Hey, I'm {name}. What's the biggest challenge you're facing right now?"
- **L1 patterns**: inactive
- **Principles emphasis**: Meta-Model Questioning, Progressive Challenge, Retrieval Practice, Cognitive Load

### Custom
- **Default personality**: creator-defined
- **Conversation mode**: creator-defined
- **Default opener**: creator-defined or auto-generated from personality
- **L1 patterns**: creator chooses
- **Principles emphasis**: balanced defaults

---

## Build Order

```
DAY 1 (~12 hours):
  1. Scaffold + Auth + DB                    ~50 min
  2. Conversation Engine (domain-adaptive)   ~45 min
  3. Voice Session UI (full-screen)          ~90 min  <- THE priority
  4. Avatar Profile Page                     ~45 min
  5. Deploy to Vercel (early!)               ~15 min
  -- Milestone: can visit profile -> start session -> talk to avatar --

DAY 2 (~16 hours):
  6. Creator Dashboard + Avatar Wizard       ~60 min
  7. n8n: Image Generator workflow           ~30 min
  8. n8n: Social Publisher workflow           ~30 min
  9. Learner Dashboard                       ~30 min
  10. Stripe Credit Purchases                ~30 min
  11. Landing Page (3 demo avatars)          ~60 min
  12. Pre-seed 3 demo avatars               ~30 min
  13. Polish + Mobile Testing               ~90 min
  14. Record Demo Video                     ~60 min
  15. Write Submission                      ~15 min
  -- Milestone: full pipeline, deployed, submitted --

Buffer: ~4 hours for issues, iteration, rest
```

---

## Pre-Seeded Demo Avatars

### 1. Sakura Sensei
- **Domain**: Language Coaching (Japanese)
- **Personality**: warm, patient, encouraging, uses gentle humor
- **Tagline**: "Let's make Japanese feel natural"
- **Products**: "Japanese Basics Course" ($47), "JLPT N3 Prep Pack" ($197)
- **Voice**: shimmer
- **Scenes**: cafe in Tokyo, classroom, cherry blossom park, recording studio, restaurant, close-up smile

### 2. Coach Marcus
- **Domain**: Fitness & Wellness
- **Personality**: energetic, motivating, no-nonsense but warm
- **Tagline**: "Your goals, your pace, real results"
- **Products**: "12-Week Strength Program" ($79), "Nutrition Blueprint" ($29)
- **Voice**: echo
- **Scenes**: gym, outdoor workout, kitchen with healthy food, park run, stretching, confident close-up

### 3. Alex Rivera
- **Domain**: Sales & Product Advisory
- **Personality**: consultative, curious, knowledgeable, trustworthy
- **Tagline**: "I help you find exactly what you need"
- **Products**: "SaaS Starter Kit" ($297), "Sales Playbook" ($49)
- **Voice**: alloy
- **Scenes**: modern office, coffee meeting, conference, desk with laptop, whiteboard, friendly close-up

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| FLUX API unavailable | No avatar images | n8n switch to alternate provider. Fallback: URL upload. |
| OpenAI Realtime API issues | Core broken | Test early. Fallback: text chat mode. |
| Blotato credits unavailable | No social posting | Direct posting via n8n (X/LinkedIn). Still real. |
| Character inconsistency | Illusion breaks | Tight prompting + anchor reference. Quality check via GPT-4o Vision. |
| Mobile WebRTC issues | Session broken on phone | Test early on real devices. Desktop OK for demo video. |
| Creator onboarding too complex | Teachers bounce | Keep wizard to 5 steps. Smart defaults. Domain-specific suggestions. |
| Session feels generic | Not impressive | Domain presets + personality quiz make real difference. Show contrast in demo. |
| Judges don't try it | Score low on "does it work" | Pre-seed avatars. Landing page "Try Now" buttons. Zero-friction entry. |

---

## Submission Checklist

- [ ] Demo video (1-2 min, show > tell, multiple domains)
- [ ] Deployed URL on Vercel (judges will click and try)
- [ ] GitHub repo (public, clean history from March 7+)
- [ ] Writeup (one sentence per field)
- [ ] 3 pre-seeded avatars judges can talk to immediately
- [ ] Character consistency verified: social -> profile -> session
- [ ] Voice session works on mobile + desktop
- [ ] Full pipeline demonstrated: create -> post -> discover -> talk -> dashboard

---

## What We Cut (Post-Hackathon)

- Live animated avatars / TalkingHead — future: iOS/Android apps
- Clone yourself (real face + voice cloning)
- Email nurture sequences
- Content-only mode (no-conversation avatars)
- Loka classroom bridge
- Custom domains
- BYOK (bring your own API key)
- Marketplace / avatar discovery
- Video content generation (Hedra/VEO)
- Per-session AI coaching reports
- Advanced analytics dashboard
- A/B testing conversation approaches
