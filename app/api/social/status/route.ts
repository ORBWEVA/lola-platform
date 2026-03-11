import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SOCIAL_PLATFORMS, isOAuthPlatform, type PlatformId } from '@/lib/social/platforms'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: connections } = await supabase
    .from('social_connections')
    .select('platform, platform_username')
    .eq('creator_id', user.id)

  const platforms = Object.entries(SOCIAL_PLATFORMS).map(([id, config]) => {
    const connection = connections?.find(c => c.platform === id)
    const configured = isOAuthPlatform(config)
      ? !!(process.env[`${config.envPrefix}_CLIENT_ID`] && process.env[`${config.envPrefix}_CLIENT_SECRET`])
      : true

    return {
      id: id as PlatformId,
      name: config.name,
      configured,
      connected: !!connection,
      username: connection?.platform_username || null,
      authType: isOAuthPlatform(config) ? 'oauth' as const : 'app_password' as const,
    }
  })

  return NextResponse.json({ platforms })
}
