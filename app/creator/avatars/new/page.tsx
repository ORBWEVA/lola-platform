'use client'

import { createClient } from '@/lib/supabase/client'
import { DOMAIN_PRESETS, getDomainPreset, getScenesForDomain, type SceneTemplate } from '@/lib/coaching/domains'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import SocialPreviewCard from '@/components/creator/SocialPreviewCard'
import SocialConnections from '@/components/creator/SocialConnections'

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

function HelpTip({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted/70 mt-1.5 leading-relaxed">{children}</p>
  )
}

const IMAGE_MODELS = [
  { id: 'juggernaut-pro-flux', label: 'Juggernaut Pro (Photorealistic)', default: true },
  { id: 'flux-schnell', label: 'FLUX.1 Schnell (Fast)' },
  { id: 'flux-kontext-pro', label: 'FLUX Kontext Pro (Best Consistency)' },
  { id: 'flux-1.1-pro-ultra', label: 'FLUX 1.1 Pro Ultra (2K Resolution)' },
  { id: 'gpt-image-1.5', label: 'GPT Image 1.5 (Best Text Rendering)' },
  { id: 'nanobanana', label: 'NanoBanana (AI Viral Ads)' },
]

export default function NewAvatarPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Check auth on mount — redirect to login if not signed in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login?next=/creator/avatars/new')
      } else {
        setAuthChecked(true)
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [dragging, setDragging] = useState(false)

  // Form data
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('language_coaching')
  const [personality, setPersonality] = useState('')
  const [tagline, setTagline] = useState('')

  // Image source
  const [imageMode, setImageMode] = useState<'upload' | 'generate'>('upload')
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [appearance, setAppearance] = useState('Young Japanese woman in her late 20s, long dark hair, warm genuine smile, wearing a cream knit sweater. Mid-chest portrait shot on iPhone 15 Pro, f/1.8 aperture. Outdoors in a park during golden hour, soft warm backlight with gentle bokeh from trees behind. Skin has natural texture and pores, no retouching. Shallow depth of field, eye-level angle, relaxed confident posture.')
  const [selectedModel, setSelectedModel] = useState('juggernaut-pro-flux')
  const [candidates, setCandidates] = useState<string[]>([])
  const [selectedAnchor, setSelectedAnchor] = useState<number>(-1)

  // Scenes
  const [scenePrompts, setScenePrompts] = useState<SceneTemplate[]>([])
  const [sceneImages, setSceneImages] = useState<string[]>([])
  const [editingSceneIdx, setEditingSceneIdx] = useState<number | null>(null)

  // Social & Caption
  const [captions, setCaptions] = useState<{ caption: string; length: string }[]>([])
  const [selectedCaption, setSelectedCaption] = useState(0)
  const [customCaption, setCustomCaption] = useState('')
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null)
  const [blotatoKey, setBlotatoKey] = useState('')

  // ElevenLabs
  const [elevenLabsKey, setElevenLabsKey] = useState('')
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState('')

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const preset = getDomainPreset(domain)

  // Tab to accept placeholder, Enter to advance
  const handleInputKeys = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    placeholderValue: string,
    setter: (v: string) => void,
    onEnter?: () => void,
  ) => {
    if (e.key === 'Tab' && !(e.target as HTMLInputElement).value) {
      e.preventDefault()
      setter(placeholderValue)
    }
    if (e.key === 'Enter' && !e.shiftKey && onEnter) {
      e.preventDefault()
      onEnter()
    }
  }

  useEffect(() => {
    setScenePrompts(getScenesForDomain(domain))
  }, [domain])

  const updateScenePrompt = (idx: number, newPrompt: string) => {
    setScenePrompts(prev => prev.map((s, i) => i === idx ? { ...s, prompt: newPrompt } : s))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const [enhancing, setEnhancing] = useState(false)
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null)

  const processFile = async (file: File) => {
    const MAX_SIZE = 20 * 1024 * 1024 // 20 MB
    if (file.size > MAX_SIZE) {
      setErrorMsg(`File is ${(file.size / 1024 / 1024).toFixed(1)} MB — max is 20 MB. Try a smaller image.`)
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onload = () => setUploadPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload
    setLoading(true)
    setErrorMsg(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/avatars/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Upload failed')
        setUploadPreview(null)
        setLoading(false)
        return
      }
      setUploadedUrl(data.url)

      // TODO: Re-enable enhancement when we have a reliable face-preserving model
      // For now, use the original upload directly as the anchor
    } catch (e) {
      setErrorMsg(`Upload failed — ${e instanceof Error ? e.message : 'check your connection'}`)
      setUploadPreview(null)
    }
    setLoading(false)
  }

  const generateCandidates = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/avatars/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appearance, domain, name, model: selectedModel }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Image generation failed.')
        setLoading(false)
        return
      }
      if (data.candidates) {
        setCandidates(data.candidates)
        setStep(4)
      }
    } catch {
      setErrorMsg('Network error — check your connection.')
    }
    setLoading(false)
  }

  const generateScenes = async () => {
    setLoading(true)
    setErrorMsg(null)
    const anchorUrl = imageMode === 'upload' ? uploadedUrl : candidates[selectedAnchor]
    try {
      const res = await fetch('/api/avatars/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anchorUrl,
          domain,
          name,
          generateScenes: true,
          customScenePrompts: scenePrompts,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Scene generation failed.')
        setLoading(false)
        return
      }
      if (data.scenes) {
        setSceneImages(data.scenes)
        setStep(7)
      }
    } catch {
      setErrorMsg('Scene generation failed — please try again.')
    }
    setLoading(false)
  }

  const generateCaptions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/avatars/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, domain, personality, tagline }),
      })
      const data = await res.json()
      if (data.captions) {
        setCaptions(data.captions)
        setCustomCaption(data.captions[0]?.caption || '')
      }
    } catch {
      // Non-blocking — creator can write their own
    }
    setLoading(false)
  }

  // Clear errors on step change
  useEffect(() => {
    setErrorMsg(null)
  }, [step])

  // When entering step 7 (review scenes), auto-generate captions
  useEffect(() => {
    if (step === 7 && captions.length === 0) {
      generateCaptions()
    }
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  const anchorImageUrl = imageMode === 'upload' ? uploadedUrl : candidates[selectedAnchor] || null

  const publish = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setErrorMsg('You must be logged in.')
        setLoading(false)
        return
      }

      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`

      const socialLinks: Record<string, unknown> = {}
      if (blotatoKey) socialLinks.blotato_api_key = blotatoKey

      const { data: avatar, error } = await supabase.from('avatars').insert({
        creator_id: user.id,
        name,
        slug,
        domain,
        personality_traits: personality || preset.defaultPersonality,
        tagline: tagline || `${preset.label} on LoLA`,
        appearance_description: appearance || null,
        anchor_image_url: anchorImageUrl,
        scene_images: sceneImages,
        voice_id: preset.defaultVoice,
        conversation_mode: preset.conversationMode,
        social_links: socialLinks,
        is_published: true,
      }).select('id, slug').single()

      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }

      // Trigger social publish via n8n (non-blocking)
      try {
        await fetch('/api/avatars/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            avatarId: avatar?.id,
            caption: customCaption,
          }),
        })
      } catch {}

      // Go to post-publish screen
      router.push(`/creator/avatars/${avatar?.id}/published`)
    } catch {
      setErrorMsg('Publish failed — check your connection.')
    }
    setLoading(false)
  }

  const totalSteps = imageMode === 'upload' ? 8 : 8
  const displaySteps = imageMode === 'upload'
    ? [1, 2, 3, 5, 6, 7, 8] // skip step 4 (pick anchor)
    : [1, 2, 3, 4, 5, 6, 7, 8]

  const nextAfterImage = () => {
    if (imageMode === 'upload') {
      setStep(5) // skip anchor pick, go to scenes
    } else {
      // go to generate
      generateCandidates()
    }
  }

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {displaySteps.map(s => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-colors ${
              s <= step ? 'bg-indigo-500' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Error toast */}
      {errorMsg && (
        <div className="glass no-trace border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-300">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-muted hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Step 1: Name + Domain */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">What&apos;s your avatar&apos;s name?</h2>
          <HelpTip>Pick a name that feels like a real person. This is what users will see on social media and in conversations.</HelpTip>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) setStep(2) }}
            placeholder="e.g., Sakura Sensei"
            className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />

          <h3 className="text-lg font-semibold mt-6">What do they do?</h3>
          <HelpTip>This sets the default conversation style, scene types, and personality suggestions.</HelpTip>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(DOMAIN_PRESETS).map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setDomain(p.id)
                  if (!name.trim()) {
                    setErrorMsg('Give your avatar a name first')
                    return
                  }
                  setErrorMsg(null)
                }}
                className={`p-3 rounded-xl text-sm text-left transition-all ${
                  domain === p.id
                    ? 'gradient-btn font-medium'
                    : 'glass hover:bg-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (!name.trim()) {
                setErrorMsg('Give your avatar a name first')
                return
              }
              setStep(2)
            }}
            className="w-full py-3 rounded-xl gradient-btn font-medium"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Personality + Tagline */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Describe their personality</h2>
          <HelpTip>Pick up to 3 traits, or type your own. These shape how your avatar sounds in conversations.</HelpTip>
          <input
            value={personality}
            onChange={e => setPersonality(e.target.value)}
            onKeyDown={e => handleInputKeys(e, preset.defaultPersonality, setPersonality)}
            placeholder={preset.defaultPersonality}
            className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          {preset.suggestedPersonalities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {preset.suggestedPersonalities.map(s => {
                const traits = personality.split(',').map(t => t.trim()).filter(Boolean)
                const isSelected = traits.includes(s)
                const toggleTrait = () => {
                  if (isSelected) {
                    setPersonality(traits.filter(t => t !== s).join(', '))
                  } else if (traits.length < 3) {
                    setPersonality([...traits, s].join(', '))
                  }
                }
                return (
                  <button
                    key={s}
                    onClick={toggleTrait}
                    className={`text-xs px-3 py-1 rounded-full transition-all ${
                      isSelected
                        ? 'gradient-btn font-medium'
                        : traits.length >= 3
                          ? 'glass opacity-40 cursor-not-allowed'
                          : 'glass hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
              {personality && (
                <span className="text-[10px] text-muted self-center">
                  {personality.split(',').filter(t => t.trim()).length}/3
                </span>
              )}
            </div>
          )}

          <h3 className="text-lg font-semibold mt-4">Tagline</h3>
          <HelpTip>A short bio line for their profile page and social posts. Tab to accept the suggestion.</HelpTip>
          {(() => {
            const traits = (personality || preset.defaultPersonality || 'versatile').split(',').map(t => t.trim()).filter(Boolean)
            const t0 = traits[0] || 'versatile'
            const domainTaglines: Record<string, string> = {
              language_coaching: `${t0.charAt(0).toUpperCase() + t0.slice(1)} language coaching with ${name}. Speak freely, grow faster.`,
              fitness: `Train with ${name} — ${t0}, adaptive, and always in your corner.`,
              sales: `${name} helps you find exactly what you need. ${t0.charAt(0).toUpperCase() + t0.slice(1)}, personal, effective.`,
              mentoring: `Strategic guidance from ${name}. ${t0.charAt(0).toUpperCase() + t0.slice(1)} mentorship, real conversations.`,
              support: `${name} is here to help — ${t0}, responsive, and always available.`,
              custom: `Meet ${name}. ${t0.charAt(0).toUpperCase() + t0.slice(1)}, multilingual, and ready to talk.`,
            }
            const suggestedTagline = name
              ? domainTaglines[domain] || `Meet ${name} — your ${t0} AI avatar.`
              : `Your personal ${preset.label.toLowerCase()}`
            return (
              <input
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                onKeyDown={e => handleInputKeys(e, suggestedTagline, setTagline, () => setStep(3))}
                placeholder={suggestedTagline}
                className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            )
          })()}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors">
              Back
            </button>
            <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl gradient-btn font-medium">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Your Look — Upload or Generate */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Your avatar&apos;s look</h2>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setImageMode('upload')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                imageMode === 'upload' ? 'gradient-btn' : 'glass hover:bg-white/10'
              }`}
            >
              Upload a Photo
            </button>
            <button
              onClick={() => setImageMode('generate')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                imageMode === 'generate' ? 'gradient-btn' : 'glass hover:bg-white/10'
              }`}
            >
              Generate with AI
            </button>
          </div>

          {imageMode === 'upload' ? (
            <div className="space-y-4">
              <HelpTip>Upload a photo of yourself or any character. This becomes the anchor — all future images keep this face.</HelpTip>

              {uploadPreview ? (
                <div className="space-y-3">
                  <div className="relative w-full">
                    <img src={uploadPreview} alt="Anchor photo" className="w-full rounded-xl aspect-square object-cover" />
                    <button
                      onClick={() => { setUploadPreview(null); setUploadedUrl(null); setEnhancedPreview(null) }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <HelpTip>This photo will be used as the anchor for all scene generation.</HelpTip>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragEnter={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`w-full py-12 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center gap-2 ${
                    dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-glass-border hover:border-indigo-500/50'
                  }`}
                >
                  <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <span className="text-sm text-muted">{dragging ? 'Drop it here' : 'Drop a photo or click to browse'}</span>
                  <span className="text-xs text-muted/50">JPG, PNG, or WebP — max 20 MB</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <HelpTip>Describe a real person as if describing a photo: age, ethnicity, hair, clothing, shot type (mid-chest, headshot), camera (iPhone, DSLR), lighting (golden hour, overcast), background (park, cafe, street). The more specific, the more photorealistic. Tab to accept the default, then swap gender/race/features.</HelpTip>
              <textarea
                value={appearance}
                onChange={e => setAppearance(e.target.value)}
                placeholder="e.g., Young Japanese woman in her late 20s, long dark hair, warm smile, cream knit sweater. Mid-chest portrait on iPhone 15 Pro, golden hour, park background with soft bokeh..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />

              <div>
                <label className="text-xs font-medium text-muted block mb-2">AI Model</label>
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                >
                  {IMAGE_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors">
              Back
            </button>
            <button
              onClick={nextAfterImage}
              disabled={loading || (imageMode === 'upload' ? !uploadedUrl : !appearance.trim())}
              className="flex-1 py-3 rounded-xl gradient-btn font-medium disabled:opacity-50"
            >
              {loading ? 'Processing...' : imageMode === 'upload' ? 'Next' : 'Generate 4 Options'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pick anchor (AI generate only) */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Pick your avatar</h2>
          <HelpTip>This becomes the anchor photo — all future images keep this exact face.</HelpTip>
          <div className="grid grid-cols-2 gap-3">
            {candidates.map((url, i) => (
              <button
                key={i}
                onClick={() => setSelectedAnchor(i)}
                className={`rounded-xl overflow-hidden border-2 transition-all ${
                  selectedAnchor === i ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-transparent'
                }`}
              >
                <img src={url} alt={`Candidate ${i + 1}`} className="w-full aspect-square object-cover" />
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors">
              Regenerate
            </button>
            <button
              onClick={() => setStep(5)}
              disabled={selectedAnchor < 0}
              className="flex-1 py-3 rounded-xl gradient-btn font-medium disabled:opacity-50"
            >
              Use This
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Scene prompts */}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Plan your content scenes</h2>
          <HelpTip>Lifestyle photos for your avatar&apos;s profile and social media. Edit to match your brand.</HelpTip>

          <div className="space-y-3">
            {scenePrompts.map((scene, i) => (
              <div key={i} className="glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-indigo-300">{scene.label}</span>
                  <button
                    onClick={() => setEditingSceneIdx(editingSceneIdx === i ? null : i)}
                    className="text-xs text-muted hover:text-foreground transition-colors"
                  >
                    {editingSceneIdx === i ? 'Done' : 'Edit'}
                  </button>
                </div>
                {editingSceneIdx === i ? (
                  <textarea
                    value={scene.prompt}
                    onChange={e => updateScenePrompt(i, e.target.value)}
                    rows={3}
                    className="w-full text-sm px-3 py-2 rounded-lg bg-background border border-glass-border focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
                  />
                ) : (
                  <p className="text-xs text-muted line-clamp-2">{scene.prompt}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(imageMode === 'upload' ? 3 : 4)} className="flex-1 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors">
              Back
            </button>
            <button
              onClick={generateScenes}
              disabled={loading}
              className="flex-1 py-3 rounded-xl gradient-btn font-medium disabled:opacity-50"
            >
              {loading ? 'Generating scenes...' : `Generate ${scenePrompts.length} Scenes`}
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Skip (reserved) — scenes go to step 7 now */}

      {/* Step 7: Review scenes + Caption + Social */}
      {step === 7 && (
        <div className="space-y-6">
          {/* Scene review */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Your avatar&apos;s content</h2>
            <p className="text-xs text-muted">Tap a scene to use it in your post.</p>
            <div className="grid grid-cols-3 gap-2">
              {sceneImages.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setPostImageUrl(url)}
                  className={`rounded-xl overflow-hidden relative group cursor-pointer ring-2 transition-all ${
                    postImageUrl === url ? 'ring-indigo-500 scale-[1.02]' : 'ring-transparent'
                  }`}
                >
                  <img src={url} alt={`Scene ${i + 1}`} className="w-full aspect-[3/4] object-cover object-top" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-white">{scenePrompts[i]?.label}</span>
                  </div>
                  {postImageUrl === url && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Social post preview */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Social post preview</h3>
            <HelpTip>AI-generated caption for your first post. Edit it or pick a different version.</HelpTip>

            {captions.length > 0 && (
              <div className="flex gap-2 mb-2">
                {captions.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedCaption(i); setCustomCaption(c.caption) }}
                    className={`text-xs px-3 py-1 rounded-full transition-all ${
                      selectedCaption === i ? 'gradient-btn' : 'glass hover:bg-white/10'
                    }`}
                  >
                    {c.length}
                  </button>
                ))}
              </div>
            )}

            <textarea
              value={customCaption}
              onChange={e => setCustomCaption(e.target.value)}
              rows={3}
              placeholder="Write your first post caption..."
              className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm"
            />

            <SocialPreviewCard
              avatarName={name}
              avatarImage={postImageUrl || anchorImageUrl}
              caption={customCaption}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(5)} className="flex-1 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors">
              Regenerate Scenes
            </button>
            <button onClick={() => setStep(8)} className="flex-1 py-3 rounded-xl gradient-btn font-medium">
              Next: Connections
            </button>
          </div>
        </div>
      )}

      {/* Step 8: Social Connections + Voice + Publish */}
      {step === 8 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Connect &amp; publish</h2>

          <SocialConnections />

          {/* Publish */}
          <div className="glass rounded-xl p-4 text-left space-y-2">
            <p className="text-xs font-medium text-indigo-300">What happens next:</p>
            <ul className="text-xs text-muted space-y-1">
              <li>1. Your avatar&apos;s profile page goes live instantly</li>
              {blotatoKey
                ? <li>2. Your post auto-publishes to all connected platforms via Blotato</li>
                : <li>2. You&apos;ll get your post image + caption ready to share on Instagram</li>
              }
              <li>3. Anyone who clicks your link can start a voice conversation</li>
              <li>4. You can test it yourself right after</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(7)} className="flex-1 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors">
              Back
            </button>
            <button
              onClick={publish}
              disabled={loading}
              className="flex-1 py-4 rounded-xl gradient-btn text-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Avatar'}
            </button>
          </div>
        </div>
      )}
      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={(e) => { e.stopPropagation(); setLightboxUrl(null) }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxUrl(null) }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors"
          >
            &times;
          </button>
          <img
            src={lightboxUrl}
            alt="Scene preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
