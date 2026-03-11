import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role env vars not configured')
  return createClient(url, key)
}

function base64UrlDecode(str: string): Buffer {
  // Pad base64url string
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const padding = (4 - (padded.length % 4)) % 4
  return Buffer.from(padded + '='.repeat(padding), 'base64')
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const signedRequest = formData.get('signed_request') as string

    if (!signedRequest) {
      return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 })
    }

    const [sigPart, payloadPart] = signedRequest.split('.')
    if (!sigPart || !payloadPart) {
      return NextResponse.json({ error: 'Invalid signed_request format' }, { status: 400 })
    }

    // Verify signature if META_APP_SECRET is configured
    const appSecret = process.env.META_APP_SECRET
    if (appSecret) {
      const expectedSig = createHmac('sha256', appSecret)
        .update(payloadPart)
        .digest()
      const actualSig = base64UrlDecode(sigPart)

      if (!expectedSig.equals(actualSig)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
      }
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(payloadPart).toString('utf8'))
    const userId = payload.user_id

    if (!userId) {
      return NextResponse.json({ error: 'No user_id in payload' }, { status: 400 })
    }

    // Delete matching social connections
    const admin = getSupabaseAdmin()
    await admin
      .from('social_connections')
      .delete()
      .eq('platform_user_id', userId)
      .in('platform', ['instagram', 'facebook', 'threads'])

    const confirmationCode = `del-${userId}-${Date.now()}`

    return NextResponse.json({
      url: 'https://lola-platform.vercel.app/api/social/deletion-callback',
      confirmation_code: confirmationCode,
    })
  } catch (e) {
    console.error('Deletion callback error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
