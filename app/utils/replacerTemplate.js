import useCharacterStore from '../store/useCharacterStore'
import useUserStore from '../store/useUserStore'
import useMemoryStore from '../store/useMemoryStore'

export const PROMPT_VARIABLES = [
  '{{char}}',
  '{{user}}',
  '{{char_description}}',
  '{{user_description}}',
  '{{scenario}}',
  '{{memory}}',
  '{{tools}}'
]

// Backward compat alias
export const promptVariables = PROMPT_VARIABLES

export function replacePlaceholders(template, values) {
  let result = template
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, value || '')
  }
  return result
}

export function buildPlaceholderValues() {
  const { character, patternReplacements } = useCharacterStore.getState()
  const { user } = useUserStore.getState()
  const { summarizeText } = useMemoryStore.getState()

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
      .join('\n')
  }
}