'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

function CallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'

  useEffect(() => {
    const supabase = createClient()

    const handleCallback = async () => {
      // Exchange code for session (handles both OAuth and magic link)
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        router.push('/login')
        return
      }

      // Ensure profile has LoLA fields set
      const displayName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
      await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          display_name: displayName,
          role: 'learner',
          credits: 15,
        }, { onConflict: 'id', ignoreDuplicates: false })

      router.push(next)
    }

    handleCallback()
  }, [router, next])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted">Setting up your account...</p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <CallbackInner />
    </Suspense>
  )
}
