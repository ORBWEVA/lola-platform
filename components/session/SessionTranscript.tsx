'use client'

import { useEffect, useRef } from 'react'

export interface TranscriptEntry {
  role: 'user' | 'model' | 'system'
  content: string
}

interface Props {
  entries: TranscriptEntry[]
  avatarName: string
}

export default function SessionTranscript({ entries, avatarName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef(true)

  useEffect(() => {
    if (autoScrollRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [entries])

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 60
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin"
    >
      {entries.length === 0 && (
        <p className="text-center text-muted text-sm mt-4">
          Conversation will appear here...
        </p>
      )}
      {entries.map((entry, i) => (
        <div
          key={i}
          className={`flex ${
            entry.role === 'system' ? 'justify-center' :
            entry.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {entry.role === 'system' ? (
            <div className="max-w-[90%] px-3 py-1.5 text-xs text-muted italic text-center">
              {entry.content}
            </div>
          ) : (
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                entry.role === 'user'
                  ? 'bg-indigo-600/30 text-indigo-100 rounded-br-md'
                  : 'glass rounded-bl-md'
              }`}
            >
              <span className="text-xs text-muted block mb-0.5">
                {entry.role === 'user' ? 'You' : avatarName}
              </span>
              {entry.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
