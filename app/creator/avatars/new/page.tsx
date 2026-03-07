'use client'

import { createClient } from '@/lib/supabase/client'
import { DOMAIN_PRESETS, getDomainPreset, getScenesForDomain, type SceneTemplate } from '@/lib/coaching/domains'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

function HelpTip({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted/70 mt-1.5 leading-relaxed">{children}</p>
  )
}

export default function NewAvatarPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form data
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('language_coaching')
  const [personality, setPersonality] = useState('')
  const [tagline, setTagline] = useState('')
  const [appearance, setAppearance] = useState('')
  const [candidates, setCandidates] = useState<string[]>([])
  const [selectedAnchor, setSelectedAnchor] = useState<number>(-1)
  const [scenePrompts, setScenePrompts] = useState<SceneTemplate[]>([])
  const [sceneImages, setSceneImages] = useState<string[]>([])
  const [editingSceneIdx, setEditingSceneIdx] = useState<number | null>(null)

  const preset = getDomainPreset(domain)

  // Load scene templates when domain changes
  useEffect(() => {
    setScenePrompts(getScenesForDomain(domain))
  }, [domain])

  const updateScenePrompt = (idx: number, newPrompt: string) => {
    setScenePrompts(prev => prev.map((s, i) => i === idx ? { ...s, prompt: newPrompt } : s))
  }

  const generateCandidates = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/avatars/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appearance, domain, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Image generation failed. Please try again.')
        setLoading(false)
        return
      }
      if (data.candidates) {
        setCandidates(data.candidates)
        setStep(4)
      }
    } catch (e) {
      setErrorMsg('Network error — check your connection and try again.')
      console.error('Generation failed:', e)
    }
    setLoading(false)
  }

  const generateScenes = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/avatars/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anchorUrl: candidates[selectedAnchor],
          domain,
          name,
          generateScenes: true,
          customScenePrompts: scenePrompts,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Scene generation failed. Please try again.')
        setLoading(false)
        return
      }
      if (data.scenes) {
        setSceneImages(data.scenes)
        setStep(6)
      }
    } catch (e) {
      setErrorMsg('Network error — check your connection and try again.')
      console.error('Scene generation failed:', e)
    }
    setLoading(false)
  }

  const publish = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setErrorMsg('You must be logged in to publish. Please sign in and try again.')
        setLoading(false)
        return
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      const { data: avatar, error } = await supabase.from('avatars').insert({
        creator_id: user.id,
        name,
        slug,
        domain,
        personality_traits: personality || preset.defaultPersonality,
        tagline: tagline || `${preset.label} on LoLA`,
        appearance_description: appearance,
        anchor_image_url: candidates[selectedAnchor] || null,
        scene_images: sceneImages,
        voice_id: 'shimmer',
        conversation_mode: preset.conversationMode,
        is_published: true,
      }).select('id, slug').single()

      if (error) {
        setErrorMsg(error.message || 'Failed to save avatar. Please try again.')
        console.error('Insert error:', error)
        setLoading(false)
        return
      }

      // Trigger social publish via n8n (non-blocking)
      try {
        await fetch('/api/avatars/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarId: avatar?.id }),
        })
      } catch {}

      router.push(`/avatar/${avatar?.slug}`)
    } catch (e) {
      setErrorMsg('Publish failed — check your connection and try again.')
      console.error('Publish failed:', e)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map(s => (
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
            placeholder="e.g., Sakura Sensei"
            className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />

          <h3 className="text-lg font-semibold mt-6">What do they do?</h3>
          <HelpTip>This sets the default conversation style, scene types, and personality suggestions. You can customize everything later.</HelpTip>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(DOMAIN_PRESETS).map(p => (
              <button
                key={p.id}
                onClick={() => setDomain(p.id)}
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
            onClick={() => setStep(2)}
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl gradient-btn font-medium disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Personality + Tagline */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Describe their personality</h2>
          <HelpTip>How should your avatar sound in conversations? This shapes their tone, humor, and coaching style. Keep it natural — a few words is enough.</HelpTip>
          <input
            value={personality}
            onChange={e => setPersonality(e.target.value)}
            placeholder={preset.defaultPersonality}
            className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          {preset.suggestedPersonalities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {preset.suggestedPersonalities.map(s => (
                <button
                  key={s}
                  onClick={() => setPersonality(s)}
                  className="text-xs px-3 py-1 rounded-full glass hover:bg-white/10 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <h3 className="text-lg font-semibold mt-4">Tagline</h3>
          <HelpTip>A short bio line shown on their profile page and social posts. Think Instagram bio — punchy and clear.</HelpTip>
          <input
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder={`e.g., Your personal ${preset.label.toLowerCase()}`}
            className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />

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

      {/* Step 3: Appearance */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">What should they look like?</h2>
          <HelpTip>Describe a real person, not a character. Include age range, ethnicity, hair, clothing style, and vibe. The more specific, the more realistic the result. Think &quot;someone you&apos;d follow on Instagram.&quot;</HelpTip>
          <textarea
            value={appearance}
            onChange={e => setAppearance(e.target.value)}
            placeholder="e.g., Young Japanese woman in her late 20s, long dark hair, warm smile, casual-chic outfit, natural makeup, confident and approachable"
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-card border border-glass-border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
          />

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors">
              Back
            </button>
            <button
              onClick={generateCandidates}
              disabled={!appearance.trim() || loading}
              className="flex-1 py-3 rounded-xl gradient-btn font-medium disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate 4 Options'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pick anchor */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Pick your avatar</h2>
          <HelpTip>This becomes the &quot;anchor&quot; photo — all future images will keep this exact face and look. Pick the one that feels most real and most like the person you described.</HelpTip>
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

      {/* Step 5: Customize scene prompts BEFORE generating */}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Plan your content scenes</h2>
          <HelpTip>These are the lifestyle photos for your avatar&apos;s profile and social media — like an influencer&apos;s Instagram feed. We&apos;ve suggested scenes based on the domain, but edit them to match your brand. Think: what would a real person in this role post?</HelpTip>

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
            <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors">
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

      {/* Step 6: Review generated scenes */}
      {step === 6 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Your avatar&apos;s content</h2>
          <HelpTip>These images will appear on your avatar&apos;s profile page, in the voice session carousel, and in social media posts. The same person, different real-life moments.</HelpTip>
          <div className="grid grid-cols-3 gap-2">
            {sceneImages.map((url, i) => (
              <div key={i} className="rounded-xl overflow-hidden relative group">
                <img src={url} alt={`Scene ${i + 1}`} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-[10px] text-white">{scenePrompts[i]?.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(5)} className="flex-1 py-3 rounded-xl glass font-medium hover:bg-white/10 transition-colors">
              Edit & Regenerate
            </button>
            <button onClick={() => setStep(7)} className="flex-1 py-3 rounded-xl gradient-btn font-medium">
              Approve
            </button>
          </div>
        </div>
      )}

      {/* Step 7: Publish */}
      {step === 7 && (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-full gradient-btn flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">{name} is ready!</h2>
          <p className="text-sm text-muted">
            Publishing creates a public profile page and triggers a social media post. Your avatar is multilingual and will adapt to each person it talks to.
          </p>

          <div className="glass rounded-xl p-4 text-left space-y-2">
            <p className="text-xs font-medium text-indigo-300">What happens next:</p>
            <ul className="text-xs text-muted space-y-1">
              <li>1. A link-in-bio profile page goes live instantly</li>
              <li>2. A social media post is created with your avatar&apos;s image</li>
              <li>3. Anyone who clicks can start a voice conversation</li>
              <li>4. Your avatar adapts to each person using 12 coaching principles</li>
            </ul>
          </div>

          <button
            onClick={publish}
            disabled={loading}
            className="w-full py-4 rounded-xl gradient-btn text-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      )}
    </div>
  )
}
