import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getScenesForDomain } from '@/lib/coaching/domains'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const n8nBase = process.env.N8N_WEBHOOK_BASE

  if (!n8nBase) {
    return NextResponse.json({ error: 'n8n not configured' }, { status: 500 })
  }

  try {
    if (body.generateScenes) {
      // Use creator's custom scene prompts if provided, otherwise domain defaults
      const scenePrompts = body.customScenePrompts?.length > 0
        ? body.customScenePrompts
        : getScenesForDomain(body.domain)

      const res = await fetch(`${n8nBase}/generate-avatar-scenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anchor_url: body.anchorUrl,
          domain: body.domain,
          avatar_name: body.name,
          scene_prompts: scenePrompts.map((s: { label: string; prompt: string }) => ({
            label: s.label,
            prompt: s.prompt,
          })),
        }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error')
        console.error('n8n scene generation error:', res.status, errText)
        return NextResponse.json({ error: 'Scene generation failed' }, { status: 500 })
      }

      const data = await res.json()
      return NextResponse.json({ scenes: data.scenes || [] })
    }

    // Generate 4 anchor candidates
    const res = await fetch(`${n8nBase}/generate-avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appearance_description: body.appearance,
        domain: body.domain,
        avatar_name: body.name,
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error')
      console.error('n8n image generation error:', res.status, errText)
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({ candidates: data.candidates || [] })
  } catch (e) {
    console.error('n8n request failed:', e)
    return NextResponse.json(
      { error: 'Could not reach image generation service. Please try again.' },
      { status: 502 },
    )
  }
}
