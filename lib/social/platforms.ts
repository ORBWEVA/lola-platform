export type PlatformId = 'x' | 'bluesky' | 'linkedin' | 'pinterest' | 'instagram'

export interface OAuthPlatformConfig {
  name: string
  authUrl: string
  tokenUrl: string
  scopes: string[]
  usePKCE?: boolean
  envPrefix: string
}

export interface AppPasswordPlatformConfig {
  name: string
  authType: 'app_password'
}

export type PlatformConfig = OAuthPlatformConfig | AppPasswordPlatformConfig

export const SOCIAL_PLATFORMS: Record<PlatformId, PlatformConfig> = {
  x: {
    name: 'X (Twitter)',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    usePKCE: true,
    envPrefix: 'X',
  },
  bluesky: {
    name: 'Bluesky',
    authType: 'app_password',
  },
  linkedin: {
    name: 'LinkedIn',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['openid', 'profile', 'w_member_social'],
    envPrefix: 'LINKEDIN',
  },
  pinterest: {
    name: 'Pinterest',
    authUrl: 'https://www.pinterest.com/oauth/',
    tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
    scopes: ['boards:read', 'pins:write'],
    envPrefix: 'PINTEREST',
  },
  instagram: {
    name: 'Instagram',
    authUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
    envPrefix: 'META',
  },
}

export const isOAuthPlatform = (config: PlatformConfig): config is OAuthPlatformConfig => {
  return !('authType' in config)
}

export const isPlatformConfigured = (config: PlatformConfig): boolean => {
  if (!isOAuthPlatform(config)) return true
  const clientId = process.env[`${config.envPrefix}_CLIENT_ID`]
  const clientSecret = process.env[`${config.envPrefix}_CLIENT_SECRET`]
  return !!clientId && !!clientSecret
}

export const getCallbackUrl = (platform: string): string => {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://lola-platform.vercel.app'
  return `${base}/api/social/callback/${platform}`
}
