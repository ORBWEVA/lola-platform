# LoLA Platform Master Document v1.6 — 2026-03-09

> CLICKUP: skip — documentation task, no plan mirroring required.

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.6 | 2026-03-09 | Claude Code | DT Full exercise — visible session value: enhanced transcript page with stats/report card/system messages/event logging, structured JSON session reports (topics, key moment, next focus) via upgraded GPT-4o-mini prompt with response_format json_object, voice sample generation on avatar profiles (OpenAI TTS → Supabase Storage, play button on profile page), "View Transcript" links from SessionSummary and session history, JSON-aware summary display across analytics and history pages. Migration 011 adds voice_sample_url column. |
| v1.5 | 2026-03-09 | Claude Code | Platform-wide DT audit gap closers: creator analytics page (per-avatar session count, avg rating, rating distribution, recent feedback + session summaries), fix callback credit bug (INSERT on first signup only, not upsert that overwrites credits on re-auth), compute avatar rating from real feedback_rating data instead of static DB value, session count from completed sessions. |
| v1.4 | 2026-03-09 | Claude Code | Voice session architecture overhaul: server-side credit enforcement (duration computed from started_at, not client), session lifecycle states (pending/active/completed/failed/expired), stale session cleanup (pending >5min, active >2hr auto-expired), reconnection reuse of session IDs, transcript save on tab close via sendBeacon, Whisper transcription error feedback in transcript, session_events observability table with event logging across all routes, first-time vs returning user context in system prompt, cross-session continuity via GPT-4o-mini session summarization into session_notes, post-session feedback UI (1/3/5 rating + text). DT audit gap closure targeting 20+/25. |
| v1.3 | 2026-03-09 | Claude Code | Landing hero video: single combined MP4 with 5 avatars (Emma, Sakura, Marcus, Alex, Sara), 1.5s freeze-frame crossfade pre-pads on all non-first clips, word-level subtitle sync with cumulative acrossfade drift corrections (+0.12s Marcus, +0.22s Alex, +0.30s Sara), BGM reduced to 20%, segment boundaries decoupled from xfade offsets for smooth subtitle transitions. |
| v1.2 | 2026-03-09 | Claude Code | Image persistence pipeline: generated images now auto-upload to Supabase Storage (permanent URLs instead of expiring Together.ai URLs). Social links editor on creator dashboard (Instagram handle editable from avatar edit page). Session fallback to anchor image when scene images are broken. CORS proxy for image downloads. Dual-layer crossfade video transitions on landing carousel. Hackathon demo video assembled + submitted. Vercel deployment live with full env vars + Google OAuth. |
| v1.1 | 2026-03-08 | Claude Code | Immersive landing page redesign: full-screen Sara hero video, localized subtitles with alternating loops, animated waveform, monochrome greyscale for all non-landing pages, animated conic-gradient border traces on cards, dark/light mode system (dark default), always-dark slide menu with minimal toggle, text-only marketing pages, avatar video prompt doc |
| v1.0 | 2026-03-07 | Claude Code | Initial master document creation from HACKATHON_BUILD_SPEC.md |

---

## Table of Contents

