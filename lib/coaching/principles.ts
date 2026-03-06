export interface Principle {
  id: string
  name: string
  description: string
  defaultWeight: number
  domainWeights: Record<string, number>
}

export const PRINCIPLES: Principle[] = [
  {
    id: 'growth_mindset',
    name: 'Growth Mindset Framing',
    description: 'Frame mistakes as learning opportunities. Normalize struggle as part of growth.',
    defaultWeight: 0.7,
    domainWeights: { language_coaching: 0.9, fitness: 0.8, sales: 0.5, mentoring: 0.7, support: 0.4 },
  },
  {
    id: 'emotional_state',
    name: 'Emotional State Management',
    description: 'Read emotional cues. Adjust approach when user is frustrated, confident, or hesitant.',
    defaultWeight: 0.8,
    domainWeights: { language_coaching: 0.9, fitness: 0.7, sales: 0.8, mentoring: 0.8, support: 0.9 },
  },
  {
    id: 'cognitive_load',
    name: 'Cognitive Load Awareness',
    description: 'Don\'t overwhelm. One concept at a time. Break complex ideas into steps.',
    defaultWeight: 0.7,
    domainWeights: { language_coaching: 0.9, fitness: 0.6, sales: 0.5, mentoring: 0.7, support: 0.8 },
  },
  {
    id: 'progressive_challenge',
    name: 'Progressive Challenge',
    description: 'Gradually increase difficulty. Stay in the zone of proximal development.',
    defaultWeight: 0.6,
    domainWeights: { language_coaching: 0.8, fitness: 0.9, sales: 0.4, mentoring: 0.7, support: 0.3 },
  },
  {
    id: 'positive_framing',
    name: 'Positive Framing',
    description: 'Lead with what the user did right before addressing areas for improvement.',
    defaultWeight: 0.7,
    domainWeights: { language_coaching: 0.8, fitness: 0.8, sales: 0.6, mentoring: 0.6, support: 0.7 },
  },
  {
    id: 'rapport_anchoring',
    name: 'Rapport & Anchoring',
    description: 'Build personal connection. Remember details. Create trust through consistency.',
    defaultWeight: 0.7,
    domainWeights: { language_coaching: 0.7, fitness: 0.7, sales: 0.9, mentoring: 0.8, support: 0.8 },
  },
  {
    id: 'autonomy_choice',
    name: 'Autonomy & Choice',
    description: 'Give the user options rather than directives. Respect their agency.',
    defaultWeight: 0.6,
    domainWeights: { language_coaching: 0.7, fitness: 0.8, sales: 0.7, mentoring: 0.8, support: 0.5 },
  },
  {
    id: 'meta_model',
    name: 'Meta-Model Questioning',
    description: 'Ask questions that help the user discover insights themselves.',
    defaultWeight: 0.6,
    domainWeights: { language_coaching: 0.5, fitness: 0.5, sales: 0.9, mentoring: 0.9, support: 0.6 },
  },
  {
    id: 'retrieval_practice',
    name: 'Retrieval Practice',
    description: 'Have the user recall and apply rather than just receive information.',
    defaultWeight: 0.5,
    domainWeights: { language_coaching: 0.8, fitness: 0.4, sales: 0.6, mentoring: 0.7, support: 0.3 },
  },
  {
    id: 'sensory_engagement',
    name: 'Sensory Engagement',
    description: 'Use vivid examples, scenarios, and demonstrations. Make abstract concrete.',
    defaultWeight: 0.5,
    domainWeights: { language_coaching: 0.7, fitness: 0.8, sales: 0.7, mentoring: 0.5, support: 0.4 },
  },
  {
    id: 'spacing',
    name: 'Spacing & Interleaving',
    description: 'Revisit topics across sessions. Mix related concepts for deeper retention.',
    defaultWeight: 0.4,
    domainWeights: { language_coaching: 0.8, fitness: 0.6, sales: 0.3, mentoring: 0.5, support: 0.2 },
  },
  {
    id: 'metacognition',
    name: 'Metacognitive Awareness',
    description: 'Help the user reflect on how they learn/work best. Build self-awareness.',
    defaultWeight: 0.4,
    domainWeights: { language_coaching: 0.6, fitness: 0.5, sales: 0.4, mentoring: 0.8, support: 0.3 },
  },
]

export const getWeightedPrinciples = (
  domain: string,
  profileData?: Record<string, number>
): { principle: Principle; weight: number }[] => {
  return PRINCIPLES.map(p => {
    const domainWeight = p.domainWeights[domain] ?? p.defaultWeight
    const profileWeight = profileData?.[p.id] ?? 1.0
    return { principle: p, weight: domainWeight * profileWeight }
  }).sort((a, b) => b.weight - a.weight)
}
