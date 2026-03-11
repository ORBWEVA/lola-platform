import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { encrypt, decrypt } from '@/lib/crypto'
import { SOCIAL_PLATFORMS, isOAuthPlatform } from '@/lib/social/platforms'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role env vars not configured')
  return createClient(url, key)
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
}

async function refreshXToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = process.env.X_CLIENT_ID
  if (!clientId) throw new Error('X_CLIENT_ID not configured')

  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  })
  if (!res.ok) throw new Error(`X token refresh failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function refreshLinkedInToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('LinkedIn OAuth env vars not configured')

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!res.ok) throw new Error(`LinkedIn token refresh failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function refreshPinterestToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = process.env.PINTEREST_CLIENT_ID
  const clientSecret = process.env.PINTEREST_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Pinterest OAuth env vars not configured')

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) throw new Error(`Pinterest token refresh failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function refreshInstagramToken(accessToken: string): Promise<TokenResponse> {
  const clientId = process.env.META_CLIENT_ID
  const clientSecret = process.env.META_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Meta OAuth env vars not configured')

  const url = new URL('https://graph.facebook.com/v21.0/oauth/access_token')
  url.searchParams.set('grant_type', 'fb_exchange_token')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('client_secret', clientSecret)
  url.searchParams.set('fb_exchange_token', accessToken)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Instagram token refresh failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()

  // Find connections expiring within 7 days
  const { data: connections, error } = await admin
    .from('social_connections')
    .select('id, platform, access_token, refresh_token')
    .lt('token_expires_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
    .not('refresh_token', 'is', null)

  if (error) {
    console.error('Failed to query connections:', error)
    return NextResponse.json({ error: 'DB query failed' }, { status: 500 })
  }

  let refreshed = 0
  let failed = 0

  for (const conn of connections || []) {
    try {
      const platform = conn.platform as keyof typeof SOCIAL_PLATFORMS
      const config = SOCIAL_PLATFORMS[platform]
      if (!config || !isOAuthPlatform(config)) continue

      let tokens: TokenResponse

      switch (platform) {
        case 'x':
          tokens = await refreshXToken(decrypt(conn.refresh_token!))
          break
        case 'linkedin':
          tokens = await refreshLinkedInToken(decrypt(conn.refresh_token!))
          break
        case 'pinterest':
          tokens = await refreshPinterestToken(decrypt(conn.refresh_token!))
          break
        case 'instagram':
          tokens = await refreshInstagramToken(decrypt(conn.access_token))
          break
        default:
          continue
      }

      const updates: Record<string, string | null> = {
        access_token: encrypt(tokens.access_token),
      }
      if (tokens.refresh_token) {
        updates.refresh_token = encrypt(tokens.refresh_token)
      }
      if (tokens.expires_in) {
        updates.token_expires_at = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      }

      await admin.from('social_connections').update(updates).eq('id', conn.id)
      refreshed++
    } catch (e) {
      console.error(`Token refresh failed for ${conn.platform} (${conn.id}):`, e)
      failed++
    }
  }

  return NextResponse.json({ refreshed, failed })
}
