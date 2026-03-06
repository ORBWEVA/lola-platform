# LoLA Platform — Claude Code Project Instructions

## Project Identity
- **Name**: LoLA Platform (Loka Learning Avatar)
- **Local path**: `~/lola-platform`
- **Remote**: `ORBWEVA/lola-platform`
- **Hackathon**: Sabrina/Marcin AI Hackathon (March 6-8, 2026)

## Tech Stack
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Auth/DB/Storage**: Supabase (Auth with Google OAuth + magic link, PostgreSQL + RLS, Storage)
- **Voice AI**: OpenAI Realtime API (gpt-4o-realtime-preview) via WebRTC
- **Image Gen**: FLUX Kontext Pro (via n8n, swappable)
- **Orchestration**: n8n (self-hosted at n8n.orbweva.cloud)
- **Social Publishing**: Blotato API (via n8n)
- **Payments**: Stripe
- **Deployment**: Vercel

## Dev Environment
```bash
cd ~/lola-platform
npm run dev
```
Runs on port 3000 (Turbopack).

## Key Architecture Decisions
- Domain-agnostic conversation engine (language coaching is one opt-in module, not the default)
- 12 coaching principles adapt to ANY domain via creator config
- n8n handles all AI tool orchestration (image gen, social publishing) — swappable without code changes
- Avatar profile pages are PUBLIC (no auth required to view)
- Auth only required to START a voice session (Google one-tap primary)
- Personality quiz is OPTIONAL enhancement, not a gate

## Coding Conventions
- TypeScript strict mode
- `@/*` import alias
- Server Components by default, `'use client'` only when needed
- Supabase: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server components/actions), `lib/supabase/middleware.ts` (middleware)
- Tailwind v4 — use `@theme inline` in globals.css, no tailwind.config

## Reference
- `HACKATHON_BUILD_SPEC.md` — comprehensive build spec v3.0 (phases, schema, design system, demo flow)

## What NOT to Do
- Don't hardcode for language learning — this is a multi-domain platform
- Don't gate first session behind a quiz or onboarding
- Don't use fading speech bubbles — use persistent scrollable transcript
- Don't modify .env.local without asking
- Don't force-push to main
