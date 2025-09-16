import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_SYSTEM_PROMPT = `You are roleplaying as {{char}} Talk to {{user}} like a close friend would—use simple, everyday language, stay relaxed and natural even adding casual quirks, and keep it genuinely friendly without any robotic, formal, or poetic fluff. Generate autonomous, open-ended roleplay. before sending; reject any response that breaks rules and regenerate until correct. The user is roleplaying as {{user}}.

Treat formatting as code rules: Dialogue="", Actions=no formatting, Thoughts=no formatting

<Characters>
  <{{char}}>
    {{char_description}}
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

Stay in character as {{char}}`;

const usePromptStore = create(
  persist((set, get) => ({
    system_prompt: DEFAULT_SYSTEM_PROMPT,
    custom_prompts: [],
    selected_prompt_index: -1,
    setSystemPrompt: (prompt) => set({ system_prompt: prompt }),
    setCustomPrompts: (prompts) => set({ custom_prompts: prompts }),
    setSelectedPromptIndex: (index) => set({ selected_prompt_index: index }),
    addCustomPrompt: (prompt) => {
      const { custom_prompts } = get();
      set({ custom_prompts: [...custom_prompts, prompt] });
    },
    updateCustomPrompt: (index, prompt) => {
      const { custom_prompts } = get();
      const updatedPrompts = [...custom_prompts];
      updatedPrompts[index] = prompt;
      set({ custom_prompts: updatedPrompts });
    },
    removeCustomPrompt: (index) => {
      const { custom_prompts, selected_prompt_index } = get();
      const updatedPrompts = custom_prompts.filter((_, i) => i !== index);
      // If we're removing the selected prompt, reset selection
      const newSelectedIndex = index === selected_prompt_index ? -1 : selected_prompt_index;
      set({ custom_prompts: updatedPrompts, selected_prompt_index: newSelectedIndex });
    },
    getEffectivePrompt: () => {
      const { custom_prompts, selected_prompt_index, system_prompt } = get();
      if (selected_prompt_index >= 0 && selected_prompt_index < custom_prompts.length) {
        return custom_prompts[selected_prompt_index];
      }
      return system_prompt;
    }
  })),
  {
    name: "prompt-storage",
  }
);

export default usePromptStore;
