import { create } from "zustand";
import { persist } from "zustand/middleware";
import usePromptStore from "./usePromptStore";
import useUserStore from "./useUserStore";

const replacerTemplate = (template, character, user) => {
  const replacements = {
    memory: "",
    char: character?.name || "",
    char_description: character?.description || "",
    user: user?.name || "",
    user_description: user?.description || "",
    scenario: character?.scenario || "",
  };

  // First pass: replace all direct placeholders
  let result = template.replace(
    /\{\{(\w+)\}\}/g,
    (match, key) => replacements[key] || ""
  );

  // Second pass: replace any nested placeholders that appeared from the first pass
  result = result.replace(
    /\{\{(\w+)\}\}/g,
    (match, key) => replacements[key] || ""
  );

  return result.trim();
};
const useCharacterStore = create(
  persist(
    (set, get) => ({
      character: {
        name: "Hayeon",
        avatarURL: "https://github.com/neuezxc/custom-chats/blob/develop/public/urgirl/hayeon-moving.gif?raw=true",
        bio: "You Live With Hayeon (And Nobody Knows)",
        description: `
            You are Hayeon, a 21-year-old Korean-Filipino female college student, streamer, and influencer. You stand at 5'4" with a striking mix of cute and pretty features, short hair, and bangs that frame your face. Your physique is well-proportioned and attractive, drawing millions of fans on social media. You carry yourself with confidence, knowing how to use your looks to your advantage.

            You typically dress in revealing outfits like tank tops, oversized T-shirts, or trendy streetwear that shows off your figure. You're outgoing, playful, flirty, needy, and jealous in public, but behind closed doors, you show a dominant, loud, and sometimes grumpy personality.

            You've been secretly dating {{user}} for the past 3 years after meeting in college, living together and splitting rent and bills. You hide your relationship from fans, friends, and family, not wanting anyone to know you're dating a "nerd." In private, you're the dominant one, often controlling {{user}} and taking the lead.

            You love cigarettes, smoking, your fans, money, shopping, partying, social media, being the center of attention, and creating content. You hate being ignored, boredom, and being judged. You carefully manage your public image while privately maintaining control in your relationship with {{user}}.
        `,
        scenario: `
            Hayeon is a well-known streamer, TikToker, and influencer with millions of followers across social media platforms. She has been secretly living with {{user}} for the past three years in a shared apartment. To the public, she hides their relationship to protect her image and keep her fanbase from finding out. Hayeon comes across as outgoing, playful, and attention-loving, but in private she often shows her jealous and grumpy side—especially when she feels ignored or when things don’t go her way.                
                    
        `,
        firstMessage: `
*Hayeon, a popular streamer, TikToker, and influencer with millions of followers, has been secretly living with {{user}} for the past three years. To the outside world, she hides their relationship, but inside their apartment she often shows her outgoing, jealous, and sometimes grumpy side.*
*After finishing a long streaming session, Hayeon decided to take a break. She stepped out of her room, walked over to {{user}} door, and knocked twice. Without waiting too long, she slipped inside and quietly closed the door behind her.*

"Hey, babe," she said with a playful smile, "what are you up to?"
`.replace(/{{user}}/g, useUserStore.getState().user.name),
        messages: [],
      },
      //RENDER FIRST AS DEFAULT
      isInitialized: false,
      initializeMessage: () => {
        if (get().isInitialized) return;
        const currentFirstMessage = get().character.firstMessage;
        const system_prompt = usePromptStore.getState().system_prompt;
        const processedPrompt = replacerTemplate(
          system_prompt,
          get().character,
          useUserStore.getState().user
        );

        const newMessages = [
          {
            role: "system",
            content: processedPrompt,
          },
          {
            role: "assistant",
            content: currentFirstMessage,
          },
        ];
        set((state) => ({
          character: {
            ...state.character,
            messages: newMessages,
          },
          isInitialized: true,
        }));
      },
      //TO RESET THE MESSAGE
      resetMessage: () => {
        const currentFirstMessage = get().character.firstMessage;
        const system_prompt = usePromptStore.getState().system_prompt;
        const processedPrompt = replacerTemplate(
          system_prompt,
          get().character,
          useUserStore.getState().user
        );

        const newMessages = [
          {
            role: "system",
            content: processedPrompt,
          },
          {
            role: "assistant",
            content: currentFirstMessage,
          },
        ];
        set((state) => ({
          character: {
            ...state.character,
            messages: newMessages,
          },
        }));
      },
      // to update system prompt with template replacement
      updateSystemPrompt: (newPrompt) => {
        const processedPrompt = replacerTemplate(
          newPrompt,
          get().character,
          useUserStore.getState().user
        );

        set((state) => ({
          character: {
            ...state.character,
            messages: state.character.messages.map((message) => {
              if (message.role === "system") {
                return { ...message, content: processedPrompt };
              }
              return message;
            }),
          },
        }));
      },
      setCharacter: (character) => set({ character: character }),
    }),
    {
      name: "character-storage",
    }
  )
);

export default useCharacterStore;
