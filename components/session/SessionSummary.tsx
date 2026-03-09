'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface Props {
  sessionId: string
  avatarName: string
  avatarSlug: string
  duration: number
  creditsUsed: number
  transcriptCount: number
  userRole: string
}

export default function SessionSummary({ sessionId, avatarName, avatarSlug, duration, creditsUsed, transcriptCount, userRole }: Props) {
  const t = useTranslations('summary')
  const RATING_OPTIONS = [
    { value: 1 as const, label: t('notGreat') },
    { value: 3 as const, label: t('okay') },
    { value: 5 as const, label: t('lovedIt') },
  ]

  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60

  const [rating, setRating] = useState<1 | 3 | 5 | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const submitFeedback = async () => {
    if (!rating) return
    setFeedbackLoading(true)
    try {
      await fetch('/api/sessions/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          rating,
          text: feedbackText.trim() || undefined,
        }),
      })
      setFeedbackSent(true)
    } catch {
      // Silently fail — feedback is non-critical
    } finally {
      setFeedbackLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-bold">{t('sessionComplete')}</h2>
          <p className="text-muted mt-1">{t('withAvatar', { name: avatarName })}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-3">
            <p className="text-lg font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</p>
            <p className="text-xs text-muted">{t('duration')}</p>
          </div>
          <div className="glass rounded-2xl p-3">
            <p className="text-lg font-bold">{creditsUsed}</p>
            <p className="text-xs text-muted">{t('creditsUsed')}</p>
          </div>
          <div className="glass rounded-2xl p-3">
            <p className="text-lg font-bold">{transcriptCount}</p>
            <p className="text-xs text-muted">{t('messages')}</p>
          </div>
        </div>

        {!feedbackSent ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">{t('howWasSession')}</p>
            <div className="grid grid-cols-3 gap-3">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRating(opt.value)}
                  className={`glass rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    rating === opt.value
                      ? 'border border-indigo-400 text-white'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {rating !== null && (
              <>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={t('optionalFeedback')}
                  rows={3}
                  className="w-full rounded-xl glass bg-transparent px-4 py-3 text-sm placeholder:text-muted resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <button
                  onClick={submitFeedback}
                  disabled={feedbackLoading}
                  className="w-full px-4 py-3 rounded-xl gradient-btn font-medium disabled:opacity-50"
                >
                  {feedbackLoading ? t('sending') : t('submit')}
                </button>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">{t('thankYou')}</p>
        )}

        <div className="space-y-3 pt-2">
          <Link
            href={`/dashboard/transcripts/${sessionId}`}
            className="block w-full px-4 py-3 rounded-xl gradient-btn text-center font-medium"
          >
            {t('viewTranscript')}
          </Link>
          <Link
            href={`/avatar/${avatarSlug}`}
            className="block w-full px-4 py-3 rounded-xl glass text-center font-medium hover:bg-white/10 transition-colors"
          >
            {t('backTo', { name: avatarName })}
          </Link>
          <Link
            href={userRole === 'creator' ? '/creator' : '/dashboard'}
            className="block text-center text-sm text-muted hover:text-foreground transition-colors"
          >
            {userRole === 'creator' ? t('creatorStudio') : t('myDashboard')}
          </Link>
        </div>
      </div>
    </div>
  )
}
