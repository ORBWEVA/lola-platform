import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'
import {
  SOCIAL_PLATFORMS,
  isOAuthPlatform,
  getCallbackUrl,
  type PlatformId,
} from '@/lib/social/platforms'

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role env vars not configured')
  return createClient(url, key)
}

const redirectUrl = (path: string) => {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://lola-platform.vercel.app'
  return NextResponse.redirect(new URL(path, base))
}

interface PlatformProfile {
  id: string
  username: string
}

const fetchProfile = async (platform: string, accessToken: string): Promise<PlatformProfile> => {
  const headers = { Authorization: `Bearer ${accessToken}` }

  switch (platform) {
    case 'x': {
      const res = await fetch('https://api.twitter.com/2/users/me', { headers })
      const { data } = await res.json()
      return { id: data.id, username: data.username }
    }
    case 'linkedin': {
      const res = await fetch('https://api.linkedin.com/v2/userinfo', { headers })
      const data = await res.json()
      return { id: data.sub, username: data.name }
    }
    case 'pinterest': {
      const res = await fetch('https://api.pinterest.com/v5/user_account', { headers })
      const data = await res.json()
      return { id: data.username, username: data.username }
    }
    case 'instagram': {
      const res = await fetch('https://graph.facebook.com/v21.0/me?fields=id,name', { headers })
      const data = await res.json()
      return { id: data.id, username: data.name }
    }
    default:
      throw new Error(`Unknown platform: ${platform}`)
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const config = SOCIAL_PLATFORMS[platform as PlatformId]

  if (!config || !isOAuthPlatform(config)) {
    return redirectUrl('/creator/avatars?error=social_connect_failed')
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code || !state) {
    return redirectUrl('/creator/avatars?error=social_connect_failed')
  }

  const cookieStore = await cookies()
  const savedState = cookieStore.get('social_oauth_state')?.value

  if (!savedState || savedState !== state) {
    return redirectUrl('/creator/avatars?error=social_connect_failed')
  }

  // Get authenticated user
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirectUrl('/login')
  }

  try {
    const clientId = process.env[`${config.envPrefix}_CLIENT_ID`]!
    const clientSecret = process.env[`${config.envPrefix}_CLIENT_SECRET`]!

    // Exchange code for tokens
    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getCallbackUrl(platform),
    })

    const tokenHeaders: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    if (platform === 'pinterest') {
      // Pinterest uses Basic auth
      tokenHeaders['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    } else {
      tokenBody.set('client_id', clientId)
      tokenBody.set('client_secret', clientSecret)
    }

    // Add PKCE verifier if needed
    if (config.usePKCE) {
      const verifier = cookieStore.get('social_pkce_verifier')?.value
      if (verifier) {
        tokenBody.set('code_verifier', verifier)
      }
    }

    const tokenRes = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: tokenHeaders,
      body: tokenBody.toString(),
    })

    if (!tokenRes.ok) {
      console.error(`Token exchange failed for ${platform}:`, await tokenRes.text())
      return redirectUrl('/creator/avatars?error=social_connect_failed')
    }

    const tokens = await tokenRes.json()
    const { access_token, refresh_token, expires_in } = tokens

    // Fetch user profile from platform
    const profile = await fetchProfile(platform, access_token)

    // Compute token expiry
    const tokenExpiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000).toISOString()
      : null

    // Encrypt tokens
    const encryptedAccessToken = encrypt(access_token)
    const encryptedRefreshToken = refresh_token ? encrypt(refresh_token) : null

    // Upsert social connection
    const admin = getSupabaseAdmin()
    const { error: upsertError } = await admin
      .from('social_connections')
      .upsert(
        {
          creator_id: user.id,
          platform,
          platform_user_id: profile.id,
          platform_username: profile.username,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          scopes: config.scopes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'creator_id,platform' }
      )

    if (upsertError) {
      console.error('Social connection upsert failed:', upsertError)
      return redirectUrl('/creator/avatars?error=social_connect_failed')
    }

    // Clear OAuth cookies
    cookieStore.delete('social_oauth_state')
    cookieStore.delete('social_pkce_verifier')

    return redirectUrl(`/creator/avatars?connected=${platform}`)
  } catch (error) {
    console.error(`Social connect error for ${platform}:`, error)
    return redirectUrl('/creator/avatars?error=social_connect_failed')
  }
}
