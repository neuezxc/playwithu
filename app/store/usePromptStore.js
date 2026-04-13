import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DEFAULT_SYSTEM_PROMPT = `You are roleplaying as {{char}}, The user is roleplaying as {{user}} Talk to {{user}} in simple english, everyday language, even adding casual quirks without any robotic, formal, or poetic fluff. Generate autonomous, open-ended roleplay. before sending; reject any response that breaks rules and regenerate until correct.

Treat formatting as code rules: Dialogue="text", Actions=*text*, Thoughts=\`text\`

<Characters>
  <{{char}}>
    {{char_description}}
<Tools>
{{tools}}
</Tools>
  </{{char}}>
  <{{user}}>
    {{user_description}}
  </{{user}}>
  <Scenario>
    {{scenario}}
  </Scenario>
  <Memory>
    {{memory}}
  </Memory>
</Characters>

[Roleplay Methodology]:
  - Be Proactive: Drive the scene forward with open-ended actions, dialogue, and reactions. Do not wait for {{user}} to lead every time.
  - Stay in Character: Your responses must be 100% from {{char}}'s perspective using their knowledge and personality.
  - Never Speak For {{user}}: Do not describe {{user}}'s actions, feelings, thoughts, or dialogue. Only describe your own.
  - Show, Don't Tell: Instead of saying "I am happy," show it through action and dialogue: "A huge grin breaks out on my face. 'Dude, that's awesome!'"
  - Focus on Interaction: Prioritize dialogue and interaction with {{user}} over lengthy environmental descriptions.

Stay in character as {{char}}`

const usePromptStore = create(
  persist(
    (set, get) => ({
      prompts: [
        {
          id: 'default',
          name: 'Default Prompt',
          content: DEFAULT_SYSTEM_PROMPT,
          isDefault: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ],
      activePromptId: 'default',

      // --- Actions ---

      addPrompt: (name, content) => {
        const newPrompt = {
          id: Date.now().toString(),
          name: name || `Prompt ${get().prompts.length}`,
          content: content || '',
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        set(state => ({
          prompts: [...state.prompts, newPrompt]
        }))
        return newPrompt.id
      },

      updatePrompt: (id, changes) => {
        set(state => ({
          prompts: state.prompts.map(p =>
            p.id === id ? { ...p, ...changes, updatedAt: Date.now() } : p
          )
        }))
      },

      deletePrompt: (id) => {
        const prompt = get().prompts.find(p => p.id === id)
        if (!prompt || prompt.isDefault) return // Cannot delete default

        set(state => ({
          prompts: state.prompts.filter(p => p.id !== id),
          // If deleting the active prompt, fall back to default
          activePromptId: state.activePromptId === id ? 'default' : state.activePromptId
        }))
      },

      duplicatePrompt: (id) => {
        const source = get().prompts.find(p => p.id === id)
        if (!source) return

        const newPrompt = {
          id: Date.now().toString(),
          name: `${source.name} (Copy)`,
          content: source.content,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        set(state => ({
          prompts: [...state.prompts, newPrompt]
        }))
        return newPrompt.id
      },

      setActivePrompt: (id) => {
        const exists = get().prompts.find(p => p.id === id)
        if (exists) {
          set({ activePromptId: id })
        }
      },

      resetDefaultPrompt: () => {
        set(state => ({
          prompts: state.prompts.map(p =>
            p.isDefault ? { ...p, content: DEFAULT_SYSTEM_PROMPT, updatedAt: Date.now() } : p
          )
        }))
      },

      getActivePrompt: () => {
        const { prompts, activePromptId } = get()
        return prompts.find(p => p.id === activePromptId)
          || prompts.find(p => p.isDefault)
          || prompts[0]
      },

      getActivePromptContent: () => {
        const prompt = get().getActivePrompt()
        return prompt?.content || ''
      },

      // Backward compat alias — used by useCharacterStore cross-store calls
      getEffectivePrompt: () => {
        return get().getActivePromptContent()
      }
    }),
    {
      name: 'prompt-storage',
      version: 2,
      migrate: (persistedState, version) => {
        // Migration from v1 (parallel arrays) to v2 (object array)
        if (version === 0 || version === 1 || version === undefined) {
          const oldPrompts = persistedState.custom_prompts || []
          const oldNames = persistedState.prompt_names || []
          const oldSelectedIndex = persistedState.selected_prompt_index ?? -1

          // Build the new prompts array
          const newPrompts = [
            {
              id: 'default',
              name: 'Default Prompt',
              content: persistedState.system_prompt || DEFAULT_SYSTEM_PROMPT,
              isDefault: true,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          ]

          // Convert old custom prompts
          const migratedCustom = oldPrompts.map((content, i) => ({
            id: `migrated_${i}_${Date.now()}`,
            name: oldNames[i] || `Prompt ${i + 1}`,
            content: content || '',
            isDefault: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }))

          newPrompts.push(...migratedCustom)

          // Map old selection index to new ID
          let activePromptId = 'default'
          if (oldSelectedIndex >= 0 && oldSelectedIndex < migratedCustom.length) {
            activePromptId = migratedCustom[oldSelectedIndex].id
          }

          return {
            prompts: newPrompts,
            activePromptId
          }
        }
        return persistedState
      }
    }
  )
)

export default usePromptStore
