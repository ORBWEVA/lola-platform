'use client'

import { createClient } from '@/lib/supabase/client'
import { DOMAIN_PRESETS } from '@/lib/coaching/domains'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface AvatarData {
  id: string
  name: string
  slug: string
  domain: string
  personality_traits: string
  tagline: string
  appearance_description: string
  anchor_image_url: string | null
  scene_images: string[] | null
  voice_id: string
  is_published: boolean
}

export default function EditAvatarPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [avatar, setAvatar] = useState<AvatarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Editable fields
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [personality, setPersonality] = useState('')
  const [domain, setDomain] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('avatars')
        .select('*')
        .eq('id', params.id)
        .eq('creator_id', user.id)
        .single()

      if (error || !data) {
        setErrorMsg('Avatar not found or you do not have access.')
        setLoading(false)
        return
      }

      setAvatar(data)
      setName(data.name)
      setTagline(data.tagline || '')
      setPersonality(data.personality_traits || '')
      setDomain(data.domain || 'custom')
      setIsPublished(data.is_published)
      setLoading(false)
    }
    load()
  }, [params.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!avatar) return
    setSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const { error } = await supabase
      .from('avatars')
      .update({
        name,
        slug,
        tagline,
        personality_traits: personality,
        domain,
        is_published: isPublished,
      })
      .eq('id', avatar.id)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('Avatar updated.')
      setAvatar(prev => prev ? { ...prev, name, slug, tagline, personality_traits: personality, domain, is_published: isPublished } : prev)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!avatar) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">{errorMsg || 'Avatar not found.'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Avatar</h1>
        <a
          href={`/avatar/${avatar.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-400 hover:underline"
        >
          View profile →
        </a>
      </div>

      {/* Anchor image preview */}
      {avatar.anchor_image_url && (
        <div className="w-24 h-24 rounded-xl overflow-hidden relative">
          <Image src={avatar.anchor_image_url} alt={avatar.name} fill className="object-cover" />
        </div>
      )}

      {/* Error / success messages */}
      {errorMsg && (
        <div className="glass no-trace border border-red-500/30 rounded-xl p-3">
          <p className="text-sm text-red-300">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="glass no-trace border border-emerald-500/30 rounded-xl p-3">
          <p className="text-sm text-emerald-300">{successMsg}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted block mb-1">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted block mb-1">Tagline</label>
          <input
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted block mb-1">Personality</label>
          <input
            value={personality}
            onChange={e => setPersonality(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted block mb-1">Domain</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(DOMAIN_PRESETS).map(p => (
              <button
                key={p.id}
                onClick={() => setDomain(p.id)}
                className={`p-2 rounded-xl text-xs text-left transition-all ${
                  domain === p.id
                    ? 'gradient-btn font-medium'
                    : 'glass hover:bg-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPublished(!isPublished)}
            className={`w-10 h-6 rounded-full transition-colors relative ${isPublished ? 'bg-emerald-500' : 'bg-white/20'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isPublished ? 'left-5' : 'left-1'}`} />
          </button>
          <span className="text-sm">{isPublished ? 'Published' : 'Draft'}</span>
        </div>

        {/* Scene images preview */}
        {avatar.scene_images && avatar.scene_images.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted block mb-2">Scene Images</label>
            <div className="grid grid-cols-3 gap-2">
              {avatar.scene_images.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden relative aspect-square">
                  <Image src={url} alt={`Scene ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push('/creator/avatars')}
            className="flex-1 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors"
          >
            Back
          </button>
          <button
            onClick={save}
            disabled={!name.trim() || saving}
            className="flex-1 py-3 rounded-xl gradient-btn font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Share to social */}
        {isPublished && (
          <button
            onClick={() => router.push(`/creator/avatars/${avatar.id}/published`)}
            className="w-full py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share to Social Media
          </button>
        )}
      </div>
    </div>
  )
}
