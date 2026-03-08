'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { getDomainPreset } from '@/lib/coaching/domains'

interface Avatar {
  id: string
  name: string
  slug: string
  tagline: string | null
  domain: string
  anchor_image_url: string | null
  scene_images: string[]
  session_count: number
  rating: number
  social_links: Record<string, string> | null
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number | null
  currency: string
  checkout_url: string
  image_url: string | null
}

interface Props {
  avatar: Avatar
  products: Product[]
  isLoggedIn: boolean
}

export default function AvatarProfileClient({ avatar, products, isLoggedIn }: Props) {
  const preset = getDomainPreset(avatar.domain)
  const sessionUrl = isLoggedIn ? `/session/${avatar.slug}` : `/login?next=/session/${avatar.slug}`
  const [panelOpen, setPanelOpen] = useState(false)

  const close = useCallback(() => setPanelOpen(false), [])

  useEffect(() => {
    if (!panelOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen, close])

  // Filter out internal keys from social links display
  const displaySocialLinks = avatar.social_links
    ? Object.entries(avatar.social_links).filter(([key]) => !key.includes('api_key') && !key.includes('voice_id'))
    : []

  return (
    <div className="fixed inset-0 monochrome">
      {/* Full-screen anchor image */}
      {avatar.anchor_image_url ? (
        <img
          src={avatar.anchor_image_url}
          alt={avatar.name}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-emerald-900" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <Link
          href="/"
          className="text-xl font-bold text-white/90"
          style={{ fontFamily: 'var(--font-exo2)', fontWeight: 700 }}
        >
          LoLA
        </Link>

        {/* Open panel button */}
        <button
          onClick={() => setPanelOpen(true)}
          className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition-colors"
          aria-label="View details"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>

      {/* Bottom overlay: name + tagline + mic CTA */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 pb-8"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white">{avatar.name}</h1>
        <p className="text-white/60 text-lg mt-1 max-w-md">{avatar.tagline || preset.label}</p>

        {/* Mic CTA — just the icon */}
        <div className="mt-6">
          <Link
            href={sessionUrl}
            className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/25 transition-all hover:scale-110 group"
            aria-label={`Talk to ${avatar.name}`}
          >
            <svg className="w-7 h-7 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Slide panel backdrop */}
      {panelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Slide panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] backdrop-blur-xl border-l border-white/[0.08] transition-transform duration-300 ease-out flex flex-col overflow-y-auto ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'rgba(10, 10, 26, 0.95)' }}
      >
        {/* Close */}
        <div className="flex items-center justify-end p-4">
          <button
            onClick={close}
            className="p-2 text-white/50 hover:text-white transition-colors"
            aria-label="Close panel"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-8 space-y-8">
          {/* Avatar info */}
          <div>
            <h2 className="text-2xl font-bold text-white">{avatar.name}</h2>
            <p className="text-white/50 text-sm mt-1">{avatar.tagline}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-white/50">
              <div className="flex items-center gap-1">
                <span className="text-amber-400">{'★'.repeat(Math.round(avatar.rating))}</span>
                <span className="text-white/70">{avatar.rating}</span>
              </div>
              <span>{avatar.session_count} sessions</span>
            </div>
          </div>

          {/* Talk CTA */}
          <Link
            href={sessionUrl}
            onClick={close}
            className="block w-full py-4 rounded-xl gradient-btn text-center text-lg font-semibold"
          >
            Talk to {avatar.name}
          </Link>

          {/* Gallery — only show images that are valid URLs (not expired API URLs) */}
          {avatar.scene_images?.filter(img => img.startsWith('http') && !img.includes('api.together')).length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">Gallery</h3>
              <div className="grid grid-cols-2 gap-2">
                {avatar.scene_images.filter(img => img.startsWith('http') && !img.includes('api.together')).map((img, i) => (
                  <div key={i} className="rounded-lg overflow-hidden ring-1 ring-white/10">
                    <img
                      src={img}
                      alt={`${avatar.name} scene ${i + 1}`}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                      width={400}
                      height={400}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {products.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">Products</h3>
              <div className="space-y-2">
                {products.map(product => (
                  <a
                    key={product.id}
                    href={product.checkout_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl p-3 bg-white/5 hover:bg-white/10 transition-colors border border-white/[0.08]"
                  >
                    <p className="font-medium text-sm text-white">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-white/40 mt-1 line-clamp-2">{product.description}</p>
                    )}
                    {product.price && (
                      <p className="text-emerald-400 font-semibold text-sm mt-1">
                        {product.currency === 'USD' ? '$' : product.currency}{product.price}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Social links */}
          {displaySocialLinks.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">Connect</h3>
              <div className="flex gap-2">
                {displaySocialLinks.map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={String(url).startsWith('http') ? String(url) : `https://instagram.com/${String(url).replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center hover:bg-white/10 transition-colors text-xs uppercase text-white/50 hover:text-white"
                    >
                      {platform.slice(0, 2)}
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-white/[0.08]">
            <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Powered by <span className="font-semibold">LoLA</span> — Create your own
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
