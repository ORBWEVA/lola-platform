import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, CREDIT_PACKS, type CreditPackId } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const packId = (body.pack || 'starter') as CreditPackId
    const pack = CREDIT_PACKS[packId] || CREDIT_PACKS.starter

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
        pack_id: packId,
      },
      success_url: `${origin}/dashboard?purchased=${pack.credits}`,
      cancel_url: `${origin}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    const message = err instanceof Error ? err.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
