import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const TOGETHER_URL = 'https://api.together.xyz/v1/images/generations'
const KONTEXT_MODEL = 'black-forest-labs/FLUX.1-Kontext-pro'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'TOGETHER_API_KEY not configured' }, { status: 500 })
  }

  const { imageUrl } = await request.json()

  if (!imageUrl) {
    return NextResponse.json({ error: 'No image URL provided' }, { status: 400 })
  }

  const enhancePrompt =
    'This is the SAME PERSON shown in the reference image. Create a professional studio-quality portrait photo of this exact person. Keep their exact face, skin tone, hair, ethnicity, and all distinguishing features completely identical. Clean neutral background, professional lighting, sharp high-resolution details. Do NOT change any facial features.'

  try {
    const res = await fetch(TOGETHER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: KONTEXT_MODEL,
        prompt: enhancePrompt,
        image_url: imageUrl,
        n: 1,
        width: 1024,
        height: 1024,
      }),
    })

    if (!res.ok) {
      console.error('Together AI enhance error:', res.status, await res.text().catch(() => ''))
      return NextResponse.json({ error: 'Enhancement failed' }, { status: 502 })
    }

    const data = await res.json()
    const enhancedUrl = data.data?.[0]?.url || null

    if (!enhancedUrl) {
      return NextResponse.json({ error: 'Enhancement completed but no image returned' }, { status: 500 })
    }

    return NextResponse.json({ enhancedUrl })
  } catch (e) {
    console.error('Enhancement error:', e)
    return NextResponse.json({ error: 'Enhancement service unavailable' }, { status: 502 })
  }
}
