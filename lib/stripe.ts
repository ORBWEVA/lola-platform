import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  _stripe = new Stripe(key, { apiVersion: '2026-02-25.clover' })
  return _stripe
}

export const CREDIT_PACKS = {
  starter: { credits: 30, price: 499, name: '30 Credits' },
  popular: { credits: 100, price: 1299, name: '100 Credits' },
  pro: { credits: 300, price: 2999, name: '300 Credits' },
} as const

export type CreditPackId = keyof typeof CREDIT_PACKS

export const CREATOR_PLANS = {
  creator: {
    name: 'Creator',
    priceId: 'price_1T9IPXP8nydEgWv7jKoAb29z',
    price: 2900,
    avatarLimit: 5,
    features: ['5 avatars', 'Unlimited sessions', 'Social publishing', 'Custom branding', 'Priority support'],
  },
  pro: {
    name: 'Pro',
    priceId: 'price_1T9IPYP8nydEgWv7gu5ym8aS',
    price: 9900,
    avatarLimit: -1, // unlimited
    features: ['Unlimited avatars', 'API access', 'White-label', 'Team accounts', 'Advanced analytics'],
  },
} as const

export type CreatorPlanId = keyof typeof CREATOR_PLANS
