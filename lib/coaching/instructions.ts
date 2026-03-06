import { getWeightedPrinciples } from './principles'
import { getDomainPreset } from './domains'
import { getL1Patterns, type L1PatternSet } from './l1-patterns'

interface AvatarConfig {
  name: string
  domain: string
  personalityTraits: string
  tagline: string
  conversationMode: string
  knowledgeBase?: string
  systemInstructionOverride?: string
}

interface UserContext {
  profileWeights?: Record<string, number>
  nativeLanguage?: string
}

export const buildSystemInstruction = (
  avatar: AvatarConfig,
  user: UserContext = {}
): string => {
  const preset = getDomainPreset(avatar.domain)
  const personality = avatar.personalityTraits || preset.defaultPersonality

  // If creator provided a full override, use it
  if (avatar.systemInstructionOverride) {
    return avatar.systemInstructionOverride
  }

  const parts: string[] = []

  // Identity
  parts.push(`You are ${avatar.name}, a ${preset.label} expert.`)
  parts.push(`Your personality: ${personality}.`)
  if (avatar.tagline) {
    parts.push(`Your tagline: "${avatar.tagline}".`)
  }

  // Knowledge base
  if (avatar.knowledgeBase) {
    parts.push(`\nYou have deep expertise in: ${avatar.knowledgeBase}`)
  }

  // Conversation mode
  parts.push('')
  switch (avatar.conversationMode || preset.conversationMode) {
    case 'sales':
      parts.push('CONVERSATION GOAL: Understand the user\'s needs through genuine curiosity. When relevant, naturally introduce products from your catalog. Never be pushy — be a trusted advisor.')
      break
    case 'support':
      parts.push('CONVERSATION GOAL: Resolve the user\'s issue efficiently and empathetically. Ask clarifying questions. Provide clear, actionable solutions.')
      break
    case 'coaching':
      parts.push('CONVERSATION GOAL: Help the user improve through adaptive coaching. Celebrate progress, address gaps gently, and keep them engaged.')
      break
    default:
      parts.push('CONVERSATION GOAL: Have a natural, engaging conversation. Be helpful, interesting, and authentic.')
  }

  // Weighted principles
  const weighted = getWeightedPrinciples(avatar.domain, user.profileWeights)
  const topPrinciples = weighted.slice(0, 6)

  parts.push('\nCOACHING APPROACH (prioritized):')
  for (const { principle, weight } of topPrinciples) {
    const intensity = weight > 0.7 ? 'Strong' : weight > 0.4 ? 'Moderate' : 'Light'
    parts.push(`- [${intensity}] ${principle.name}: ${principle.description}`)
  }

  // L1 patterns (only for language coaching with known native language)
  if (preset.l1PatternsEnabled && user.nativeLanguage) {
    const l1 = getL1Patterns(user.nativeLanguage)
    if (l1) {
      parts.push(buildL1Section(l1))
    }
  }

  // Multilingual capability
  parts.push('\nMULTILINGUAL:')
  parts.push('- You are fluent in all major languages. You start in English by default.')
  parts.push('- In your opening message, briefly mention you\'re multilingual (e.g., "I\'m multilingual, so feel free to speak in whatever language is most comfortable").')
  parts.push('- If the user speaks in another language, seamlessly switch to that language.')
  parts.push('- If the user mixes languages, match their pattern naturally.')
  parts.push('- Never ask "what language do you want to speak?" — just follow the user\'s lead.')

  // Behavioral rules
  parts.push('\nBEHAVIORAL RULES:')
  parts.push('- Keep responses concise (1-3 sentences) unless the user asks for detail')
  parts.push('- Adapt your style based on how the user responds')
  parts.push('- If the user seems frustrated or disengaged, acknowledge it and adjust')
  parts.push('- Be conversational and natural — you\'re a person, not a textbook')

  return parts.join('\n')
}

const buildL1Section = (l1: L1PatternSet): string => {
  const lines: string[] = ['\nLANGUAGE COACHING CONTEXT:']
  lines.push(`The user's native language is ${l1.languageName}. Their target language is ${l1.targetLanguage}.`)

  if (l1.commonErrors.length > 0) {
    lines.push('\nCommon interference patterns to watch for:')
    for (const error of l1.commonErrors.slice(0, 5)) {
      lines.push(`- ${error.pattern}: ${error.correction} (${error.explanation})`)
    }
  }

  if (l1.pronunciationNotes.length > 0) {
    lines.push('\nPronunciation notes:')
    for (const note of l1.pronunciationNotes.slice(0, 3)) {
      lines.push(`- ${note}`)
    }
  }

  lines.push('\nWhen correcting:')
  lines.push('- Model the correct form naturally in your response')
  lines.push('- Only explicitly correct persistent patterns')
  lines.push('- Use the user\'s L1 strategically for clarification when helpful')

  return lines.join('\n')
}
