import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role env vars not configured')
  return createClient(url, key)
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.supabase_id
    const credits = parseInt(session.metadata?.credits || '0', 10)

    // Credit pack purchase
    if (userId && credits > 0) {
      const { error: rpcError } = await supabase.rpc('add_credits', {
        p_user_id: userId,
        p_credits: credits,
      })

      if (rpcError) {
        console.error('RPC add_credits failed, using fallback:', rpcError.message)
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single()

        await supabase
          .from('profiles')
          .update({ credits: (profile?.credits || 0) + credits })
          .eq('id', userId)
      }

      await supabase.from('credit_purchases').insert({
        user_id: userId,
        stripe_payment_intent: session.payment_intent as string,
        credits_added: credits,
        amount_cents: session.amount_total || 0,
      })
    }

    // Subscription checkout — record the subscription
    const planId = session.metadata?.plan_id
    if (userId && planId && session.subscription) {
      await supabase
        .from('creator_subscriptions')
        .upsert({
          creator_id: userId,
          tier: planId,
          stripe_subscription_id: session.subscription as string,
          status: 'active',
          current_period_end: null, // will be set by subscription.updated event
        }, { onConflict: 'creator_id' })

      // Upgrade role to creator
      await supabase
        .from('profiles')
        .update({ role: 'creator' })
        .eq('id', userId)
    }
  }

  // Subscription lifecycle events
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.supabase_id
    const planId = subscription.metadata?.plan_id

    if (userId) {
      await supabase
        .from('creator_subscriptions')
        .upsert({
          creator_id: userId,
          tier: planId || 'creator',
          stripe_subscription_id: subscription.id,
          status: subscription.status === 'active' ? 'active' : subscription.status,
          current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        }, { onConflict: 'creator_id' })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.supabase_id

    if (userId) {
      await supabase
        .from('creator_subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)

      // Downgrade role back to learner
      await supabase
        .from('profiles')
        .update({ role: 'learner' })
        .eq('id', userId)
    }
  }

  return NextResponse.json({ received: true })
}
