import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_RATINGS = [1, 3, 5] as const

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { sessionId, rating, text } = body

  if (!sessionId || !rating || !VALID_RATINGS.includes(rating)) {
    return NextResponse.json(
      { error: 'Invalid request. Rating must be 1, 3, or 5.' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('sessions')
    .update({
      feedback_rating: rating,
      feedback_text: text || null,
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
