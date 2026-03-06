#!/usr/bin/env node
/**
 * Regenerate all demo avatar images using FLUX.1-schnell via Together AI
 * Run: node scripts/regen-flux.mjs
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) env[key.trim()] = rest.join('=').trim()
}

// Together AI key from lola project
const TOGETHER_KEY = 'tgp_v1_m8GKVnZxk1zktB6wgcEKBFlqUvzJAllh3j9HWHG8Rk8'
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

const CAMERA_SUFFIX = 'Shot on Canon EOS R5, 85mm f/1.4 lens. Photorealistic photograph, NOT AI art, NOT illustration, NOT 3D render.'

const AVATARS = [
  {
    slug: 'sakura-sensei',
    anchor: `Professional portrait photo of a young Japanese woman in her late 20s, long dark hair with subtle highlights, warm genuine smile, wearing a casual cream knit sweater, natural makeup, approachable and confident, sitting in a cozy cafe with warm ambient lighting. Shallow depth of field, natural window light. ${CAMERA_SUFFIX}`,
    scenes: [
      `Candid morning photo of a young Japanese woman in a bright apartment, natural window light, holding a matcha latte, cozy oversized sweater, messy hair, warm sleepy smile. iPhone selfie style, authentic. ${CAMERA_SUFFIX}`,
      `Young Japanese woman teaching at a whiteboard covered in Japanese hiragana and kanji, focused expression, wearing a casual blouse, modern office with plants, side angle. ${CAMERA_SUFFIX}`,
      `Young Japanese woman walking through a cherry blossom lined street in Tokyo, casual spring outfit with a light cardigan, golden hour sunlight, candid mid-stride, gentle smile. ${CAMERA_SUFFIX}`,
      `Close-up of a young Japanese woman at a cafe table with textbooks and handwritten notes, reading intently, shallow depth of field, warm cafe lighting, coffee cup nearby. ${CAMERA_SUFFIX}`,
      `Young Japanese woman cooking in a modern kitchen, making ramen, laughing genuinely, steam rising, casual home clothes, warm kitchen lighting. ${CAMERA_SUFFIX}`,
      `Young Japanese woman reading a book in a park, sitting cross-legged under a maple tree, peaceful expression, dappled afternoon sunlight, natural relaxed pose. ${CAMERA_SUFFIX}`,
    ],
  },
  {
    slug: 'coach-marcus',
    anchor: `Professional portrait photo of an athletic Black man in his early 30s, short clean fade haircut, bright confident smile showing teeth, wearing a fitted dark charcoal athletic compression shirt, muscular but lean build, standing in a modern well-lit gym with equipment blurred in background. Natural gym lighting. ${CAMERA_SUFFIX}`,
    scenes: [
      `Athletic Black man post-workout selfie in a modern gym, slight sweat on forehead, confident grin, athletic tank top, gym mirrors and weights blurred behind. Candid authentic style. ${CAMERA_SUFFIX}`,
      `Athletic Black man preparing a colorful healthy meal in a clean modern kitchen, chopping vegetables, focused expression, wearing casual grey athletic wear, bright natural kitchen light. ${CAMERA_SUFFIX}`,
      `Athletic Black man running outdoors in a city park at sunrise, mid-stride action shot, wearing running gear, golden morning light, trees and path blurred in motion. ${CAMERA_SUFFIX}`,
      `Athletic Black man sitting on a gym bench reviewing a workout plan on a tablet, thoughtful expression, towel draped over shoulder, modern gym background, overhead lighting. ${CAMERA_SUFFIX}`,
      `Athletic Black man stretching in a bright yoga studio, peaceful focused expression, natural light from large floor-to-ceiling windows, minimalist white interior. ${CAMERA_SUFFIX}`,
      `Athletic Black man standing on an urban rooftop at golden hour sunset, arms crossed confidently, city skyline behind, wearing a fitted hoodie, warm orange light on face. ${CAMERA_SUFFIX}`,
    ],
  },
  {
    slug: 'alex-rivera',
    anchor: `Professional portrait photo of a confident Hispanic man in his mid-30s, well-groomed short dark hair with slight wave, sharp jawline, warm charismatic smile, wearing a tailored navy blue blazer over a crisp white open-collar shirt, standing in a modern co-working space with glass walls and warm lighting. ${CAMERA_SUFFIX}`,
    scenes: [
      `Hispanic businessman working at a standing desk in a modern glass office, laptop open showing charts, focused but approachable expression, business casual outfit, natural office lighting. ${CAMERA_SUFFIX}`,
      `Hispanic man having a coffee meeting in an upscale cafe, leaning forward engaged in animated conversation, natural hand gesture, shallow depth of field, warm ambient lighting. ${CAMERA_SUFFIX}`,
      `Hispanic man speaking at a small business workshop, standing confidently at the front, hand gesturing naturally, audience of professionals blurred, modern conference room. ${CAMERA_SUFFIX}`,
      `Hispanic businessman walking through a modern city financial district, tailored grey suit, confident purposeful stride, morning sunlight, glass buildings reflecting. ${CAMERA_SUFFIX}`,
      `Hispanic man in casual Friday outfit, sitting relaxed on a modern couch in a startup office, laptop balanced on knee, genuine relaxed smile, creative workspace with whiteboards. ${CAMERA_SUFFIX}`,
      `Hispanic man at a professional networking event, holding a glass, mid-conversation with a genuine laugh, warm ambient string lighting, crowd blurred behind. ${CAMERA_SUFFIX}`,
    ],
  },
  {
    slug: 'emma-lindgren',
    anchor: `Professional portrait photo of a confident Scandinavian woman in her early 40s, blonde hair in a relaxed updo with loose strands, warm genuine smile, wearing a tailored charcoal blazer over a white silk blouse, standing in a modern Scandinavian-design office with light wood and minimalist decor, soft natural window light. ${CAMERA_SUFFIX}`,
    scenes: [
      `Scandinavian businesswoman having a video call on a MacBook in a bright minimalist home office, relaxed confident expression, natural morning light, coffee mug nearby, candid work-from-home moment. ${CAMERA_SUFFIX}`,
      `Scandinavian woman speaking on stage at a startup conference, confident hand gesture, professional blazer, audience silhouettes blurred, dramatic stage lighting. ${CAMERA_SUFFIX}`,
      `Scandinavian woman having coffee with someone at a high-end cafe, leaning forward in animated conversation, warm smile, natural hand gesture, shallow depth of field, cozy Scandinavian interior. ${CAMERA_SUFFIX}`,
      `Close-up of a Scandinavian woman writing in a leather notebook at a standing desk, thoughtful focused expression, modern office with city view through floor-to-ceiling windows, afternoon light. ${CAMERA_SUFFIX}`,
      `Scandinavian woman walking through a modern co-working space, tailored casual outfit, confident stride, greeting someone off-camera with a wave, bright airy interior, natural light. ${CAMERA_SUFFIX}`,
      `Scandinavian woman relaxing on a modern sofa reading a business book, casual elegant home outfit, soft lamp lighting, cozy Scandinavian living room, candid relaxed moment. ${CAMERA_SUFFIX}`,
    ],
  },
]

async function generateImage(prompt) {
  const res = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOGETHER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'RunDiffusion/Juggernaut-pro-flux',
      prompt,
      width: 1024,
      height: 1024,
      steps: 28,
      n: 1,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`  FLUX error: ${err}`)
    return null
  }

  const data = await res.json()
  return data.data?.[0]?.url || null
}

async function uploadToSupabase(imageUrl, path) {
  const imgRes = await fetch(imageUrl)
  const buffer = await imgRes.arrayBuffer()

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
    return false
  }
  return true
}

async function processAvatar(avatar) {
  console.log(`\n=== ${avatar.slug} ===`)

  // Anchor
  console.log('  Generating anchor...')
  const anchorUrl = await generateImage(avatar.anchor)
  if (anchorUrl) {
    const ok = await uploadToSupabase(anchorUrl, `${avatar.slug}/anchor.png`)
    console.log(`  Anchor: ${ok ? 'uploaded' : 'FAILED'}`)
  }

  // Scenes
  for (let i = 0; i < avatar.scenes.length; i++) {
    console.log(`  Generating scene ${i + 1}/${avatar.scenes.length}...`)
    const sceneUrl = await generateImage(avatar.scenes[i])
    if (sceneUrl) {
      const ok = await uploadToSupabase(sceneUrl, `${avatar.slug}/scene-${i}.png`)
      console.log(`  Scene ${i + 1}: ${ok ? 'uploaded' : 'FAILED'}`)
    } else {
      console.log(`  Scene ${i + 1}: GENERATION FAILED`)
    }
    // Brief pause to avoid rate limits
    await new Promise(r => setTimeout(r, 500))
  }
}

async function main() {
  console.log('Regenerating demo avatars with FLUX.1-schnell')
  console.log('=============================================')

  for (const avatar of AVATARS) {
    await processAvatar(avatar)
  }

  console.log('\n=== Done! Images replaced in Supabase Storage ===')
  console.log('Same URLs, new FLUX-generated images. No DB update needed.')
}

main().catch(console.error)
