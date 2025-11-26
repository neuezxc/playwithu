import { create } from "zustand";
import { persist } from "zustand/middleware";
import usePromptStore from "./usePromptStore";
import useUserStore from "./useUserStore";
import useApiSettingStore from "./useApiSettingStore";
import useDebugStore from "./useDebugStore";

const replacerTemplate = (template, character, user) => {
  // Get pattern replacement settings from store
  const { patternReplacements = [] } = useCharacterStore.getState();

  const replacements = {
    memory: "",
    char: character?.name || "",
    char_description: character?.description || "",
    user: user?.name || "",
    user_description: user?.description || "",
    scenario: character?.scenario || "",
    tools: patternReplacements
      .filter((p) => p.active && p.prompt)
      .map((p) => p.prompt)
      .join("\n"),
  };

  // First pass: replace all direct placeholders
  let result = template.replace(
    /\{\{\s*(\w+)\s*\}\}/g,
    (match, key) => replacements[key.toLowerCase()] || ""
  );

  // Second pass: replace any nested placeholders that appeared from the first pass
  result = result.replace(
    /\{\{\s*(\w+)\s*\}\}/g,
    (match, key) => replacements[key.toLowerCase()] || ""
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
      patternReplacements: [], // Array of { id, prompt, findPattern, replacePattern, isRegex, active }
      //RENDER FIRST AS DEFAULT
      isInitialized: false,
      initializeMessage: () => {
        if (get().isInitialized) return;
        const currentFirstMessage = get().character.firstMessage;
        const system_prompt = usePromptStore.getState().getEffectivePrompt();
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
        const system_prompt = usePromptStore.getState().getEffectivePrompt();
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
      refreshSystemPrompt: () => {
        const system_prompt = usePromptStore.getState().getEffectivePrompt();
        get().updateSystemPrompt(system_prompt);
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
        const { api_key, model_id, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = useApiSettingStore.getState();
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

          // Get debug store
          const { addLog } = useDebugStore.getState();

          // Log the request
          addLog({
            type: "api",
            endpoint: "https://openrouter.ai/api/v1/chat/completions",
            request: {
              model: model_id,
              messages: currentMessages,
            }
          });

          try {
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
                  temperature: temperature,
                  max_tokens: max_tokens,
                  top_p: top_p,
                  frequency_penalty: frequency_penalty,
                  presence_penalty: presence_penalty,
                }),
              }
            );

            const data = await response.json();

            // Log the response
            addLog({
              type: "api",
              endpoint: "https://openrouter.ai/api/v1/chat/completions",
              response: data,
              request: {
                model: model_id,
                messages: currentMessages,
              }
            });

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
            // Log the error
            addLog({
              type: "api",
              endpoint: "https://openrouter.ai/api/v1/chat/completions",
              error: error.message,
              request: {
                model: model_id,
                messages: currentMessages,
              }
            });

            throw error;
          }
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
      // Regenerate the last message
      regenerateLastMessage: async () => {
        const { api_key, model_id, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = useApiSettingStore.getState();
        const { setLoading } = get();
        const messages = get().character.messages;

        // Ensure the last message is from the assistant
        if (messages.length === 0 || messages[messages.length - 1].role !== "assistant") {
          return;
        }

        const lastMessageIndex = messages.length - 1;

        // Context is everything before the last message
        const contextMessages = messages.slice(0, -1);

        setLoading(true);

        try {
          const { addLog } = useDebugStore.getState();

          addLog({
            type: "api",
            endpoint: "https://openrouter.ai/api/v1/chat/completions",
            request: {
              model: model_id,
              messages: contextMessages,
            }
          });

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
                messages: contextMessages,
                temperature: temperature,
                max_tokens: max_tokens,
                top_p: top_p,
                frequency_penalty: frequency_penalty,
                presence_penalty: presence_penalty,
              }),
            }
          );

          const data = await response.json();

          addLog({
            type: "api",
            endpoint: "https://openrouter.ai/api/v1/chat/completions",
            response: data,
            request: {
              model: model_id,
              messages: contextMessages,
            }
          });

          if (!response.ok) {
            throw new Error(data.error?.message || "API request failed");
          }
          if (!data.choices || data.choices.length === 0) {
            throw new Error("No choices returned from API");
          }

          const newContent = data.choices[0].message.content;

          // Update the message with new candidate
          set((state) => {
            const currentMessages = [...state.character.messages];
            const targetMessage = { ...currentMessages[lastMessageIndex] };

            // Initialize candidates if not present
            if (!targetMessage.candidates) {
              targetMessage.candidates = [targetMessage.content];
            }

            // Add new candidate
            targetMessage.candidates.push(newContent);
            targetMessage.currentIndex = targetMessage.candidates.length - 1;
            targetMessage.content = newContent;

            currentMessages[lastMessageIndex] = targetMessage;

            return {
              character: {
                ...state.character,
                messages: currentMessages,
              },
            };
          });

        } catch (error) {
          console.error("Error regenerating response:", error.message);
        } finally {
          setLoading(false);
        }
      },

      // Navigate between message candidates
      navigateMessage: (messageIndex, direction) => {
        set((state) => {
          const currentMessages = [...state.character.messages];
          const message = { ...currentMessages[messageIndex] };

          if (!message.candidates || message.candidates.length <= 1) return state;

          let newIndex = (message.currentIndex !== undefined ? message.currentIndex : 0);
          if (direction === 'prev') {
            newIndex = Math.max(0, newIndex - 1);
          } else if (direction === 'next') {
            newIndex = Math.min(message.candidates.length - 1, newIndex + 1);
          }

          if (newIndex !== message.currentIndex) {
            message.currentIndex = newIndex;
            message.content = message.candidates[newIndex];
            currentMessages[messageIndex] = message;

            return {
              character: {
                ...state.character,
                messages: currentMessages,
              },
            };
          }

          return state;
        });
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

      // Pattern replacement actions
      setPatternReplacements: (patterns) => set({ patternReplacements: patterns }),

      addPatternReplacement: (pattern) => {
        set((state) => ({
          patternReplacements: [...state.patternReplacements, { ...pattern, id: Date.now().toString(), active: true }]
        }));
        get().refreshSystemPrompt();
      },

      updatePatternReplacement: (id, updatedPattern) => {
        set((state) => ({
          patternReplacements: state.patternReplacements.map(p =>
            p.id === id ? { ...p, ...updatedPattern } : p
          )
        }));
        get().refreshSystemPrompt();
      },

      deletePatternReplacement: (id) => {
        set((state) => ({
          patternReplacements: state.patternReplacements.filter(p => p.id !== id)
        }));
        get().refreshSystemPrompt();
      },

      togglePatternReplacement: (id) => {
        set((state) => ({
          patternReplacements: state.patternReplacements.map(p =>
            p.id === id ? { ...p, active: !p.active } : p
          )
        }));
        get().refreshSystemPrompt();
      },

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
            // Initialize messages for the selected character
            const system_prompt = usePromptStore.getState().getEffectivePrompt();
            const processedPrompt = replacerTemplate(
              system_prompt,
              selectedCharacter,
              useUserStore.getState().user
            );

            const newMessages = [
              {
                role: "system",
                content: processedPrompt,
              },
              {
                role: "assistant",
                content: selectedCharacter.firstMessage,
              },
            ];

            return {
              character: {
                ...selectedCharacter,
                messages: newMessages,
              },
              isInitialized: true,
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
