'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'

interface VoiceSample {
  voice: string
  url: string
}

const VOICE_DESCRIPTIONS: Record<string, string> = {
  alloy: 'Neutral, versatile',
  ash: 'Warm, deeper',
  ballad: 'Resonant, expressive',
  coral: 'Warm, feminine',
  echo: 'Deep, masculine',
  sage: 'Calm, measured',
  shimmer: 'Bright, feminine',
  verse: 'Smooth, balanced',
  marin: 'Clear, modern',
  cedar: 'Rich, grounded',
}

export default function VoiceComparePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const t = useTranslations('creator')
  const locale = useLocale()

  const [avatarName, setAvatarName] = useState('')
  const [currentVoice, setCurrentVoice] = useState('')
  const [samples, setSamples] = useState<VoiceSample[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [playing, setPlaying] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: avatar } = await supabase
        .from('avatars')
        .select('id, name, voice_id')
        .eq('id', params.id)
        .eq('creator_id', user.id)
        .single()

      if (!avatar) { router.push('/creator/avatars'); return }

      setAvatarName(avatar.name)
      setCurrentVoice(avatar.voice_id || 'shimmer')
      setSelected(avatar.voice_id || 'shimmer')
      setLoading(false)
    }
    load()
  }, [params.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const generateSamples = async () => {
    setGenerating(true)
    setMsg(null)
    try {
      const res = await fetch('/api/avatars/voice-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId: params.id, locale }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg(data.error || 'Generation failed')
      } else {
        setSamples(data.samples || [])
        if (data.errors?.length) {
          setMsg(`${data.samples.length} generated, ${data.errors.length} failed`)
        }
      }
    } catch {
      setMsg('Generation failed — check your connection.')
    }
    setGenerating(false)
  }

  const playVoice = (voice: string, url: string) => {
    if (playing === voice && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(url)
    audioRef.current = audio
    audio.onended = () => setPlaying(null)
    audio.onerror = () => setPlaying(null)
    audio.play()
    setPlaying(voice)
  }

  const saveVoice = async () => {
    if (!selected) return
    setSaving(true)
    setMsg(null)

    const { error } = await supabase
      .from('avatars')
      .update({ voice_id: selected })
      .eq('id', params.id)

    if (error) {
      setMsg(error.message)
    } else {
      setCurrentVoice(selected)
      setMsg(t('voiceUpdated', { voice: selected }))

      // Also regenerate the voice sample with the new voice
      await fetch('/api/avatars/voice-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId: params.id, locale }),
      })
      setMsg(t('voiceUpdatedPreview', { voice: selected }))
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

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('voiceSelection')}</h1>
        <button
          onClick={() => router.push(`/creator/avatars/${params.id}`)}
          className="text-xs text-white/50 hover:text-white"
        >
          {t('backToEdit')}
        </button>
      </div>

      <p className="text-sm text-white/50">
        {t('chooseVoiceFor', { name: avatarName })}{' '}
        {t('currentVoice')}: <span className="text-indigo-400">{currentVoice}</span>
      </p>

      {msg && (
        <div className="glass no-trace rounded-xl p-3">
          <p className="text-sm text-emerald-300">{msg}</p>
        </div>
      )}

      {samples.length === 0 ? (
        <button
          onClick={generateSamples}
          disabled={generating}
          className="w-full py-4 rounded-xl gradient-btn font-medium disabled:opacity-50"
        >
          {generating ? t('generatingSamples') : t('generateSamples')}
        </button>
      ) : (
        <div className="space-y-2">
          {samples.map(({ voice, url }) => (
            <div
              key={voice}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                selected === voice
                  ? 'bg-indigo-500/20 border border-indigo-500/50'
                  : 'glass no-trace hover:bg-white/10 border border-transparent'
              }`}
              onClick={() => setSelected(voice)}
            >
              {/* Play button */}
              <button
                onClick={(e) => { e.stopPropagation(); playVoice(voice, url) }}
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  playing === voice ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                {playing === voice ? (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Voice info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{voice}</span>
                  {voice === currentVoice && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">{t('currentVoice').toLowerCase()}</span>
                  )}
                </div>
                <p className="text-xs text-white/40">{VOICE_DESCRIPTIONS[voice] || ''}</p>
              </div>

              {/* Selection indicator */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selected === voice ? 'border-indigo-400' : 'border-white/20'
              }`}>
                {selected === voice && <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {samples.length > 0 && selected && selected !== currentVoice && (
        <button
          onClick={saveVoice}
          disabled={saving}
          className="w-full py-3 rounded-xl gradient-btn font-medium disabled:opacity-50"
        >
          {saving ? t('saving') : t('setVoice', { voice: selected })}
        </button>
      )}

      {generating && (
        <p className="text-xs text-white/30 text-center">{t('generatingWait')}</p>
      )}
    </div>
  )
}
