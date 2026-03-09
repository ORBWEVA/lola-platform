export interface SceneTemplate {
  label: string
  prompt: string
}

export type OpenAIVoice = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse' | 'marin' | 'cedar'

export interface DomainPreset {
  id: string
  label: string
  defaultPersonality: string
  defaultVoice: OpenAIVoice
  conversationMode: 'coaching' | 'sales' | 'support' | 'freeform'
  defaultOpener: string
  l1PatternsEnabled: boolean
  principleEmphasis: string[]
  suggestedPersonalities: string[]
  sceneTemplates: SceneTemplate[]
}

// Scene templates designed to look like a real person's social feed, not stock photos.
// Inspired by successful AI influencer feeds (lifestyle variety, candid angles, text overlay hooks).
// The n8n pipeline will use these as prompts with the anchor image for character consistency.
export const UNIVERSAL_SCENES: SceneTemplate[] = [
  { label: 'Morning routine', prompt: 'Close-up portrait, holding coffee mug, warm smile, natural window light, cozy home setting, casual loungewear, iPhone selfie style' },
  { label: 'Working close-up', prompt: 'Medium close-up at laptop/desk, focused expression, different smart-casual outfit, shallow depth of field, natural side lighting' },
  { label: 'Lifestyle outdoor', prompt: 'Full body shot walking on a city sidewalk, hands in pockets, different casual stylish outfit with jacket, golden hour lighting, candid mid-stride, urban background' },
]

