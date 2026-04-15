import useCharacterStore from '../store/useCharacterStore'
import useUserStore from '../store/useUserStore'
import useMemoryStore from '../store/useMemoryStore'
import useLorebookStore from '../store/useLorebookStore'

export const PROMPT_VARIABLES = [
  '{{char}}',
  '{{user}}',
  '{{char_description}}',
  '{{user_description}}',
  '{{scenario}}',
  '{{memory}}',
  '{{tools}}',
  '{{lorebook}}'
]

// Backward compat alias
export const promptVariables = PROMPT_VARIABLES

export function replacePlaceholders(template, values) {
  // Pre-resolve identity placeholders inside descriptions
  const baseValues = { char: values.char || '', user: values.user || '' }
  const nestedFields = ['char_description', 'user_description', 'scenario']
  
  nestedFields.forEach(field => {
    if (values[field]) {
      values[field] = values[field]
        .replaceAll('{{char}}', baseValues.char)
        .replaceAll('{{user}}', baseValues.user)
    }
  })

  // Normal replacement sequence
  let result = template
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, value || '')
  }
  return result
}

/**
 * Scan messages for lorebook keyword matches and build the lorebook content.
 * Scans the last 5 messages, case-insensitive.
 * Combines enabled global lorebook entries + character-specific entries.
 * Global entries first, then character-specific.
 *
 * @param {Array} messages - The message history to scan
 * @param {Object} character - The active character object (for per-character lorebook)
 * @returns {string} Combined lorebook content as plain text
 */
export function buildLorebookContent(messages, character) {
  if (!messages || messages.length === 0) return ''

  const { globalLorebooks } = useLorebookStore.getState()

  // Get the last 5 messages (excluding system messages)
  const recentMessages = messages
    .filter((m) => m.role !== 'system')
    .slice(-5)

  if (recentMessages.length === 0) return ''

  // Combine all recent message text for scanning
  const combinedText = recentMessages
    .map((m) => m.content)
    .join(' ')
    .toLowerCase()

  const matchedEntries = []

  // 1. Scan enabled global lorebooks
  for (const lorebook of globalLorebooks) {
    if (!lorebook.enabled) continue
    for (const entry of lorebook.entries) {
      if (!entry.keywords || !entry.content) continue
      const keywords = entry.keywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k)
      const hasMatch = keywords.some((kw) => combinedText.includes(kw))
      if (hasMatch) {
        matchedEntries.push({
          name: lorebook.name,
          keywords: entry.keywords,
          content: entry.content,
        })
      }
    }
  }

  // 2. Scan character-specific lorebook
  const charLorebook = character?.lorebook
  if (charLorebook && charLorebook.entries) {
    for (const entry of charLorebook.entries) {
      if (!entry.keywords || !entry.content) continue
      const keywords = entry.keywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k)
      const hasMatch = keywords.some((kw) => combinedText.includes(kw))
      if (hasMatch) {
        matchedEntries.push({
          name: character.name || 'Character',
          keywords: entry.keywords,
          content: entry.content,
        })
      }
    }
  }

  if (matchedEntries.length === 0) return ''

  // Build the output: one entry per matched item
  const lines = []
  for (const entry of matchedEntries) {
    lines.push(`[${entry.name}]`)
    lines.push(entry.content)
    lines.push('')
  }

  return lines.join('\n').trim()
}

export function buildPlaceholderValues(messages) {
  const { character, patternReplacements } = useCharacterStore.getState()
  const { user } = useUserStore.getState()
  const { summarizeText } = useMemoryStore.getState()

  // Use provided messages or fall back to character's messages
  const msgs = messages || character?.messages || []
  const lorebookContent = buildLorebookContent(msgs, character)

  return {
    char: character?.name || '',
    user: user?.name || '',
    char_description: character?.description || '',
    user_description: user?.description || '',
    scenario: character?.scenario || '',
    memory: summarizeText || '',
    tools: patternReplacements
      .filter(p => p.active && p.prompt)
      .map(p => p.prompt)
      .join('\n'),
    lorebook: lorebookContent
  }
}

/**
 * Check if a resolved template still contains unresolved {{...}} placeholders.
 * Returns { valid: true } if all resolved, or { valid: false, unresolved: [...] }
 *
 * @param {string} resolvedText - The template after placeholder replacement
 * @returns {{ valid: boolean, unresolved?: string[] }}
 */
export function validatePlaceholders(resolvedText) {
  if (!resolvedText) return { valid: true }
  const unresolved = resolvedText.match(/{{\w+}}/g)
  if (unresolved && unresolved.length > 0) {
    console.warn('[Placeholder Validation] Unresolved placeholders:', unresolved)
    return { valid: false, unresolved }
  }
  return { valid: true }
}