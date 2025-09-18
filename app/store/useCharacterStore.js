import { create } from "zustand";
import { persist } from "zustand/middleware";
import usePromptStore from "./usePromptStore";
import useUserStore from "./useUserStore";
import useApiSettingStore from "./useApiSettingStore";

const replacerTemplate = (template, character, user) => {
  // Get pattern replacement settings from store
  const { patternReplacementSettings } = useCharacterStore.getState();

  const replacements = {
    memory: "",
    char: character?.name || "",
    char_description: character?.description || "",
    user: user?.name || "",
    user_description: user?.description || "",
    scenario: character?.scenario || "",
    tools: patternReplacementSettings?.prompt || "",
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
      // Current active character
      character: {
        id: "default",
        name: "Hayeon",
        avatarURL:
          "https://github.com/neuezxc/custom-chats/blob/develop/public/urgirl/hayeon-moving.gif?raw=true",
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
      // All characters
      characters: [
        {
          id: "default",
          name: "Hayeon",
          avatarURL:
            "https://github.com/neuezxc/custom-chats/blob/develop/public/urgirl/hayeon-moving.gif?raw=true",
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
        {
          id: "2",
          name: "Dummy",
          avatarURL: "https://i.postimg.cc/qqk3GjHQ/image.jpg",
          bio: `i'm dummy`,
          description: `
        `,
          scenario: `
              
        `,
          firstMessage: `
You dummy!
`.replace(/{{user}}/g, useUserStore.getState().user.name),
          messages: [],
        },
      ],
      isLoading: false,
      isCharacterModalOpen: false,
      isPatternReplacementModalOpen: false,
      patternReplacementSettings: {
        prompt: "",
        findPattern: "",
        replacePattern: "",
        isRegex: true,
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
      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),
      // Character modal state
      setCharacterModal: (isOpen) => set({ isCharacterModalOpen: isOpen }),
      // Edit a message at a specific index
      editMessage: (index, newContent) => {
        set((state) => ({
          character: {
            ...state.character,
            messages: state.character.messages.map((message, i) =>
              i === index ? { ...message, content: newContent } : message
            ),
          },
        }));
      },
      // Edit a user message and regenerate the character's response
      editUserMessageAndRegenerate: async (index, newContent) => {
        // Get required stores
        const { api_key, model_id } = useApiSettingStore.getState();
        const { setLoading } = get();

        // Update the user message
        set((state) => ({
          character: {
            ...state.character,
            messages: state.character.messages.map((message, i) =>
              i === index ? { ...message, content: newContent } : message
            ),
          },
        }));

        // Remove all messages after the edited user message
        set((state) => ({
          character: {
            ...state.character,
            messages: state.character.messages.slice(0, index + 1),
          },
        }));

        // Set loading state
        setLoading(true);

        try {
          // Get the current messages (up to and including the edited user message)
          const currentMessages = get().character.messages;

          // Make API call to regenerate the character's response
          const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${api_key}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: model_id,
                messages: currentMessages,
              }),
            }
          );

          const data = await response.json();

          // Error handling for API response
          if (!response.ok) {
            throw new Error(data.error?.message || "API request failed");
          }
          if (!data.choices || data.choices.length === 0) {
            throw new Error("No choices returned from API");
          }

          const text = data.choices[0].message.content;

          // Add the character's new response
          set((state) => ({
            character: {
              ...state.character,
              messages: [
                ...state.character.messages,
                {
                  role: "assistant",
                  content: text,
                },
              ],
            },
          }));
        } catch (error) {
          console.error(
            "Error regenerating character response:",
            error.message
          );
        } finally {
          // Reset loading state
          setLoading(false);
        }
      },
      // Delete a message at a specific index
      deleteMessage: (index) => {
        // Prevent deletion of system messages
        if (index === 0 && get().character.messages[0].role === "system") {
          console.warn("Cannot delete system message");
          return;
        }

        set((state) => ({
          character: {
            ...state.character,
            messages: state.character.messages.filter((_, i) => i !== index),
          },
        }));
      },
      // Pattern replacement modal state
      setPatternReplacementModal: (isOpen) =>
        set({ isPatternReplacementModalOpen: isOpen }),
      // Pattern replacement settings
      setPatternReplacementSettings: (settings) =>
        set({ patternReplacementSettings: settings }),

      // Character management functions
      // Add a new character
      addCharacter: (newCharacter) =>
        set((state) => ({
          characters: [
            ...state.characters,
            { ...newCharacter, id: Date.now().toString() },
          ],
        })),

      // Update an existing character
      updateCharacter: (updatedCharacter) =>
        set((state) => {
          // Check if the updated character is the active character
          const isUpdatingActiveCharacter =
            state.character.id === updatedCharacter.id;

          return {
            characters: state.characters.map((char) =>
              char.id === updatedCharacter.id ? updatedCharacter : char
            ),
            // Also update the active character if it's the one being updated
            ...(isUpdatingActiveCharacter
              ? { character: updatedCharacter }
              : {}),
          };
        }),

      // Delete a character
      deleteCharacter: (characterId) =>
        set((state) => ({
          characters: state.characters.filter(
            (char) => char.id !== characterId
          ),
        })),

      // Set active character
      setActiveCharacter: (characterId) =>
        set((state) => {
          const selectedCharacter = state.characters.find(
            (char) => char.id === characterId
          );
          if (selectedCharacter) {
            return {
              character: selectedCharacter,
            };
          }
          return state;
        }),
    }),
    {
      name: "character-storage",
    }
  )
);

export default useCharacterStore;
