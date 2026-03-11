import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role env vars not configured')
  return createClient(url, key)
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { handle, appPassword } = await request.json()

  if (!handle || !appPassword) {
    return NextResponse.json({ error: 'handle and appPassword are required' }, { status: 400 })
  }

  // Create ATP session with Bluesky
  const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: handle, password: appPassword }),
  })

  if (!sessionRes.ok) {
    const errorData = await sessionRes.json().catch(() => ({}))
    return NextResponse.json(
      { error: errorData.message || 'Failed to authenticate with Bluesky' },
      { status: 400 }
    )
  }

  const session = await sessionRes.json()

  // Encrypt credentials
  const encryptedAppPassword = encrypt(appPassword)
  const encryptedAccessJwt = encrypt(session.accessJwt)

  // Upsert social connection
  const admin = getSupabaseAdmin()
  const { error: upsertError } = await admin
    .from('social_connections')
    .upsert(
      {
        creator_id: user.id,
        platform: 'bluesky',
        platform_user_id: session.did,
        platform_username: session.handle,
        access_token: encryptedAppPassword,
        refresh_token: encryptedAccessJwt,
        token_expires_at: null,
        scopes: [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'creator_id,platform' }
    )

  if (upsertError) {
    console.error('Bluesky connection upsert failed:', upsertError)
    return NextResponse.json({ error: 'Failed to save connection' }, { status: 500 })
  }

  return NextResponse.json({ success: true, username: session.handle })
}
