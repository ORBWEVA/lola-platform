'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

export interface SubtitleWord {
  word: string
  start: number
  end: number
}

export interface SubtitleData {
  duration: number
  words: SubtitleWord[]
}

export function useVideoSubtitles(
  videoRef: React.RefObject<HTMLVideoElement | null> | undefined,
  subtitlesUrlOrData: string | SubtitleData | undefined
) {
  const [data, setData] = useState<SubtitleData | null>(null)
  const [visibleCount, setVisibleCount] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [energy, setEnergy] = useState(0)
  const [loopCount, setLoopCount] = useState(0)
  const animRef = useRef<number>(0)
  const prevTimeRef = useRef<number>(0)

  // Load subtitle data — reset state on change
  useEffect(() => {
    setVisibleCount(0)
    setSpeaking(false)
    setEnergy(0)
    setLoopCount(0)
    prevTimeRef.current = 0
    if (!subtitlesUrlOrData) { setData(null); return }
    // If data object passed directly, use it
    if (typeof subtitlesUrlOrData === 'object') {
      setData(subtitlesUrlOrData)
      return
    }
    fetch(subtitlesUrlOrData)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [subtitlesUrlOrData])

  // Sync to video.currentTime
  const sync = useCallback(() => {
    const video = videoRef?.current
    if (!video || !data) {
      animRef.current = requestAnimationFrame(sync)
      return
    }

    const t = video.currentTime

    // Detect loop (time jumps backwards)
    if (t < prevTimeRef.current - 0.5) {
      setLoopCount(c => c + 1)
    }
    prevTimeRef.current = t

    // Count visible words
    let count = 0
    let isSpeaking = false
    let currentEnergy = 0

    for (let i = 0; i < data.words.length; i++) {
      const w = data.words[i]
      if (t >= w.start) count = i + 1
      if (t >= w.start && t <= w.end) {
        isSpeaking = true
        // Energy peaks in middle of word, tapers at edges
        const wordMid = (w.start + w.end) / 2
        const wordHalf = (w.end - w.start) / 2
        const dist = Math.abs(t - wordMid) / wordHalf
        currentEnergy = Math.max(currentEnergy, 1 - dist * 0.4)
      }
    }

    // Smooth gap energy: if between words, check proximity to nearest word
    if (!isSpeaking && count > 0 && count < data.words.length) {
      const prev = data.words[count - 1]
      const next = data.words[count]
      if (prev && next) {
        const gap = next.start - prev.end
        if (gap < 0.3) {
          // Short gap between words — keep some energy
          const gapPos = (t - prev.end) / gap
          currentEnergy = 0.3 * (1 - Math.abs(gapPos - 0.5) * 2)
        }
      }
    }

    setVisibleCount(count)
    setSpeaking(isSpeaking)
    setEnergy(currentEnergy)

    animRef.current = requestAnimationFrame(sync)
  }, [videoRef, data])

  useEffect(() => {
    animRef.current = requestAnimationFrame(sync)
    return () => cancelAnimationFrame(animRef.current)
  }, [sync])

  return { data, visibleCount, speaking, energy, loopCount }
}
