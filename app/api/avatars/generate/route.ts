import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getScenesForDomain } from '@/lib/coaching/domains'

const TOGETHER_URL = 'https://api.together.xyz/v1/images/generations'
const KONTEXT_MODEL = 'black-forest-labs/FLUX.1-Kontext-pro'

async function kontextGenerate(prompt: string, anchorUrl?: string): Promise<string | null> {
  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) throw new Error('TOGETHER_API_KEY not configured')

  const body: Record<string, unknown> = {
    model: KONTEXT_MODEL,
    prompt,
    n: 1,
    width: 1024,
    height: 1024,
  }
  if (anchorUrl) {
    body.image_url = anchorUrl
  }

  const res = await fetch(TOGETHER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    console.error('Together AI error:', res.status, await res.text().catch(() => ''))
    return null
  }

  const data = await res.json()
  return data.data?.[0]?.url || null
}

async function persistToStorage(tempUrl: string, userId: string, folder: string, supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  const imgRes = await fetch(tempUrl)
  if (!imgRes.ok) throw new Error('Failed to fetch generated image')
  const buffer = await imgRes.arrayBuffer()
  const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
  const path = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, buffer, { contentType, upsert: false })

  if (error) {
    console.error('Storage upload error:', error.message)
    // Fall back to temporary URL rather than failing entirely
    return tempUrl
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path)

  return publicUrl
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  try {
    if (body.generateScenes) {
      const scenePrompts = body.customScenePrompts?.length > 0
        ? body.customScenePrompts
        : getScenesForDomain(body.domain)

      // Generate all scenes in parallel via FLUX Kontext Pro
      const results = await Promise.allSettled(
        scenePrompts.map(async (s: { label: string; prompt: string }) => {
          const fullPrompt = body.anchorUrl
            ? `This is the SAME PERSON shown in the reference image — keep their exact face, skin tone, hair, and ethnicity unchanged. Only change their clothing and environment. New scene: ${s.prompt}`
            : `${s.prompt}. Character name: ${body.name}`
          const imageUrl = await kontextGenerate(fullPrompt, body.anchorUrl)
          return { label: s.label, imageUrl }
        }),
      )

      const tempScenes = results
        .filter((r): r is PromiseFulfilledResult<{ label: string; imageUrl: string | null }> =>
          r.status === 'fulfilled' && r.value.imageUrl !== null)
        .map(r => r.value.imageUrl as string)

      // Persist to Supabase Storage so URLs don't expire
      const scenes = await Promise.all(
        tempScenes.map(url => persistToStorage(url, user!.id, 'scenes', supabase))
      )

      return NextResponse.json({ scenes })
    }

    // Generate 4 anchor candidates
    const appearance = body.appearance || 'Professional, approachable person in their early 30s, warm genuine smile. Mid-chest portrait shot on iPhone 15 Pro, f/1.8 aperture. Outdoors during golden hour, soft warm backlight with gentle bokeh. Natural skin texture, shallow depth of field, eye-level angle.'
    const prompt = `Photorealistic portrait: ${appearance}. Shot looks like a real photo taken by a friend, not a studio headshot. RAW photo quality, no filters, no AI look.`

    const results = await Promise.allSettled(
      Array.from({ length: 4 }, () => kontextGenerate(prompt)),
    )

    const tempCandidates = results
      .filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value as string)

    // Persist to Supabase Storage so URLs don't expire
    const candidates = await Promise.all(
      tempCandidates.map(url => persistToStorage(url, user!.id, 'anchors', supabase))
    )

    return NextResponse.json({ candidates })
  } catch (e) {
    console.error('Image generation failed:', e)
    return NextResponse.json(
      { error: 'Could not reach image generation service. Please try again.' },
      { status: 502 },
    )
  }
}
