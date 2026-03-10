'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function BuyCreditsButton({
  pack,
  credits,
  price,
  label,
}: {
  pack: string
  credits: number
  price: string
  label?: string
}) {
  const [loading, setLoading] = useState(false)
  const t = useTranslations('common')

  const handleBuy = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout error:', data.error)
        setLoading(false)
      }
    } catch {
      console.error('Failed to start checkout')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="glass rounded-xl p-4 text-center transition-colors disabled:opacity-50 relative"
    >
      {label && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-black px-2 py-0.5 rounded-full">
          {label}
        </span>
      )}
      <p className="text-2xl font-bold">{credits}</p>
      <p className="text-sm text-muted">{t('credits')}</p>
      <p className="text-sm font-medium mt-1">{price}</p>
      {loading && <p className="text-xs text-muted mt-1">{t('loading')}</p>}
    </button>
  )
}
