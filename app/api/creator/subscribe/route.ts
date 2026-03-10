import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, CREATOR_PLANS, type CreatorPlanId } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const planId = body.plan as CreatorPlanId
    const plan = CREATOR_PLANS[planId]

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const stripe = getStripe()

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_id: user.id },
      })
      customerId = customer.id
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const origin = new URL(request.url).origin

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.priceId, quantity: 1 }],
      metadata: {
        supabase_id: user.id,
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          supabase_id: user.id,
          plan_id: planId,
        },
      },
      success_url: `${origin}/creator/billing?subscribed=${planId}`,
      cancel_url: `${origin}/creator/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Subscribe error:', err)
    const message = err instanceof Error ? err.message : 'Subscription failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
