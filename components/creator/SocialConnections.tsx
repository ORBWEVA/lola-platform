'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

interface PlatformStatus {
  id: string
  name: string
  configured: boolean
  connected: boolean
  username: string | null
  authType: 'oauth' | 'app_password'
}

const PLATFORM_STYLES: Record<string, { icon: string; gradient: string }> = {
  x: { icon: 'X', gradient: 'from-gray-700 to-gray-900' },
  bluesky: { icon: 'BS', gradient: 'from-sky-500 to-blue-600' },
  linkedin: { icon: 'LI', gradient: 'from-blue-600 to-blue-700' },
  pinterest: { icon: 'PI', gradient: 'from-red-500 to-red-700' },
  instagram: { icon: 'IG', gradient: 'from-purple-500 via-pink-500 to-orange-400' },
}

function ComingSoonBadge() {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-400">Coming Soon</span>
  )
}

export default function SocialConnections({ compact = false }: { compact?: boolean }) {
  const searchParams = useSearchParams()
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [blueskyForm, setBlueskyForm] = useState<{ handle: string; appPassword: string } | null>(null)
  const [blueskyError, setBlueskyError] = useState<string | null>(null)
  const [blueskySubmitting, setBlueskySubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    const res = await fetch('/api/social/status')
    if (res.ok) {
      const data = await res.json()
      setPlatforms(data.platforms)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    const connected = searchParams.get('connected')
    if (connected) {
      const name = PLATFORM_STYLES[connected] ? connected : connected
      setSuccessMsg(`Connected to ${name}`)
      fetchStatus()
      const timer = setTimeout(() => setSuccessMsg(null), 4000)
      return () => clearTimeout(timer)
    }
    const error = searchParams.get('error')
    if (error) {
      setSuccessMsg(null)
    }
  }, [searchParams, fetchStatus])

  const handleConnect = (platform: PlatformStatus) => {
    if (platform.authType === 'app_password') {
      setBlueskyForm({ handle: '', appPassword: '' })
      return
    }
    window.location.href = `/api/social/connect/${platform.id}`
  }

  const handleDisconnect = async (platformId: string) => {
    setDisconnecting(platformId)
    const res = await fetch(`/api/social/disconnect/${platformId}`, { method: 'POST' })
    if (res.ok) {
      setPlatforms(prev => prev.map(p =>
        p.id === platformId ? { ...p, connected: false, username: null } : p
      ))
    }
    setDisconnecting(null)
  }

  const handleBlueskySubmit = async () => {
    if (!blueskyForm) return
    setBlueskySubmitting(true)
    setBlueskyError(null)

    const res = await fetch('/api/social/connect/bluesky', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blueskyForm),
    })

    if (res.ok) {
      const data = await res.json()
      setPlatforms(prev => prev.map(p =>
        p.id === 'bluesky' ? { ...p, connected: true, username: data.username } : p
      ))
      setBlueskyForm(null)
      setSuccessMsg('Connected to Bluesky')
      setTimeout(() => setSuccessMsg(null), 4000)
    } else {
      const data = await res.json()
      setBlueskyError(data.error || 'Failed to connect')
    }
    setBlueskySubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {!compact && <h3 className="text-sm font-semibold">Social media</h3>}
        <p className="text-xs text-muted">
          Connect your social accounts to enable auto-publishing.
        </p>

        {successMsg && (
          <div className="glass no-trace border border-emerald-500/30 rounded-xl p-2">
            <p className="text-xs text-emerald-300">{successMsg}</p>
          </div>
        )}

        <div className="space-y-2">
          {platforms.map(p => {
            const style = PLATFORM_STYLES[p.id] || { icon: '?', gradient: 'from-gray-600 to-gray-800' }

            return (
              <div key={p.id} className={`glass rounded-xl overflow-hidden transition-all ${!p.configured && !p.connected ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3 p-3">
                  <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${style.gradient} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                    {style.icon}
                  </span>
                  <span className="text-sm font-medium flex-1">{p.name}</span>

                  {!p.configured ? (
                    <ComingSoonBadge />
                  ) : p.connected ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        @{p.username}
                      </span>
                      <button
                        onClick={() => handleDisconnect(p.id)}
                        disabled={disconnecting === p.id}
                        className="text-xs px-2 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {disconnecting === p.id ? '...' : 'Disconnect'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnect(p)}
                      className="text-xs px-3 py-1 rounded-lg border border-glass-border hover:bg-white/5 transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>

                {/* Bluesky inline form */}
                {p.id === 'bluesky' && blueskyForm && !p.connected && (
                  <div className="px-3 pb-3 space-y-2">
                    <input
                      value={blueskyForm.handle}
                      onChange={e => setBlueskyForm(prev => prev ? { ...prev, handle: e.target.value } : prev)}
                      placeholder="handle (e.g. user.bsky.social)"
                      className="w-full px-3 py-2 rounded-lg bg-background border border-glass-border focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-sm"
                    />
                    <input
                      type="password"
                      value={blueskyForm.appPassword}
                      onChange={e => setBlueskyForm(prev => prev ? { ...prev, appPassword: e.target.value } : prev)}
                      placeholder="App password (Settings → App Passwords)"
                      className="w-full px-3 py-2 rounded-lg bg-background border border-glass-border focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-sm"
                    />
                    {blueskyError && (
                      <p className="text-xs text-red-400">{blueskyError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleBlueskySubmit}
                        disabled={!blueskyForm.handle.trim() || !blueskyForm.appPassword.trim() || blueskySubmitting}
                        className="flex-1 py-2 rounded-lg gradient-btn text-xs font-medium disabled:opacity-50"
                      >
                        {blueskySubmitting ? 'Connecting...' : 'Connect'}
                      </button>
                      <button
                        onClick={() => { setBlueskyForm(null); setBlueskyError(null) }}
                        className="px-3 py-2 rounded-lg border border-glass-border hover:bg-white/5 transition-colors text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Voice cloning */}
      {!compact && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Voice cloning</h3>
            <ComingSoonBadge />
          </div>
          <p className="text-xs text-muted">
            Clone your own voice with ElevenLabs. For now, your avatar uses a high-quality OpenAI voice.
          </p>
        </div>
      )}
    </div>
  )
}
