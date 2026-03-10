'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

const PLANS = [
  {
    id: 'free' as const,
    price: '$0',
    period: 'forever',
    avatarLimit: 1,
    features: ['1 avatar', '50 sessions/mo', 'Basic analytics', 'LoLA branding'],
  },
  {
    id: 'creator' as const,
    price: '$29',
    period: '/mo',
    avatarLimit: 5,
    popular: true,
    features: ['5 avatars', 'Unlimited sessions', 'Social publishing', 'Custom branding', 'Priority support'],
  },
  {
    id: 'pro' as const,
    price: '$99',
    period: '/mo',
    avatarLimit: -1,
    features: ['Unlimited avatars', 'API access', 'White-label', 'Team accounts', 'Advanced analytics'],
  },
]

type PlanId = 'free' | 'creator' | 'pro'

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('creator')
  const [currentTier, setCurrentTier] = useState<PlanId>('free')
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)

  const subscribed = searchParams.get('subscribed')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: sub } = await supabase
        .from('creator_subscriptions')
        .select('tier, status, current_period_end')
        .eq('creator_id', user.id)
        .single()

      if (sub && sub.status === 'active') {
        setCurrentTier(sub.tier as PlanId)
        setSubscriptionStatus(sub.status)
        if (sub.current_period_end) {
          setPeriodEnd(new Date(sub.current_period_end).toLocaleDateString())
        }
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return
    setSubscribing(planId)
    try {
      const res = await fetch('/api/creator/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Subscribe error:', data.error)
        setSubscribing(null)
      }
    } catch {
      console.error('Failed to start subscription')
      setSubscribing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {subscribed && (
        <div className="glass no-trace rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/5">
          <p className="text-emerald-400 font-medium">
            {t('subscribedTo', { plan: subscribed.charAt(0).toUpperCase() + subscribed.slice(1) })}
          </p>
        </div>
      )}

      {subscriptionStatus === 'active' && periodEnd && (
        <div className="glass no-trace rounded-xl p-4">
          <p className="text-sm text-muted">
            {t('currentPlan')}: <span className="text-foreground font-medium">{currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</span>
            {' · '}{t('renewsOn', { date: periodEnd })}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentTier
          const isDowngrade = (currentTier === 'pro' && plan.id !== 'pro') ||
                              (currentTier === 'creator' && plan.id === 'free')

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-5 relative ${
                plan.popular
                  ? 'border-2 border-foreground/20 bg-white/[0.02]'
                  : 'border border-glass-border bg-white/[0.01]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-foreground text-background">
                    {t('mostPopular')}
                  </span>
                </div>
              )}

              <h3 className="text-base font-bold mt-1">{plan.id.charAt(0).toUpperCase() + plan.id.slice(1)}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-xs text-muted">{plan.period}</span>
              </div>

              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-muted flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || isDowngrade || plan.id === 'free' || subscribing === plan.id}
                className={`w-full mt-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  plan.popular && !isCurrent
                    ? 'bg-foreground text-background hover:opacity-90'
                    : 'border border-glass-border hover:bg-white/5'
                }`}
              >
                {isCurrent
                  ? t('currentPlanLabel')
                  : subscribing === plan.id
                    ? t('redirecting')
                    : plan.id === 'free'
                      ? t('freePlanLabel')
                      : t('subscribeTo', { plan: plan.id.charAt(0).toUpperCase() + plan.id.slice(1) })}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
