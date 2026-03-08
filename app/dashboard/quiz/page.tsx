'use client'

import { useState } from 'react'

interface Question {
  id: string
  text: string
  options: { label: string; weights: Record<string, number> }[]
}

const QUESTIONS: Question[] = [
  {
    id: 'mistakes',
    text: 'When you make a mistake, how do you prefer to be corrected?',
    options: [
      { label: 'Gently — sandwich it between positives', weights: { positive_framing: 1.4, emotional_state: 1.3, growth_mindset: 1.2 } },
      { label: 'Directly — just tell me what went wrong', weights: { progressive_challenge: 1.3, meta_model: 1.2, positive_framing: 0.7 } },
      { label: 'Let me figure it out myself first', weights: { autonomy_choice: 1.4, metacognition: 1.3, retrieval_practice: 1.2 } },
    ],
  },
  {
    id: 'pace',
    text: 'What pace works best for you?',
    options: [
      { label: 'Step by step — don\'t rush me', weights: { cognitive_load: 1.4, spacing: 1.3, emotional_state: 1.2 } },
      { label: 'Push me — I like a challenge', weights: { progressive_challenge: 1.4, sensory_engagement: 1.2, retrieval_practice: 1.2 } },
      { label: 'Match my energy — sometimes fast, sometimes slow', weights: { emotional_state: 1.4, autonomy_choice: 1.3, rapport_anchoring: 1.2 } },
    ],
  },
  {
    id: 'motivation',
    text: 'What keeps you coming back?',
    options: [
      { label: 'Seeing measurable progress', weights: { progressive_challenge: 1.3, retrieval_practice: 1.3, metacognition: 1.2 } },
      { label: 'Having fun and enjoying the process', weights: { sensory_engagement: 1.4, rapport_anchoring: 1.3, positive_framing: 1.2 } },
      { label: 'Feeling understood and supported', weights: { rapport_anchoring: 1.4, emotional_state: 1.3, growth_mindset: 1.2 } },
    ],
  },
  {
    id: 'learning',
    text: 'How do you learn best?',
    options: [
      { label: 'By doing — throw me in the deep end', weights: { retrieval_practice: 1.4, sensory_engagement: 1.3, progressive_challenge: 1.2 } },
      { label: 'By understanding the "why" first', weights: { meta_model: 1.4, metacognition: 1.3, cognitive_load: 1.2 } },
      { label: 'Through conversation and examples', weights: { rapport_anchoring: 1.3, sensory_engagement: 1.3, spacing: 1.2 } },
    ],
  },
  {
    id: 'depth',
    text: 'How deep do you want to go?',
    options: [
      { label: 'Keep it practical — just what I need', weights: { cognitive_load: 1.3, positive_framing: 1.2, autonomy_choice: 1.1 } },
      { label: 'Go deep — I want to really understand', weights: { meta_model: 1.3, metacognition: 1.4, spacing: 1.3 } },
      { label: 'Mix it up depending on the topic', weights: { autonomy_choice: 1.3, emotional_state: 1.2, progressive_challenge: 1.1 } },
    ],
  },
]

export default function QuizPage() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>[]>([])

  const question = QUESTIONS[current]
  const isLast = current === QUESTIONS.length - 1

  const handleSelect = (weights: Record<string, number>) => {
    const newAnswers = [...answers, weights]

    if (!isLast) {
      setAnswers(newAnswers)
      setCurrent(current + 1)
      return
    }

    // Merge all weights — multiply per principle
    const merged: Record<string, number> = {}
    for (const w of newAnswers) {
      for (const [key, val] of Object.entries(w)) {
        merged[key] = (merged[key] ?? 1.0) * val
      }
    }

    // Fire and forget — don't block UI
    fetch('/api/profile/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weights: merged }),
    }).catch(() => {})

    // Hard redirect immediately
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen monochrome flex items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-8">
        {/* Progress */}
        <div className="flex gap-1.5">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= current ? 'bg-indigo-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Question */}
        <div className="space-y-2">
          <p className="text-xs text-muted uppercase tracking-wider">
            Question {current + 1} of {QUESTIONS.length}
          </p>
          <h1 className="text-xl font-semibold">{question.text}</h1>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(option.weights)}
              className="w-full text-left glass rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
