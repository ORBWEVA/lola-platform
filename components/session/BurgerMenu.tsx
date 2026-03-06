'use client'

import { useState } from 'react'

interface Props {
  onEndSession: () => void
  onToggleMute: () => void
  isMuted: boolean
  avatarName: string
  avatarSlug: string
}

export default function BurgerMenu({ onEndSession, onToggleMute, isMuted, avatarName, avatarSlug }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl glass p-2 z-50 shadow-xl">
            <button
              onClick={() => { onToggleMute(); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {isMuted ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6.253v11.494m0 0l-4.707-4.04A1 1 0 006.586 13H4a1 1 0 01-1-1v-4a1 1 0 011-1h2.586a1 1 0 00.707-.293L12 2.26" />
                )}
              </svg>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <a
              href={`/avatar/${avatarSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left"
              onClick={() => setOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About {avatarName}
            </a>
            <button
              onClick={() => { window.open(`mailto:support@orbweva.com?subject=Report: ${encodeURIComponent(avatarName)}`); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left text-muted"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-13m0 0V5a1 1 0 011-1h5.5a1 1 0 01.7.3L11.5 5.5a1 1 0 00.7.3H19a1 1 0 011 1v5a1 1 0 01-1 1h-6.3a1 1 0 00-.7.3L10.7 14.3a1 1 0 01-.7.3H3z" />
              </svg>
              Report
            </button>
            <div className="border-t border-glass-border my-1" />
            <button
              onClick={() => { onEndSession(); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-colors text-left text-red-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
              </svg>
              End Session
            </button>
          </div>
        </>
      )}
    </>
  )
}
