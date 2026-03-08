# Avatar Video Prompts (kie.ai / Veo 3.1)

## Workflow

1. **Enhance anchor images** — Run each avatar's FLUX-generated anchor image through Nanobanana Pro to establish a consistent, enhanced visual baseline
2. **Generate videos** — Use the enhanced images as reference input in Veo 3 alongside the prompts below, so each video stays on-model with the avatar's established look
3. **Place files** — Follow the naming convention at the bottom of this doc

### Why enhance first?

Character consistency is the hardest part of AI-generated media. Without a consistent reference, Veo 3 will generate a different-looking person each time, breaking the illusion across profile images, scene images, and video. Nanobanana Pro locks in the face/look, then Veo 3 animates from that baseline.

### Source anchor images

| Avatar | Anchor Image |
|--------|-------------|
| Sara | `public/avatars/sara/anchor.jpg` (local) |
| Sakura Sensei | https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/anchor.png |
| Coach Marcus | https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/anchor.png |
| Alex Rivera | https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/anchor.png |
| Emma Lindgren | https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/anchor.png |

### Scene images (for additional reference)

**Sakura Sensei**
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/scene-0.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/scene-1.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/scene-2.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/scene-3.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/scene-4.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/sakura-sensei/scene-5.png

**Coach Marcus**
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/scene-0.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/scene-1.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/scene-2.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/scene-3.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/scene-4.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/coach-marcus/scene-5.png

**Alex Rivera**
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/scene-0.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/scene-1.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/scene-2.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/scene-3.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/scene-4.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/alex-rivera/scene-5.png

**Emma Lindgren**
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/scene-0.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/scene-1.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/scene-2.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/scene-3.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/scene-4.png
- https://udftjfjfxyvghngqywth.supabase.co/storage/v1/object/public/avatars/emma-lindgren/scene-5.png

---

## Voice Lines (Spoken Dialogue)

Each avatar speaks their intro line in the video. These lines are what the avatar mouths on camera, displayed as synced subtitles on the landing page, and generated as voice-over audio via ElevenLabs.

| Avatar | ElevenLabs Voice ID | Line |
|--------|-------------------|------|
| Sara | `oAyAUy2T7oSLWwREApp9` | "I'm Sara. Pick a language, any language — I'll keep up. Let's talk." |
| Sakura Sensei | `xwDy9oDEtzWzFo6FqAI9` | "I'm Sakura. Whether it's Japanese or any language, I'll meet you where you are. Let's begin." |
| Coach Marcus | `6OzrBCQf8cjERkYgzSg8` | "I'm Marcus. Your goals, your pace, your language. Let's get to work." |
| Alex Rivera | `RWLFUuahyl6QdlLs8Al5` | "I'm Alex. I help you find exactly what you need, in any language. Let's figure it out." |
| Emma Lindgren | `EQu48Nbp4OqDxsnYh27f` | "I'm Emma. Strategy, growth, straight talk — in whatever language you think in. Let's go." |

### Usage in Veo 3

When generating videos, include the voice line in the prompt so the avatar's lip movement matches the dialogue. For example, append to the visual prompt:

> The person is saying: "I'm Sara. Pick a language, any language — I'll keep up. Let's talk."

---

## 16:9 Landscape

### Sara
A photorealistic young woman with red hair, mid-shot from the waist up, looking directly into the camera with a warm, inviting smile. She is speaking naturally, with subtle lip movement and micro-expressions. Modern minimalist studio with soft warm lighting behind her. Soft cinematic lighting, shallow depth of field, 16:9 landscape. The camera holds steady with a very slight gentle drift. 8 seconds.

### Sakura Sensei
A photorealistic Japanese woman in her late 20s, mid-shot from the waist up, looking directly into the camera with a gentle, encouraging smile. She is speaking naturally, with subtle lip movement and micro-expressions. A cozy Tokyo cafe with cherry blossom branches visible through the window. Soft cinematic lighting, shallow depth of field, 16:9 landscape. The camera holds steady with a very slight gentle drift. 8 seconds.

### Coach Marcus
A photorealistic athletic Black man in his early 30s, mid-shot from the waist up, looking directly into the camera with an energetic, motivating expression. He is speaking naturally, with subtle lip movement and micro-expressions. A modern gym environment with soft ambient lighting, slightly blurred equipment in the background. Soft cinematic lighting, shallow depth of field, 16:9 landscape. The camera holds steady with a very slight gentle drift. 8 seconds.

