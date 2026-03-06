#!/usr/bin/env node
/**
 * Seed 3 demo avatars with DALL-E 3 generated images.
 * Run: node scripts/seed-demo-avatars.mjs
 * Requires: OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) env[key.trim()] = rest.join('=').trim()
}

const OPENAI_KEY = env.OPENAI_API_KEY
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!OPENAI_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars. Check .env.local')
  process.exit(1)
}

const AVATARS = [
  {
    name: 'Sakura Sensei',
    slug: 'sakura-sensei',
    domain: 'language_coaching',
    personality_traits: 'Warm, encouraging, patient with beginners, uses gentle humor, celebrates small wins',
    tagline: 'Your personal Japanese language coach — multilingual and always patient',
    appearance: 'Young Japanese woman in her late 20s, long dark hair with subtle highlights, warm genuine smile, wearing a casual cream knit sweater, natural makeup, approachable and confident, sitting in a cozy cafe',
    voice_id: 'shimmer',
    conversation_mode: 'coaching',
    scene_prompts: [
      'Candid morning photo in a bright Japanese apartment, natural window light, holding matcha latte, cozy casual outfit, warm smile',
      'Teaching at a whiteboard with Japanese characters, focused expression, professional but approachable, office setting with plants',
      'Walking through a cherry blossom lined street in Tokyo, casual spring outfit, golden hour, candid mid-stride',
      'Close-up at a cafe table with textbooks and notes, studying, shallow depth of field, warm lighting',
      'Cooking in a modern kitchen, making Japanese food, laughing, casual home clothes, steam rising from pot',
      'Reading a book in a park, sitting under a tree, peaceful expression, dappled sunlight',
    ],
  },
  {
    name: 'Coach Marcus',
    slug: 'coach-marcus',
    domain: 'fitness_training',
    personality_traits: 'Motivating, direct but empathetic, evidence-based, high energy, tough love with heart',
    tagline: 'Your AI fitness coach — adapts to your level, speaks your language',
    appearance: 'Athletic Black man in his early 30s, short fade haircut, bright confident smile, wearing a fitted dark athletic shirt, muscular but approachable build, standing in a modern gym',
    voice_id: 'echo',
    conversation_mode: 'coaching',
    scene_prompts: [
      'Post-workout selfie in a modern gym, slight sweat, confident smile, athletic tank top, gym equipment blurred in background',
      'Preparing a healthy meal in a clean modern kitchen, colorful vegetables on counter, focused expression, casual athletic wear',
      'Outdoor running in a city park at sunrise, mid-stride action shot, athletic outfit, golden morning light',
      'Sitting on a gym bench reviewing a workout plan on tablet, thoughtful expression, towel over shoulder',
      'Stretching in a yoga studio, peaceful expression, natural light from large windows, minimalist space',
      'Standing on a rooftop at sunset, arms crossed, confident pose, city skyline background, motivational energy',
    ],
  },
  {
    name: 'Alex Rivera',
    slug: 'alex-rivera',
    domain: 'sales_coaching',
    personality_traits: 'Charismatic, strategic, asks great questions, consultative approach, data-driven',
    tagline: 'Your AI sales advisor — closes deals, builds relationships',
    appearance: 'Professional Hispanic man in his mid-30s, well-groomed short dark hair, sharp jawline, confident warm smile, wearing a tailored navy blazer over a white open-collar shirt, standing in a modern co-working space',
    voice_id: 'alloy',
    conversation_mode: 'sales',
    scene_prompts: [
      'Working at a standing desk in a modern office, laptop open with charts, focused but approachable, business casual',
      'Having coffee meeting in an upscale cafe, leaning forward engaged in conversation, natural gesture, shallow depth of field',
      'Speaking at a small workshop, standing confidently, hand gesturing, audience blurred, professional setting',
      'Walking through a modern city financial district, tailored outfit, confident stride, morning light, briefcase in hand',
      'Casual Friday look, sitting on a couch in a startup office, laptop on lap, relaxed smile, creative workspace',
      'Networking event, holding a drink, mid-conversation with a smile, warm ambient lighting, professional crowd blurred',
    ],
  },
]

async function generateImage(prompt) {
  console.log(`  Generating: ${prompt.substring(0, 60)}...`)
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: `${prompt}. Photorealistic, high quality, Instagram influencer style photo. NOT a cartoon, NOT an illustration, NOT AI-looking.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`  DALL-E error: ${err}`)
    return null
  }

  const data = await res.json()
  return data.data[0]?.url || null
}

async function uploadToSupabase(imageUrl, path) {
  // Download image
  const imgRes = await fetch(imageUrl)
  const buffer = await imgRes.arrayBuffer()

  // Upload to Supabase Storage
  const uploadRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/avatars/${path}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'image/png',
        'x-upsert': 'true',
      },
      body: Buffer.from(buffer),
    }
  )

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    console.error(`  Upload error: ${err}`)
    return null
  }

  // Return public URL
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`
}

async function createStorageBucket() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: 'avatars',
      name: 'avatars',
      public: true,
    }),
  })
  if (res.ok) {
    console.log('Created avatars storage bucket')
  } else {
    const text = await res.text()
    if (text.includes('already exists')) {
      console.log('Avatars bucket already exists')
    } else {
      console.error('Bucket creation error:', text)
    }
  }
}

async function insertAvatar(avatar) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/avatars`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(avatar),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`  Insert error: ${err}`)
    return null
  }

  const data = await res.json()
  return data[0]
}

async function seedAvatar(config) {
  console.log(`\n=== Seeding ${config.name} ===`)

  // Generate anchor image
  console.log('Generating anchor image...')
  const anchorUrl = await generateImage(config.appearance)
  if (!anchorUrl) {
    console.error(`Failed to generate anchor for ${config.name}`)
    return
  }

  // Upload anchor
  const anchorPath = `${config.slug}/anchor.png`
  const storedAnchor = await uploadToSupabase(anchorUrl, anchorPath)
  console.log(`  Anchor: ${storedAnchor ? 'uploaded' : 'FAILED'}`)

  // Generate scene images (do 3 at a time to avoid rate limits)
  const sceneUrls = []
  for (let i = 0; i < config.scene_prompts.length; i++) {
    const sceneUrl = await generateImage(config.scene_prompts[i])
    if (sceneUrl) {
      const scenePath = `${config.slug}/scene-${i}.png`
      const storedScene = await uploadToSupabase(sceneUrl, scenePath)
      if (storedScene) sceneUrls.push(storedScene)
      console.log(`  Scene ${i + 1}: ${storedScene ? 'uploaded' : 'FAILED'}`)
    }
    // Small delay to avoid rate limits
    if (i < config.scene_prompts.length - 1) {
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  // Insert avatar record
  // We need a creator_id - use a system/demo user ID
  // First check if there's already an avatar with this slug
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/avatars?slug=eq.${config.slug}&select=id`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
    }
  )
  const existing = await checkRes.json()
  if (existing.length > 0) {
    console.log(`  Avatar ${config.slug} already exists, updating...`)
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/avatars?slug=eq.${config.slug}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anchor_image_url: storedAnchor,
          scene_images: sceneUrls,
          is_published: true,
        }),
      }
    )
    if (updateRes.ok) console.log(`  Updated ${config.name}`)
    return
  }

  // Need a creator_id - create a demo user profile if needed
  const demoUserId = '00000000-0000-0000-0000-000000000001'

  // Ensure demo profile exists
  await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=ignore-duplicates',
    },
    body: JSON.stringify({
      id: demoUserId,
      display_name: 'LoLA Demo',
      role: 'creator',
      credits: 999,
    }),
  })

  const avatarRecord = {
    creator_id: demoUserId,
    name: config.name,
    slug: config.slug,
    domain: config.domain,
    personality_traits: config.personality_traits,
    tagline: config.tagline,
    appearance_description: config.appearance,
    anchor_image_url: storedAnchor,
    scene_images: sceneUrls,
    voice_id: config.voice_id,
    conversation_mode: config.conversation_mode,
    is_published: true,
  }

  const inserted = await insertAvatar(avatarRecord)
  if (inserted) {
    console.log(`  Inserted ${config.name} (id: ${inserted.id})`)
  }
}

async function main() {
  console.log('LoLA Demo Avatar Seeder')
  console.log('======================')

  await createStorageBucket()

  for (const avatar of AVATARS) {
    await seedAvatar(avatar)
  }

  console.log('\n=== Done! ===')
  console.log('Demo avatars seeded. Visit:')
  for (const a of AVATARS) {
    console.log(`  /avatar/${a.slug}`)
  }
}

main().catch(console.error)
