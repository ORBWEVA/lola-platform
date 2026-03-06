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