### Alex Rivera
A photorealistic Latino man in his mid-30s, mid-shot from the waist up, looking directly into the camera with a confident, approachable expression. He is speaking naturally, with subtle lip movement and micro-expressions. A modern office space with a clean desk and subtle city skyline through a window. Soft cinematic lighting, shallow depth of field, 16:9 landscape. The camera holds steady with a very slight gentle drift. 8 seconds.

### Emma Lindgren
A photorealistic Scandinavian woman in her late 30s, mid-shot from the waist up, looking directly into the camera with a direct, strategic gaze and slight knowing smile. She is speaking naturally, with subtle lip movement and micro-expressions. A sleek boardroom or modern workspace with neutral tones. Soft cinematic lighting, shallow depth of field, 16:9 landscape. The camera holds steady with a very slight gentle drift. 8 seconds.

---

## 9:16 Portrait

### Sara
A photorealistic young woman with red hair, medium close-up, head and shoulders with space above, looking directly into the camera with a warm, inviting smile. She is speaking naturally, with subtle lip movement and micro-expressions. Modern minimalist studio with soft warm lighting behind her. Soft cinematic lighting, shallow depth of field, 9:16 portrait. The camera holds steady with a very slight gentle drift. 8 seconds.

### Sakura Sensei
A photorealistic Japanese woman in her late 20s, medium close-up, head and shoulders with space above, looking directly into the camera with a gentle, encouraging smile. She is speaking naturally, with subtle lip movement and micro-expressions. A cozy Tokyo cafe with cherry blossom branches visible through the window. Soft cinematic lighting, shallow depth of field, 9:16 portrait. The camera holds steady with a very slight gentle drift. 8 seconds.

### Coach Marcus
A photorealistic athletic Black man in his early 30s, medium close-up, head and shoulders with space above, looking directly into the camera with an energetic, motivating expression. He is speaking naturally, with subtle lip movement and micro-expressions. A modern gym environment with soft ambient lighting, slightly blurred equipment in the background. Soft cinematic lighting, shallow depth of field, 9:16 portrait. The camera holds steady with a very slight gentle drift. 8 seconds.

### Alex Rivera
A photorealistic Latino man in his mid-30s, medium close-up, head and shoulders with space above, looking directly into the camera with a confident, approachable expression. He is speaking naturally, with subtle lip movement and micro-expressions. A modern office space with a clean desk and subtle city skyline through a window. Soft cinematic lighting, shallow depth of field, 9:16 portrait. The camera holds steady with a very slight gentle drift. 8 seconds.

### Emma Lindgren
A photorealistic Scandinavian woman in her late 30s, medium close-up, head and shoulders with space above, looking directly into the camera with a direct, strategic gaze and slight knowing smile. She is speaking naturally, with subtle lip movement and micro-expressions. A sleek boardroom or modern workspace with neutral tones. Soft cinematic lighting, shallow depth of field, 9:16 portrait. The camera holds steady with a very slight gentle drift. 8 seconds.

---

## File Naming Convention

Place generated videos in `public/avatars/{slug}/`:

| Avatar | Slug | Landscape | Portrait |
|--------|------|-----------|----------|
| Sara | sara | hero-landscape.mp4 | hero-portrait.mp4 |
| Sakura Sensei | sakura-sensei | hero-landscape.mp4 | hero-portrait.mp4 |
| Coach Marcus | coach-marcus | hero-landscape.mp4 | hero-portrait.mp4 |
| Alex Rivera | alex-rivera | hero-landscape.mp4 | hero-portrait.mp4 |
| Emma Lindgren | emma-lindgren | hero-landscape.mp4 | hero-portrait.mp4 |

## Notes

- **"mid-shot from the waist up"** (landscape) prevents extreme close-ups
- **"head and shoulders with space above"** (portrait) gives breathing room in 9:16
- **"speaking naturally, with subtle lip movement"** sells the illusion they're speaking the subtitles
- **"camera holds steady with a very slight gentle drift"** keeps it cinematic without being distracting on loop
- **8 seconds** matches current subtitle/waveform timing
- Once portrait videos are ready, re-enable dual `<source>` in HeroVideo.tsx with `media="(max-width: 767px)"`
