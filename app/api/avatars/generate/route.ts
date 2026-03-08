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

      const scenes = results
        .filter((r): r is PromiseFulfilledResult<{ label: string; imageUrl: string | null }> =>
          r.status === 'fulfilled' && r.value.imageUrl !== null)
        .map(r => r.value.imageUrl)

      return NextResponse.json({ scenes })
    }

    // Generate 4 anchor candidates
    const appearance = body.appearance || 'Professional, approachable person'
    const prompt = `Portrait photo of ${appearance}. High quality, professional headshot, neutral background, natural lighting. Character name: ${body.name}`

    const results = await Promise.allSettled(
      Array.from({ length: 4 }, () => kontextGenerate(prompt)),
    )

    const candidates = results
      .filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value)

    return NextResponse.json({ candidates })
  } catch (e) {
    console.error('Image generation failed:', e)
    return NextResponse.json(
      { error: 'Could not reach image generation service. Please try again.' },
      { status: 502 },
    )
  }
}
