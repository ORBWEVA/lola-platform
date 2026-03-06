export interface QuizQuestion {
  id: string
  question: string
  options: { label: string; weights: Record<string, number> }[]
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'error_handling',
    question: 'When you make a mistake, what helps most?',
    options: [
      { label: 'Understand why it happened', weights: { growth_mindset: 1.2, metacognition: 1.3 } },
      { label: 'Just move on quickly', weights: { positive_framing: 1.2, cognitive_load: 0.8 } },
      { label: 'Get gentle encouragement', weights: { emotional_state: 1.3, positive_framing: 1.2 } },
      { label: 'Be challenged to try harder', weights: { progressive_challenge: 1.3, growth_mindset: 1.1 } },
    ],
  },
  {
    id: 'learning_style',
    question: 'How do you prefer to learn new things?',
    options: [
      { label: 'By doing and experimenting', weights: { retrieval_practice: 1.3, sensory_engagement: 1.2 } },
      { label: 'Step-by-step instructions', weights: { cognitive_load: 1.3, progressive_challenge: 1.1 } },
      { label: 'Through conversation and questions', weights: { meta_model: 1.3, rapport_anchoring: 1.1 } },
      { label: 'Watching examples first', weights: { sensory_engagement: 1.3, cognitive_load: 1.1 } },
    ],
  },
  {
    id: 'motivation',
    question: 'What motivates you most?',
    options: [
      { label: 'Seeing measurable progress', weights: { progressive_challenge: 1.2, spacing: 1.2 } },
      { label: 'Positive feedback and encouragement', weights: { positive_framing: 1.3, emotional_state: 1.1 } },
      { label: 'Having control over what I do', weights: { autonomy_choice: 1.4, metacognition: 1.1 } },
      { label: 'Real-world application', weights: { sensory_engagement: 1.3, retrieval_practice: 1.2 } },
    ],
  },
  {
    id: 'pace',
    question: 'What pace works best for you?',
    options: [
      { label: 'Fast — I get bored easily', weights: { progressive_challenge: 1.3, cognitive_load: 0.7 } },
      { label: 'Steady — one thing at a time', weights: { cognitive_load: 1.3, spacing: 1.2 } },
      { label: 'Flexible — depends on the topic', weights: { autonomy_choice: 1.2, emotional_state: 1.1 } },
      { label: 'Deep — I want to understand fully', weights: { metacognition: 1.3, meta_model: 1.2 } },
    ],
  },
  {
    id: 'feedback',
    question: 'How direct do you want feedback?',
    options: [
      { label: 'Very direct — tell me what to fix', weights: { growth_mindset: 1.1, progressive_challenge: 1.2 } },
      { label: 'Sandwich it — positive first', weights: { positive_framing: 1.4, emotional_state: 1.2 } },
      { label: 'Ask me questions so I figure it out', weights: { meta_model: 1.4, retrieval_practice: 1.2 } },
      { label: 'Only when I ask for it', weights: { autonomy_choice: 1.4, rapport_anchoring: 1.1 } },
    ],
  },
]

export const calculateProfileWeights = (
  answers: Record<string, number>
): Record<string, number> => {
  const weights: Record<string, number> = {}

  for (const question of QUIZ_QUESTIONS) {
    const answerIdx = answers[question.id]
    if (answerIdx === undefined) continue
    const option = question.options[answerIdx]
    if (!option) continue
    for (const [principleId, weight] of Object.entries(option.weights)) {
      weights[principleId] = (weights[principleId] ?? 1.0) * weight
    }
  }

  return weights
}

export const DEFAULT_PROFILE_WEIGHTS: Record<string, number> = {
  growth_mindset: 1.0,
  emotional_state: 1.0,
  cognitive_load: 1.0,
  progressive_challenge: 1.0,
  positive_framing: 1.0,
  rapport_anchoring: 1.0,
  autonomy_choice: 1.0,
  meta_model: 1.0,
  retrieval_practice: 1.0,
  sensory_engagement: 1.0,
  spacing: 1.0,
  metacognition: 1.0,
}