- [S0 - Mission & Brand](#s0---mission--brand)
- [S1 - Product Architecture](#s1---product-architecture)
- [S2 - Pricing & Revenue](#s2---pricing--revenue)
- [S3 - API Architecture](#s3---api-architecture)
- [S4 - AI & Automation](#s4---ai--automation)
- [S5 - Technical Infrastructure](#s5---technical-infrastructure)
- [S6 - Data & Schema](#s6---data--schema)
- [S7 - Roadmap & Milestones](#s7---roadmap--milestones)
- [S8 - Development & Deployment](#s8---development--deployment)
- [S9 - Integration Boundaries](#s9---integration-boundaries)
- [S10 - Market Context](#s10---market-context)

---

## S0 — Mission & Brand

**Name**: LoLA (Loka Learning Avatar)

**Mission**: Let anyone build a photorealistic AI avatar that posts to social media and has real-time voice conversations with anyone who clicks — coaching, selling, training, or just engaging.

**Who it's for**: Creators, educators, coaches, trainers, and influencers who want to scale personalized 1-on-1 conversations with AI.

**Problem**: Creators can't scale personal conversations — every prospect who doesn't get a reply is lost revenue.

**Solution**: An AI avatar that looks like a real person, markets itself on social media, then has adaptive voice conversations with anyone who clicks through.

**Origin**: Built for the Sabrina/Marcin AI Hackathon (March 6-8, 2026). Builder: Ryno + Claude Code.

**Core philosophy**: Domain-agnostic coaching engine. Language coaching is one opt-in module, not the default. The 12 coaching principles are about how to adapt to a *person*, not what you're teaching.

**Brand identity**:
- Background: `#0a0a0f` (dark), `#fafafa` (light)
- Cards: `#13131a` / `#ffffff`, border `rgba(255,255,255,0.08)` / `rgba(0,0,0,0.08)`
- Glass: `rgba(255,255,255,0.05)`, `backdrop-filter: blur(20px)`
- Primary gradient: `indigo-400 -> emerald-400` (landing page only)
- Monochrome greyscale: all non-landing pages (`.monochrome` CSS class)
- Animated border traces: conic-gradient `@property --border-angle` on all cards
- Text: `#f0f0f5` / `#1a1a2e` (primary), `#9ca3af` / `#6b7280` (muted)
- Accent: `indigo-600`, `emerald-600`
- Font: Exo 2 (headings), Space Mono (code), Noto Sans JP (Japanese)
- Radius: 16px cards, 12px buttons, 9999px pills
- Theme: dark default (no OS preference fallback), toggle in slide menu

---

## S1 — Product Architecture

### Core Engine

12 evidence-based coaching principles analyze the user's personality (how they handle mistakes, how they prefer to learn, what motivates them, their pace, their depth preference) and generate a unique conversation approach. The engine is domain-agnostic — a fitness avatar uses the same adaptation framework differently than a language avatar.

### System Instruction Layers

1. **Base layer (always active)**: 12 principles weighted by user personality profile (or domain defaults)
2. **Domain layer (per avatar)**: Creator's domain, personality traits, tagline, knowledge base
3. **Language layer (opt-in)**: L1 interference patterns — only when domain = language coaching AND user L1 known
4. **Custom layer (optional)**: Creator-defined instructions

### Demo Avatars (Pre-Seeded)

| Avatar | Domain | Personality | Voice | Tagline |
|--------|--------|-------------|-------|---------|
| Sakura Sensei | Japanese Language Coach | warm, patient, encouraging | shimmer | "Let's make Japanese feel natural" |
| Coach Marcus | Fitness & Wellness | energetic, motivating, no-nonsense | echo | "Your goals, your pace, real results" |
| Alex Rivera | Sales & Product Advisory | consultative, curious, knowledgeable | alloy | "I help you find exactly what you need" |
| Emma Lindgren | Business Mentoring | experienced, direct, strategic | — | — |

### User Flows

**Social media click-through (zero friction)**:
```
Social post -> Bio link -> Avatar profile page (public, no auth)
  -> "Talk to Me" button
  -> IF logged in: start session immediately
  -> IF not logged in: quick signup modal (Google one-tap or email)
     -> Session starts immediately after auth (no quiz, no onboarding)
     -> 5 free minutes, no credit card
```

**Creator onboarding (~5 minutes to published avatar)**:
```
Step 1: Name + domain picker
Step 2: Personality + tagline (with smart suggestions per domain)
Step 3: Appearance description
Step 4: Generate -> 4 portrait candidates -> pick anchor
Step 5: Review & edit scene prompts -> generate 6 lifestyle scenes -> approve
Step 6: Publish -> live profile page + social post triggered
```

### Key UX Decisions

- Avatar profile pages are PUBLIC (no auth required to view)
- Auth required only to START a voice session (Google OAuth + magic link)
- Personality quiz is OPTIONAL — appears on dashboard later, NOT a gate to first session
- Transcript is a persistent scrollable chat view, NOT fading bubbles
- Every avatar is multilingual by default (starts English, follows user's language switch)
- Character consistency is non-negotiable (same person across social, profile, session)

### Session UI Layout

```
TOP BAR (fixed, glass): [burger menu]  [avatar name]  [credits pill]
CAROUSEL (~40% height): auto-crossfade of scene_images[], 8-10s per image
WAVEFORM (~10% height): AnalyserNode bars, color-coded by speaker
TRANSCRIPT (~35% height): scrollable chat view, persistent, auto-scroll
BOTTOM SAFE AREA (~5%): env(safe-area-inset-bottom)
```

### Domain Presets

| Domain | Conversation Mode | Default Opener | Principles Emphasis |
|--------|------------------|----------------|---------------------|
| Language Coaching | coaching | "Hey! I'm {name}. What would you like to practice today?" | Growth Mindset, Emotional State, Cognitive Load, Spacing |
| Fitness & Wellness | coaching | "Hey! I'm {name}. Ready to work on your goals today?" | Progressive Challenge, Autonomy, Positive Framing, Sensory |
| Sales & Advisory | sales | "Hi! I'm {name}. I'd love to help you find exactly what you need." | Rapport, Meta-Model Questioning, Autonomy, Retrieval |
| Business Mentoring | coaching | "Hey, I'm {name}. What's the biggest challenge you're facing right now?" | Meta-Model Questioning, Progressive Challenge, Retrieval, Cognitive Load |
| Custom | creator-defined | creator-defined or auto-generated | balanced defaults |

---

## S2 — Pricing & Revenue

### Tiers

| Tier | Price | Avatars | Sessions | Features |
|------|-------|---------|----------|----------|
| Free | $0/mo | 1 | 50/mo | Basic avatar, profile page |
| Creator | $29/mo | 5 | Unlimited | Social publishing, analytics |
| Pro | $99/mo | Unlimited | Unlimited | API access, white-label |

### Credit System

- New users get 15 free credits on signup
- Per-minute credit deduction during voice sessions
- At 0 credits: avatar gracefully wraps up (not hard cutoff)
- Credit packs available via Stripe Checkout (3 tiers)

### Revenue Model

- Creator subscriptions (monthly recurring)
- Credit pack purchases (one-time)
- Future: marketplace commission on creator product sales

---

## S3 — API Architecture

All API routes live under `/app/api/`.

### Endpoints

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/realtime` | POST | Required | Generate OpenAI Realtime API ephemeral token with domain-adaptive system instruction |
| `/api/avatars/generate` | POST | Required (creator) | Generate avatar images via FLUX Kontext Pro (Together AI), auto-persist to Supabase Storage |
| `/api/avatars/generate/poll` | POST | Required (creator) | Poll KIE.ai async image generation jobs |
| `/api/avatars/upload` | POST | Required (creator) | Upload anchor image to Supabase Storage |
| `/api/avatars/enhance` | POST | Required (creator) | Enhance uploaded anchor image |
| `/api/avatars/caption` | POST | Required (creator) | Generate social captions for avatar |
| `/api/avatars/publish` | POST | Required (creator) | Trigger social media publish via n8n + Blotato |
| `/api/avatars/download` | GET | None | CORS proxy for downloading cross-origin images |
| `/api/avatars/voice-sample` | POST | Required (creator) | Generate TTS voice greeting sample via OpenAI, store in Supabase Storage |
| `/api/checkout` | POST | Required | Create Stripe Checkout session for credit purchase |
| `/api/sessions` | PATCH | Required | End session: server-side duration/credit computation, transcript save, GPT-4o-mini session summary |
| `/api/sessions/activate` | POST | Required | Mark session as active (called on WebRTC dc.onopen) |
| `/api/sessions/fail` | POST | Required | Mark session as failed with reason |
| `/api/sessions/end` | POST | Required | sendBeacon target for tab-close transcript save |
| `/api/sessions/feedback` | POST | Required | Save post-session feedback (rating 1/3/5 + text) |
| `/api/profile` | PATCH | Required | Update user profile data |
| `/api/webhooks/stripe` | POST | Stripe signature | Handle Stripe payment + subscription webhooks |

### Auth Flow

- Supabase Auth with Google OAuth (primary) + magic link (fallback)
- `/callback` route handles profile creation (15 credits, role: learner)
- Protected routes via middleware (`/dashboard/*`, `/creator/*`, `/session/*`)
- Public routes: `/`, `/avatar/[slug]`, `/login`, `/signup`

---

## S4 — AI & Automation

### AI Tools Used

| Tool | Purpose | Access |
|------|---------|--------|
| OpenAI Realtime API (gpt-4o-realtime-preview) | Real-time voice conversations via WebRTC | Direct (ephemeral token from `/api/realtime`) |
| OpenAI GPT-4o | Social captions, domain-specific content generation | Via n8n |
| FLUX Kontext Pro (black-forest-labs/FLUX.1-Kontext-pro) | Avatar portrait + lifestyle scene generation | Direct via Together AI (`/api/avatars/generate`), auto-persisted to Supabase Storage |
| Claude Code | Development agent | Direct |

### n8n Workflows

| Workflow ID | Name | Trigger | Pipeline |
|-------------|------|---------|----------|
| `np7v88fMbocgXKQa` | Image Generator | Webhook: `POST /webhook/generate-avatar` | FLUX portrait gen (4 candidates) -> anchor selection -> 6 scene variations -> Supabase upload -> notify |
| `mmtJ5YpwbnvPCYdW` | Social Publisher | Webhook: `POST /webhook/publish-content` | Load avatar context -> select scene image -> GPT-4o caption -> Blotato publish -> content_library record -> notify |

### Image Generation Pipeline

```
Creator clicks "Generate"
  -> POST /api/avatars/generate (server-side, Together AI direct)
  -> Step 1: Generate 4 anchor candidates via FLUX Kontext Pro
  -> Step 2: Each image auto-persisted to Supabase Storage (permanent URLs)
  -> Step 3: Return permanent URLs, creator picks anchor
  -> Step 4: Generate 6 scene variations with anchor reference
  -> Step 5: Each scene auto-persisted to Supabase Storage
  -> Step 6: Return permanent scene URLs
  Total: ~$0.40, ~30-60 seconds (includes storage upload)
```

**Key**: Images are persisted to Supabase Storage immediately after generation. Together.ai URLs are temporary (~hours), so the `persistToStorage()` function in the generate route fetches each image and uploads to the `avatars` bucket before returning URLs to the client. Falls back to temp URL if upload fails.

### Social Publishing Pipeline

```
Creator clicks "Publish" OR scheduled cron
  -> POST n8n.orbweva.cloud/webhook/publish-content
  -> Load avatar context from Supabase
  -> Select unused scene image (rotate through 6)
  -> GPT-4o: generate caption
  -> Switch: Blotato OR direct posting
  -> Record in content_library table
  -> Notify creator
```

### Coaching Engine

Location: `lib/coaching/`

| File | Purpose |
|------|---------|
| `principles.ts` | 12 domain-agnostic adaptation principles with weighted scoring |
| `profiles.ts` | Personality quiz (optional, 5 questions) + default profiles per domain |
| `instructions.ts` | Domain-adaptive system instruction generator (4 layers) |
| `domains.ts` | Domain presets with default personality profiles and conversation openers |
| `l1-patterns/` | L1 interference patterns (Japanese, Korean, English) — opt-in module |

---

## S5 — Technical Infrastructure

### Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 | Turbopack dev server |
| Auth | Supabase Auth | Google OAuth + magic link |
| Database | Supabase PostgreSQL + RLS | Project: `udftjfjfxyvghngqywth` (LoLA2) |
| Storage | Supabase Storage | Avatar images bucket |
| Voice AI | OpenAI Realtime API | `gpt-4o-realtime-preview` via WebRTC |
| Image Gen | FLUX Kontext Pro | Via Together AI (black-forest-labs/FLUX.1-Kontext-pro), auto-persisted to Supabase Storage |
| Content AI | OpenAI GPT-4o | Via n8n |
| Orchestration | n8n | Self-hosted at `n8n.orbweva.cloud` |
| Social Publishing | Blotato API | Via n8n, 9 platforms from one API call |
| Payments | Stripe | Credit purchases + creator subscriptions |
| Deployment | Vercel | `lola-platform.vercel.app`, auto-deploy from main |

### Cost Estimates (Per Avatar Creation)

- 4 portrait candidates: ~$0.16
- 6 scene variations: ~$0.24
- Total image gen: ~$0.40
- Voice session: OpenAI Realtime API usage-based pricing

---

## S6 — Data & Schema

### Tables

All tables have RLS enabled.

#### profiles
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

#### sessions
```sql
id UUID PK
user_id UUID -> profiles
avatar_id UUID -> avatars
profile_label TEXT
profile_data JSONB  -- coaching profile used for this session
status TEXT NOT NULL DEFAULT 'pending'  -- 'pending' | 'active' | 'completed' | 'failed' | 'expired'
duration_seconds INT
credits_used INT DEFAULT 0
session_notes TEXT  -- GPT-4o-mini generated summary after session ends
feedback_rating INT  -- 1 (not great) | 3 (okay) | 5 (loved it)
feedback_text TEXT
started_at TIMESTAMPTZ DEFAULT now()
ended_at TIMESTAMPTZ
```

#### transcript_entries
```sql
id BIGINT GENERATED
session_id UUID -> sessions
role TEXT ('user' | 'model' | 'system')  -- system for transcription errors
content TEXT
seq INT
created_at TIMESTAMPTZ DEFAULT now()
```

#### session_events
```sql
id BIGINT GENERATED
session_id UUID -> sessions (nullable)
user_id UUID -> profiles
event_type TEXT NOT NULL  -- 'session.init' | 'session.activated' | 'session.ended' | 'session.failed' | 'session.transcript_saved'
metadata JSONB DEFAULT '{}'
created_at TIMESTAMPTZ DEFAULT now()
-- Indexes: event_type, session_id
```

#### avatars
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
voice_id TEXT DEFAULT 'shimmer'
conversation_mode TEXT DEFAULT 'coaching'  -- 'coaching' | 'sales' | 'support' | 'freeform'
knowledge_base JSONB
system_instruction_override TEXT
social_links JSONB  -- { instagram, x, youtube, tiktok, linkedin }
is_published BOOLEAN DEFAULT false
voice_sample_url TEXT  -- pre-generated TTS greeting for profile preview
session_count INT DEFAULT 0
rating DECIMAL(2,1) DEFAULT 5.0
created_at TIMESTAMPTZ DEFAULT now()
```

#### creator_products
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

#### credit_purchases
```sql
id UUID PK
user_id UUID -> profiles
stripe_payment_intent TEXT
credits_added INT NOT NULL
amount_cents INT NOT NULL
currency TEXT DEFAULT 'usd'
created_at TIMESTAMPTZ DEFAULT now()
```

#### creator_subscriptions
```sql
id UUID PK
creator_id UUID -> profiles
tier TEXT ('free' | 'creator' | 'pro' | 'enterprise')
stripe_subscription_id TEXT
status TEXT DEFAULT 'active'
current_period_end TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT now()
```

#### content_library
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

### Database Functions

| Function | Purpose |
|----------|---------|
| `deduct_credits` | Atomic credit deduction during voice sessions |
| `increment_session_count` | Increment avatar session counter |

### Auto-Trigger

- Profile row created automatically on auth signup (15 credits, role: learner)

---

## S7 — Roadmap & Milestones

### Hackathon Phases (March 6-8, 2026)

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Scaffold + Auth | Complete |
| 2 | Database + Migrations | Complete |
| 3 | Conversation Engine | Complete |
| 4 | Creator Dashboard + Avatar Wizard | Complete |
| 5 | Avatar Profile Page (public) | Complete |
| 6 | Full-Screen Voice Session | Complete |
| 7 | Learner Dashboard | Complete |
| 8 | n8n Workflows (image gen + social publisher) | Complete |
| 9 | Stripe Integration | Complete |
| 10 | Landing Page (immersive full-screen redesign) | Complete |
| 11 | Design System (monochrome, animated borders, dark/light) | Complete |
| 12 | Avatar Video Generation (5 avatars, landscape + portrait) | Complete |
| 13 | Multi-Avatar Hero Video (combined MP4, freeze-frame crossfades, subtitle sync) | Complete |
| 14 | Demo Video + Submission | Complete |
| 15 | Image Persistence Pipeline (Supabase Storage) | Complete |
| 16 | Social Links Editor (Creator Dashboard) | Complete |
| 17 | Vercel Deployment + Google OAuth | Complete |

### Post-Hackathon Backlog

- Live animated avatars / TalkingHead
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
- Native iOS + Android apps

---

## S8 — Development & Deployment

### Local Development

```bash
cd ~/lola-platform
npm run dev          # Port 3000, Turbopack
npm run build        # Production build
```

### Deployment

- **Platform**: Vercel
- **URL**: `lola-platform.vercel.app`
- **Auto-deploy**: From `main` branch
- **Environment variables**: Managed in Vercel dashboard

### Demo User

- **ID**: `0d88d57a-cdc4-482d-9c16-35e34be5e3c8`

### Project Tracking

- **ClickUp**: LoLA > Sabrina/Marcin Hackathon (list: `901816480324`)

### File Structure

```
lola-platform/
  app/
    layout.tsx                    # Root layout, dark default, Exo 2 + Space Mono + Noto Sans JP
    page.tsx                      # Server component wrapper for landing
    landing-client.tsx            # Immersive landing: video hero, subtitles, waveform, CTA
    globals.css                   # Tailwind v4 + design tokens + monochrome + animated borders
    (auth)/login, signup, callback
    (marketing)/                  # Features, How It Works, Pricing (monochrome)
    avatar/[slug]/page.tsx        # PUBLIC profile page (link-in-bio)
    session/[slug]/page.tsx       # Full-screen voice session
    dashboard/                    # Learner dashboard
    creator/                      # Creator dashboard + avatar wizard
    api/                          # API routes (realtime, checkout, webhooks, etc.)
  components/
    session/                      # VoiceSession, ImageCarousel, Waveform, Transcript, CreditPill
    onboarding/                   # ProfileQuiz
    avatar/                       # AvatarHero, SceneGallery, ProductGrid
    creator/                      # AvatarWizard, ImagePicker, SceneReview
    landing/                      # HeroVideo, HeroWaveform, HeroSubtitles
    SlideMenu.tsx                 # Always-dark slide-out nav with theme toggle
  lib/
    coaching/                     # 12 principles, profiles, instructions, domains, l1-patterns
    openai/realtime.ts
    stripe/client.ts, config.ts
    supabase/client.ts, server.ts, middleware.ts
  supabase/migrations/            # SQL migrations (001-006)
  scripts/regen-flux.mjs          # Image regeneration script (Together AI)
  middleware.ts
```

### Key Conventions

- TypeScript strict mode
- `@/*` import alias
- Server Components by default, `'use client'` only when needed
- Tailwind v4: `@theme inline` in globals.css, no tailwind.config
- Supabase: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `lib/supabase/middleware.ts` (middleware)

---

## S9 — Integration Boundaries

### n8n (Orchestration Hub)

n8n handles ALL AI tool orchestration. This is deliberate — models and tools change monthly. Swapping FLUX for Ideogram or DALL-E 4 is a one-node change in n8n, zero code changes in the platform.

- **Host**: `n8n.orbweva.cloud`
- **Image gen workflow**: `np7v88fMbocgXKQa`
- **Social publisher workflow**: `mmtJ5YpwbnvPCYdW`
- **Tool swapping**: Switch node in n8n allows A/B testing generators

### Supabase

- **Project**: `udftjfjfxyvghngqywth` (LoLA2)
- **Note**: Supabase MCP is connected to a DIFFERENT project — use REST API with service role key for programmatic access
- Auth, database, and storage are all on this project

### Together AI

- Used for FLUX Kontext Pro image generation (`black-forest-labs/FLUX.1-Kontext-pro`)
- Called directly from `/api/avatars/generate` route (not via n8n)
- **Important**: Together.ai image URLs expire after hours — all generated images are auto-persisted to Supabase Storage
- API key: `TOGETHER_API_KEY` env var

### Blotato

- Social media publishing API (9 platforms from one call)
- Accessed via n8n social publisher workflow
- Requires Blotato API credentials in n8n

### Stripe

- Live integration — handle with care
- Credit purchases (one-time Checkout sessions)
- Creator subscriptions (recurring)
- Webhook handler at `/api/webhooks/stripe`

### OpenAI

- Realtime API for voice sessions (WebRTC, `gpt-4o-realtime-preview`)
- GPT-4o for content generation (via n8n)
- Ephemeral tokens generated server-side at `/api/realtime`

---

## S10 — Market Context

### Target Segments

1. **Language coaches/teachers** — scale 1-on-1 practice sessions (validated via 4,000+ educator network at Loka)
2. **Fitness trainers** — automate check-ins and motivation
3. **Sales teams** — AI product advisors that qualify and recommend
4. **Business mentors/coaches** — scale advisory conversations
5. **AI influencers/creators** — autonomous social media presence with voice engagement

### Competitive Landscape

| Competitor | Gap LoLA Fills |
|-----------|---------------|
| Character.ai | No social media pipeline, no creator monetization, text-only |
| Synthesia | Video-only, no real-time conversation |
| ElevenLabs | Voice cloning but no avatar or social pipeline |
| Replika | Consumer-only, no creator tools, no domain flexibility |
| ChatGPT Voice | No persistent avatar identity, no social publishing, no creator economy |

### Unique Value

- **End-to-end pipeline**: Create avatar -> auto-post to social -> users discover -> real-time voice conversation -> creator earns
- **Domain-agnostic**: One engine serves language, fitness, sales, mentoring, support, custom
- **Character consistency**: Same person across social media, profile page, and voice session
- **Creator economy**: Avatars earn through credit consumption and product sales

### Hackathon Strategy (Sabrina/Marcin, March 6-8, 2026)

**Key insight**: Hackathon participants are potential users. They're builders who want to attract and monetize users for their apps via social media — which is exactly what LoLA does for them. Every participant who sees the demo is a potential creator on the platform.

**Pitch angle**: "You just built something amazing this weekend. Now you need users. LoLA gives you a photorealistic AI avatar that posts to social, engages your prospects in real-time voice conversations, and converts them — while you sleep."

**Demo priorities**:
1. Immersive landing page (wow factor — judges and participants feel like they're talking to a real person)
2. Multi-avatar carousel (proves the platform works for ANY domain, not just one use case)
3. Live voice session (the core product — real-time adaptive conversation)
4. Creator dashboard (show how fast you go from zero to published avatar)
5. Social publishing pipeline (the growth engine that runs on autopilot)

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| FLUX API unavailable | No avatar images | n8n switch to alternate provider. Fallback: URL upload |
| OpenAI Realtime API issues | Core broken | Test early. Fallback: text chat mode |
| Blotato credits unavailable | No social posting | Direct posting via n8n (X/LinkedIn) |
| Character inconsistency | Illusion breaks | Tight prompting + anchor reference + GPT-4o Vision QC |
| Mobile WebRTC issues | Session broken on phone | Test early on real devices. Desktop OK for demo video |
| Session feels generic | Not impressive | Domain presets + personality quiz differentiation |
