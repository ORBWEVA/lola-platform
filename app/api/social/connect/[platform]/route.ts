import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes, createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import {
  SOCIAL_PLATFORMS,
  isOAuthPlatform,
  isPlatformConfigured,
  getCallbackUrl,
  type PlatformId,
} from '@/lib/social/platforms'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const config = SOCIAL_PLATFORMS[platform as PlatformId]

  if (!config) {
    return NextResponse.json({ error: 'Unknown platform' }, { status: 400 })
  }

  if (!isOAuthPlatform(config)) {
    return NextResponse.json({ error: 'Platform does not use OAuth' }, { status: 400 })
  }

  if (!isPlatformConfigured(config)) {
    return NextResponse.json({ error: 'Platform not configured' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'https://lola-platform.vercel.app'))
  }

  const cookieStore = await cookies()

  // Generate state token
  const state = randomBytes(32).toString('base64url')
  cookieStore.set('social_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  const clientId = process.env[`${config.envPrefix}_CLIENT_ID`]!
  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCallbackUrl(platform),
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
  })

  // PKCE support (X/Twitter)
  if (config.usePKCE) {
    const codeVerifier = randomBytes(64).toString('base64url')
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')

    cookieStore.set('social_pkce_verifier', codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })

    authParams.set('code_challenge', codeChallenge)
    authParams.set('code_challenge_method', 'S256')
  }

  return NextResponse.redirect(`${config.authUrl}?${authParams.toString()}`)
}
