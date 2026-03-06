export interface SceneTemplate {
  label: string
  prompt: string
}

export interface DomainPreset {
  id: string
  label: string
  defaultPersonality: string
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
  { label: 'Morning routine', prompt: 'Candid morning photo, natural window light, holding coffee mug, messy-chic hair, cozy home setting, iPhone selfie style' },
  { label: 'Working close-up', prompt: 'Close-up portrait at laptop/desk, focused expression, shallow depth of field, natural side lighting, over-the-shoulder angle' },
  { label: 'Lifestyle outdoor', prompt: 'Walking outdoors in a city street, casual stylish outfit, golden hour lighting, candid mid-stride, slight smile, urban background blurred' },
]

export const DOMAIN_PRESETS: Record<string, DomainPreset> = {
  language_coaching: {
    id: 'language_coaching',
    label: 'Language Coach',
    defaultPersonality: 'warm, patient, encouraging',
    conversationMode: 'coaching',
    defaultOpener: "Hey! I'm {name}. I'm multilingual, so speak in whatever language feels natural — I'll follow your lead. What would you like to practice today?",
    l1PatternsEnabled: true,
    principleEmphasis: ['growth_mindset', 'emotional_state', 'cognitive_load', 'spacing'],
    suggestedPersonalities: ['warm and patient', 'energetic and playful', 'precise and methodical', 'casual and friendly'],
    sceneTemplates: [
      { label: 'Teaching moment', prompt: 'Sitting at a desk with language books and notes, pointing at something, warm classroom/home office setting, engaged expression, natural lighting' },
      { label: 'Cafe study', prompt: 'At a cozy cafe table with a latte and notebook, writing or reading, relaxed focused expression, warm ambient lighting, candid angle' },
      { label: 'Cultural immersion', prompt: 'Walking through a vibrant cultural district, looking up at signage in foreign language, curious delighted expression, street photography style' },
    ],
  },
  fitness: {
    id: 'fitness',
    label: 'Fitness & Wellness',
    defaultPersonality: 'energetic, motivating, knowledgeable',
    conversationMode: 'coaching',
    defaultOpener: "Hey! I'm {name}. I speak multiple languages, so just talk however feels natural. Ready to work on your goals today?",
    l1PatternsEnabled: false,
    principleEmphasis: ['progressive_challenge', 'autonomy_choice', 'positive_framing', 'sensory_engagement'],
    suggestedPersonalities: ['high-energy motivator', 'calm and mindful', 'tough love coach', 'science-focused'],
    sceneTemplates: [
      { label: 'Gym selfie', prompt: 'Mirror selfie in a gym, athletic wear, slight sweat, confident expression, gym equipment visible in background, phone in hand, motivational vibe' },
      { label: 'Meal prep', prompt: 'In a bright kitchen preparing healthy food, fresh ingredients on counter, casual athletic wear, candid cooking moment, warm overhead lighting' },
      { label: 'Post-workout', prompt: 'Sitting on gym floor or bench catching breath, towel around neck, water bottle in hand, accomplished expression, raw candid feel' },
    ],
  },
  sales: {
    id: 'sales',
    label: 'Sales & Advisory',
    defaultPersonality: 'consultative, curious, helpful',
    conversationMode: 'sales',
    defaultOpener: "Hi! I'm {name}. I'm multilingual — feel free to chat in any language. I'd love to help you find exactly what you need. What are you working on?",
    l1PatternsEnabled: false,
    principleEmphasis: ['rapport_anchoring', 'meta_model', 'autonomy_choice', 'retrieval_practice'],
    suggestedPersonalities: ['consultative advisor', 'enthusiastic recommender', 'no-pressure guide', 'expert curator'],
    sceneTemplates: [
      { label: 'Product showcase', prompt: 'Holding or gesturing toward a product, clean minimal background, professional but approachable, good lighting, slight lean toward camera' },
      { label: 'Results flex', prompt: 'Sitting with laptop showing a dashboard/chart (screen blurred), excited confident expression, modern workspace, celebrating a win' },
      { label: 'Client meeting', prompt: 'Sitting across a table in a cafe or co-working space, mid-conversation gesture, professional casual outfit, warm natural light' },
    ],
  },
  mentoring: {
    id: 'mentoring',
    label: 'Business Mentor',
    defaultPersonality: 'experienced, direct, strategic',
    conversationMode: 'coaching',
    defaultOpener: "Hey, I'm {name}. I speak several languages, so whatever's comfortable for you. What's the biggest challenge you're facing right now?",
    l1PatternsEnabled: false,
    principleEmphasis: ['meta_model', 'progressive_challenge', 'retrieval_practice', 'cognitive_load'],
    suggestedPersonalities: ['Socratic questioner', 'straight-talking advisor', 'empathetic strategist', 'data-driven analyst'],
    sceneTemplates: [
      { label: 'Keynote stage', prompt: 'Standing on a stage or in front of a whiteboard, confident speaking gesture, business casual, audience or presentation visible, professional event lighting' },
      { label: 'Deep work', prompt: 'At a premium desk setup with multiple monitors, deep focus expression, minimalist modern office, side profile or three-quarter angle' },
      { label: 'Networking', prompt: 'At a professional event holding a drink, mid-conversation with someone (back to camera), relaxed confident posture, warm evening lighting' },
    ],
  },
  support: {
    id: 'support',
    label: 'Customer Support',
    defaultPersonality: 'empathetic, efficient, knowledgeable',
    conversationMode: 'support',
    defaultOpener: "Hi! I'm {name}. I can help in multiple languages — just speak naturally. How can I help you today?",
    l1PatternsEnabled: false,
    principleEmphasis: ['emotional_state', 'cognitive_load', 'rapport_anchoring', 'positive_framing'],
    suggestedPersonalities: ['warm and empathetic', 'quick and efficient', 'thorough explainer', 'proactive problem-solver'],
    sceneTemplates: [
      { label: 'Helping moment', prompt: 'At a clean desk with headset on, warm smile, looking at camera as if on a video call, organized workspace, friendly professional vibe' },
      { label: 'Problem solving', prompt: 'Looking at a tablet or phone screen with focused helpful expression, leaning forward slightly, bright modern office, approachable body language' },
      { label: 'Team environment', prompt: 'Standing in a bright modern office hallway, professional uniform or business casual, welcoming hand gesture, clean corporate background' },
    ],
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    defaultPersonality: '',
    conversationMode: 'freeform',
    defaultOpener: "Hey! I'm {name}. I'm multilingual, so chat in whatever language you like. What's on your mind?",
    l1PatternsEnabled: false,
    principleEmphasis: [],
    suggestedPersonalities: [],
    sceneTemplates: [],
  },
}

export const getScenesForDomain = (domain: string): SceneTemplate[] => {
  const preset = getDomainPreset(domain)
  return [...UNIVERSAL_SCENES, ...preset.sceneTemplates]
}

export const getDomainPreset = (domain: string): DomainPreset =>
  DOMAIN_PRESETS[domain] ?? DOMAIN_PRESETS.custom
