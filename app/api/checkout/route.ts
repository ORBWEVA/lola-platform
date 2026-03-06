import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
  return new Stripe(key, { apiVersion: '2026-02-25.clover' })
}

const CREDIT_PACKS = {
  starter: { credits: 30, price: 499, name: '30 Credits' },
  popular: { credits: 100, price: 1299, name: '100 Credits' },
  pro: { credits: 300, price: 2999, name: '300 Credits' },
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const url = new URL(request.url)
  const packId = url.searchParams.get('pack') as keyof typeof CREDIT_PACKS
  const pack = CREDIT_PACKS[packId] || CREDIT_PACKS.starter

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: { supabase_id: user.id },
    })
    customerId = customer.id
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: pack.price,
        product_data: { name: `LoLA ${pack.name}` },
      },
      quantity: 1,
    }],
    metadata: {
      supabase_id: user.id,
      credits: pack.credits.toString(),
    },
    success_url: `${url.origin}/dashboard?purchased=${pack.credits}`,
    cancel_url: `${url.origin}/dashboard`,
  })

  return NextResponse.redirect(session.url!)
}
