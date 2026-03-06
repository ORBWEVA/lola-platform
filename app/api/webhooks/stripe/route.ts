import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
  return new Stripe(key, { apiVersion: '2026-02-25.clover' })
}

// Use service role for webhook (no user context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.supabase_id
    const credits = parseInt(session.metadata?.credits || '0', 10)

    if (userId && credits > 0) {
      // Add credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      await supabase
        .from('profiles')
        .update({ credits: (profile?.credits || 0) + credits })
        .eq('id', userId)

      // Record purchase
      await supabase.from('credit_purchases').insert({
        user_id: userId,
        stripe_payment_intent: session.payment_intent as string,
        credits_added: credits,
        amount_cents: session.amount_total || 0,
      })
    }
  }

  return NextResponse.json({ received: true })
}
