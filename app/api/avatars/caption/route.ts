import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, domain, personality, tagline } = await request.json()

  const openai = new OpenAI()

  const domainLabels: Record<string, string> = {
    language_coaching: 'language coach',
    fitness: 'fitness trainer',
    sales: 'sales coach',
    mentoring: 'business mentor',
    support: 'customer support agent',
    custom: 'AI avatar',
  }

  const role = domainLabels[domain] || 'AI avatar'

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You write compelling social media captions for AI avatars. Keep captions authentic, engaging, and conversational — like a real influencer would post. Include a call-to-action that invites people to have a conversation. End every caption with "🔗 Link in bio" on its own line. Never use hashtags excessively (max 3). Never mention "AI" or "artificial" — the avatar is presented as a real character.`,
      },
      {
        role: 'user',
        content: `Write 3 social media caption options for an avatar named "${name}" who is a ${role}. Their personality: "${personality || 'warm and engaging'}". Their tagline: "${tagline || `Your personal ${role}`}".

Return as JSON array with 3 objects, each having "caption" (the post text, 1-3 sentences) and "length" ("short", "medium", "long").`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    return NextResponse.json({ error: 'Caption generation failed' }, { status: 500 })
  }

  const parsed = JSON.parse(content)
  const captions = parsed.captions || parsed.options || [parsed]

  return NextResponse.json({ captions })
}