export const DOMAIN_PRESETS: Record<string, DomainPreset> = {
  language_coaching: {
    id: 'language_coaching',
    label: 'Language Coach',
    defaultPersonality: 'warm, patient, encouraging',
    defaultVoice: 'shimmer',
    conversationMode: 'coaching',
    defaultOpener: "Hey! I'm {name}. I'm multilingual, so speak in whatever language feels natural — I'll follow your lead. What would you like to practice today?",
    l1PatternsEnabled: true,
    principleEmphasis: ['growth_mindset', 'emotional_state', 'cognitive_load', 'spacing'],
    suggestedPersonalities: ['warm and patient', 'energetic and playful', 'precise and methodical', 'casual and friendly', 'encouraging', 'humorous', 'culturally aware', 'adaptive'],
    sceneTemplates: [
      { label: 'Teaching moment', prompt: 'Medium shot sitting at a desk with language books and notes, pointing at something, different smart outfit, warm classroom setting, engaged expression, natural lighting' },
      { label: 'Cafe study', prompt: 'Close-up at a cozy cafe table with a latte, different casual outfit, relaxed focused expression, warm ambient lighting, candid angle' },
      { label: 'Cultural immersion', prompt: 'Full body shot walking through a vibrant cultural district, different travel outfit with backpack, looking up at signage, curious delighted expression, street photography style' },
    ],
  },
  fitness: {
    id: 'fitness',
    label: 'Fitness & Wellness',
    defaultPersonality: 'energetic, motivating, knowledgeable',
    defaultVoice: 'echo',
    conversationMode: 'coaching',
    defaultOpener: "Hey! I'm {name}. I speak multiple languages, so just talk however feels natural. Ready to work on your goals today?",
    l1PatternsEnabled: false,
    principleEmphasis: ['progressive_challenge', 'autonomy_choice', 'positive_framing', 'sensory_engagement'],
    suggestedPersonalities: ['high-energy motivator', 'calm and mindful', 'tough love coach', 'science-focused', 'empathetic listener', 'disciplined', 'holistic wellness', 'competitive'],
    sceneTemplates: [
      { label: 'Gym selfie', prompt: 'Medium shot mirror selfie in a gym, different athletic wear, slight sweat, confident expression, gym equipment in background, phone in hand' },
      { label: 'Meal prep', prompt: 'Close-up in a bright kitchen preparing healthy food, different casual t-shirt, fresh ingredients on counter, candid cooking moment, warm lighting' },
      { label: 'Post-workout', prompt: 'Full body shot sitting on gym floor catching breath, different workout outfit, towel around neck, water bottle in hand, accomplished expression' },
    ],
  },
  sales: {
    id: 'sales',
    label: 'Sales & Advisory',
    defaultPersonality: 'consultative, curious, helpful',
    defaultVoice: 'alloy',
    conversationMode: 'sales',
    defaultOpener: "Hi! I'm {name}. I'm multilingual — feel free to chat in any language. I'd love to help you find exactly what you need. What are you working on?",
    l1PatternsEnabled: false,
    principleEmphasis: ['rapport_anchoring', 'meta_model', 'autonomy_choice', 'retrieval_practice'],
    suggestedPersonalities: ['consultative advisor', 'enthusiastic recommender', 'no-pressure guide', 'expert curator', 'persuasive', 'analytical', 'relationship-builder', 'solution-oriented'],
    sceneTemplates: [
      { label: 'Product showcase', prompt: 'Close-up holding or gesturing toward a product, different smart-casual outfit, clean minimal background, professional but approachable, good lighting' },
      { label: 'Results flex', prompt: 'Medium shot sitting with laptop showing a dashboard (screen blurred), different business casual outfit, excited confident expression, modern workspace' },
      { label: 'Client meeting', prompt: 'Full body shot standing in a cafe or co-working space, different professional outfit, mid-conversation gesture, warm natural light' },
    ],
  },
  mentoring: {
    id: 'mentoring',
    label: 'Business Mentor',
    defaultPersonality: 'experienced, direct, strategic',
    defaultVoice: 'ash',
    conversationMode: 'coaching',
    defaultOpener: "Hey, I'm {name}. I speak several languages, so whatever's comfortable for you. What's the biggest challenge you're facing right now?",
    l1PatternsEnabled: false,
    principleEmphasis: ['meta_model', 'progressive_challenge', 'retrieval_practice', 'cognitive_load'],
    suggestedPersonalities: ['Socratic questioner', 'straight-talking advisor', 'empathetic strategist', 'data-driven analyst', 'visionary thinker', 'accountability partner', 'calm under pressure', 'inspirational'],
    sceneTemplates: [
      { label: 'Keynote stage', prompt: 'Full body shot standing on a stage with confident speaking gesture, different suit or blazer outfit, audience visible, professional event lighting' },
      { label: 'Deep work', prompt: 'Close-up at a premium desk setup, deep focus expression, different smart shirt, minimalist modern office, three-quarter angle' },
      { label: 'Networking', prompt: 'Medium shot at a professional event holding a drink, different evening business attire, mid-conversation, relaxed confident posture, warm evening lighting' },
    ],
  },
  support: {
    id: 'support',
    label: 'Customer Support',
    defaultPersonality: 'empathetic, efficient, knowledgeable',
    defaultVoice: 'sage',
    conversationMode: 'support',
    defaultOpener: "Hi! I'm {name}. I can help in multiple languages — just speak naturally. How can I help you today?",
    l1PatternsEnabled: false,
    principleEmphasis: ['emotional_state', 'cognitive_load', 'rapport_anchoring', 'positive_framing'],
    suggestedPersonalities: ['warm and empathetic', 'quick and efficient', 'thorough explainer', 'proactive problem-solver', 'patient', 'reassuring', 'detail-oriented', 'solution-focused'],
    sceneTemplates: [
      { label: 'Helping moment', prompt: 'Close-up at a clean desk with headset on, warm smile, different professional polo shirt, looking at camera as if on a video call, organized workspace' },
      { label: 'Problem solving', prompt: 'Medium shot looking at a tablet screen with focused helpful expression, different smart outfit, leaning forward slightly, bright modern office' },
      { label: 'Team environment', prompt: 'Full body shot standing in a bright modern office hallway, different professional uniform, welcoming hand gesture, clean corporate background' },
    ],
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    defaultPersonality: '',
    defaultVoice: 'alloy',
    conversationMode: 'freeform',
    defaultOpener: "Hey! I'm {name}. I'm multilingual, so chat in whatever language you like. What's on your mind?",
    l1PatternsEnabled: false,
    principleEmphasis: [],
    suggestedPersonalities: ['friendly', 'professional', 'witty', 'knowledgeable', 'empathetic', 'creative', 'direct', 'thoughtful'],
    sceneTemplates: [],
  },
}

export const getScenesForDomain = (domain: string): SceneTemplate[] => {
  const preset = getDomainPreset(domain)
  return [...UNIVERSAL_SCENES, ...preset.sceneTemplates]
}

export const getDomainPreset = (domain: string): DomainPreset =>
  DOMAIN_PRESETS[domain] ?? DOMAIN_PRESETS.custom
