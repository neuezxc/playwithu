import { create } from "zustand"
import { persist } from "zustand/middleware"
import usePromptStore from "./usePromptStore"
import useUserStore from "./useUserStore"
import useApiSettingStore from "./useApiSettingStore"
import useDebugStore from "./useDebugStore"
import useMemoryStore from "./useMemoryStore"
import { replacePlaceholders, buildPlaceholderValues } from "../utils/replacerTemplate"

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
`.trim(),
        messages: [],
        lorebook: { entries: [] },
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
            Hayeon is a well-known streamer, TikToker, and influencer with millions of followers across social media platforms. She has been secretly living with {{user}} for the past three years in a shared apartment. To the public, she hides their relationship to protect her image and keep her fanbase from finding out. Hayeon comes across as outgoing, playful, and attention-loving, but in private she often shows her jealous and grumpy side—especially when she feels ignored or when things don't go her way.

        `,
          firstMessage: `
*Hayeon, a popular streamer, TikToker, and influencer with millions of followers, has been secretly living with {{user}} for the past three years. To the outside world, she hides their relationship, but inside their apartment she often shows her outgoing, jealous, and sometimes grumpy side.*
*After finishing a long streaming session, Hayeon decided to take a break. She stepped out of her room, walked over to {{user}} door, and knocked twice. Without waiting too long, she slipped inside and quietly closed the door behind her.*

"Hey, babe," she said with a playful smile, "what are you up to?"
`.trim(),
          messages: [],
          lorebook: { entries: [] },
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
`.trim(),
          messages: [],
          lorebook: { entries: [] },
        },
      ],
      isLoading: false,
      isCharacterModalOpen: false,
      isPatternReplacementModalOpen: false,
      patternReplacements: [], // Array of { id, prompt, findPattern, replacePattern, isRegex, active }
      //RENDER FIRST AS DEFAULT
      isInitialized: false,
      initializeMessage: () => {
        if (get().isInitialized) return
        const promptContent = usePromptStore.getState().getActivePromptContent()
        const values = buildPlaceholderValues()
        const processedPrompt = replacePlaceholders(promptContent, values)
        const currentFirstMessage = replacePlaceholders(
          get().character.firstMessage,
          values
        )

        const newMessages = [
          { role: "system", content: processedPrompt },
          { role: "assistant", content: currentFirstMessage }
        ]
        set(state => ({
          character: { ...state.character, messages: newMessages },
          isInitialized: true
        }))
      },
      resetMessage: () => {
        const promptContent = usePromptStore.getState().getActivePromptContent()
        const values = buildPlaceholderValues()
        const processedPrompt = replacePlaceholders(promptContent, values)
        const currentFirstMessage = replacePlaceholders(
          get().character.firstMessage,
          values
        )

        const newMessages = [
          { role: "system", content: processedPrompt },
          { role: "assistant", content: currentFirstMessage }
        ]
        set(state => ({
          character: { ...state.character, messages: newMessages }
        }))
      },
      updateSystemPrompt: (newPromptContent) => {
        const values = buildPlaceholderValues()
        const processedPrompt = replacePlaceholders(newPromptContent, values)

        set(state => ({
          character: {
            ...state.character,
            messages: state.character.messages.map(message => {
              if (message.role === "system") {
                return { ...message, content: processedPrompt }
              }
              return message
            })
          }
        }))
      },
      refreshSystemPrompt: () => {
        const promptContent = usePromptStore.getState().getActivePromptContent()
        get().updateSystemPrompt(promptContent)
      },
      setCharacter: (character) => set({ character }),
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
        const { api_endpoint, api_key, model_id, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = useApiSettingStore.getState();
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

          const activePrompt = usePromptStore.getState().getActivePrompt();
          const systemMsg = currentMessages.find((m) => m.role === "system");
          const lastUserMsg = [...currentMessages].reverse().find((m) => m.role === "user");

          // Log the request
          addLog({
            characterName: get().character.name,
            promptName: activePrompt?.name || "Unknown",
            resolvedSystemPrompt: systemMsg?.content || "",
            lastUserMessage: lastUserMsg?.content || "",
            lastAiResponse: "",
            url: "",
            headers: {},
            params: { model: model_id, temperature, max_tokens, top_p },
            messages: currentMessages,
          });

          try {
            const fetchUrl = api_endpoint;
            
            const headers = {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "X-Title": "PlayWithU",
              "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
            };
            if (api_key) {
              const cleanKey = api_key.startsWith('Bearer ') ? api_key.substring(7) : api_key;
              headers["Authorization"] = `Bearer ${cleanKey}`;
            }

            const body = {
              model: model_id,
              messages: currentMessages,
              temperature: temperature,
              top_p: top_p,
              stream: true,
            };

            if (max_tokens > 0) body.max_tokens = max_tokens;
            if (frequency_penalty !== 0) body.frequency_penalty = frequency_penalty;
            if (presence_penalty !== 0) body.presence_penalty = presence_penalty;

            // Make API call to regenerate the character's response
            const response = await fetch(
              fetchUrl,
              {
                method: "POST",
                headers,
                body: JSON.stringify(body),
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              const errorMessage = errorData.error?.message || response.statusText || "API request failed";
              throw new Error(`${errorMessage} (${response.status})`);
            }

            // If streaming is not supported (e.g., proxy), simulate typewriter effect
            if (!response.body) {
              const data = await response.json().catch(() => ({}));
              if (!data.choices || data.choices.length === 0) {
                throw new Error("No choices returned from API");
              }
              const text = data.choices[0].message.content;

              const assistantMsgIndex = index + 1;

              // Add placeholder assistant message
              set((state) => {
                const msgs = [...state.character.messages];
                msgs[assistantMsgIndex] = { role: "assistant", content: "" };
                return { character: { ...state.character, messages: msgs } };
              });

              // Simulate streaming
              let revealedIndex = 0;
              const charsPerTick = 5;
              const intervalMs = 60;

              const streamInterval = setInterval(() => {
                revealedIndex += charsPerTick;
                if (revealedIndex >= text.length) {
                  revealedIndex = text.length;
                  clearInterval(streamInterval);
                  setLoading(false);
                }
                const revealedText = text.slice(0, revealedIndex);
                set((state) => {
                  const msgs = [...state.character.messages];
                  msgs[assistantMsgIndex] = { role: "assistant", content: revealedText };
                  return { character: { ...state.character, messages: msgs } };
                });
              }, intervalMs);

              // Log the final response
              addLog({
                characterName: get().character.name,
                promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
                resolvedSystemPrompt: systemMsg?.content || "",
                lastUserMessage: lastUserMsg?.content || "",
                lastAiResponse: text,
                url: fetchUrl,
                headers: headers,
                params: { model: model_id, temperature, max_tokens, top_p },
                messages: currentMessages,
              });
              return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = "";

            // The assistant message will be at index + 1 (after the edited user message)
            const assistantMsgIndex = index + 1;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");
              let streamingDone = false;

              for (const line of lines) {
                if (streamingDone) break;
                if (!line.startsWith("data:")) continue;
                const data = line.slice(5).trim();
                if (data === "[DONE]") {
                  streamingDone = true;
                  break;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) {
                    accumulatedText += content;
                    set((state) => {
                      const currentMessages = [...state.character.messages];
                      // Update or create the assistant message at the correct index
                      currentMessages[assistantMsgIndex] = {
                        role: "assistant",
                        content: accumulatedText,
                      };
                      return {
                        character: {
                          ...state.character,
                          messages: currentMessages,
                        },
                      };
                    });
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
              if (streamingDone) break;
            }

            // Log the response
            addLog({
              characterName: get().character.name,
              promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
              resolvedSystemPrompt: systemMsg?.content || "",
              lastUserMessage: lastUserMsg?.content || "",
              lastAiResponse: accumulatedText,
              url: fetchUrl,
              headers: headers,
              params: { model: model_id, temperature, max_tokens, top_p },
              messages: currentMessages,
            });
          } catch (error) {
            // Log the error
            addLog({
              characterName: get().character.name,
              promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
              resolvedSystemPrompt: systemMsg?.content || "",
              lastUserMessage: lastUserMsg?.content || "",
              lastAiResponse: "",
              url: fetchUrl || "",
              headers: headers || {},
              error: error.message,
              params: { model: model_id, temperature, max_tokens, top_p },
              messages: currentMessages,
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
        const { api_endpoint, api_key, model_id, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = useApiSettingStore.getState();
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

          const activePrompt = usePromptStore.getState().getActivePrompt();
          const systemMsg = contextMessages.find((m) => m.role === "system");
          const lastUserMsg = [...contextMessages].reverse().find((m) => m.role === "user");

          addLog({
            characterName: get().character.name,
            promptName: activePrompt?.name || "Unknown",
            resolvedSystemPrompt: systemMsg?.content || "",
            lastUserMessage: lastUserMsg?.content || "",
            lastAiResponse: "",
            url: "",
            headers: {},
            params: { model: model_id, temperature, max_tokens, top_p },
            messages: contextMessages,
          });

          const fetchUrl = api_endpoint;
          
          const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Title": "PlayWithU",
            "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
          };
          if (api_key) {
            const cleanKey = api_key.startsWith('Bearer ') ? api_key.substring(7) : api_key;
            headers["Authorization"] = `Bearer ${cleanKey}`;
          }

          const body = {
            model: model_id,
            messages: contextMessages,
            temperature: temperature,
            top_p: top_p,
            stream: true,
          };

          if (max_tokens > 0) body.max_tokens = max_tokens;
          if (frequency_penalty !== 0) body.frequency_penalty = frequency_penalty;
          if (presence_penalty !== 0) body.presence_penalty = presence_penalty;

          const response = await fetch(
            fetchUrl,
            {
              method: "POST",
              headers,
              body: JSON.stringify(body),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || response.statusText || "API request failed";
            throw new Error(`${errorMessage} (${response.status})`);
          }

          // If streaming is not supported (e.g., proxy), simulate typewriter effect
          if (!response.body) {
            const data = await response.json().catch(() => ({}));
            if (!data.choices || data.choices.length === 0) {
              throw new Error("No choices returned from API");
            }
            const text = data.choices[0].message.content;

            // Add placeholder assistant message
            set((state) => {
              const currentMessages = [...state.character.messages];
              const targetMessage = { ...currentMessages[lastMessageIndex] };
              if (!targetMessage.candidates) {
                targetMessage.candidates = [targetMessage.content];
              }
              targetMessage.candidates.push("");
              targetMessage.currentIndex = targetMessage.candidates.length - 1;
              targetMessage.content = "";
              currentMessages[lastMessageIndex] = targetMessage;

              return {
                character: {
                  ...state.character,
                  messages: currentMessages,
                },
              };
            });

            // Simulate streaming
            let revealedIndex = 0;
            const charsPerTick = 5;
            const intervalMs = 60;

            const streamInterval = setInterval(() => {
              revealedIndex += charsPerTick;
              if (revealedIndex >= text.length) {
                revealedIndex = text.length;
                clearInterval(streamInterval);
                setLoading(false);
              }
              const revealedText = text.slice(0, revealedIndex);
              set((state) => {
                const currentMessages = [...state.character.messages];
                const targetMessage = { ...currentMessages[lastMessageIndex] };
                if (!targetMessage.candidates) {
                  targetMessage.candidates = [targetMessage.content];
                }
                targetMessage.candidates[targetMessage.candidates.length - 1] = revealedText;
                targetMessage.currentIndex = targetMessage.candidates.length - 1;
                targetMessage.content = revealedText;
                currentMessages[lastMessageIndex] = targetMessage;

                return {
                  character: {
                    ...state.character,
                    messages: currentMessages,
                  },
                };
              });
            }, intervalMs);

            // Log the final response
            addLog({
              characterName: get().character.name,
              promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
              resolvedSystemPrompt: systemMsg?.content || "",
              lastUserMessage: lastUserMsg?.content || "",
              lastAiResponse: text,
              url: fetchUrl,
              headers: headers,
              params: { model: model_id, temperature, max_tokens, top_p },
              messages: contextMessages,
            });
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            let streamingDone = false;

            for (const line of lines) {
              if (streamingDone) break;
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (data === "[DONE]") {
                streamingDone = true;
                break;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  accumulatedText += content;
                  set((state) => {
                    const currentMessages = [...state.character.messages];
                    const targetMessage = { ...currentMessages[lastMessageIndex] };

                    if (!targetMessage.candidates) {
                      targetMessage.candidates = [targetMessage.content];
                    }

                    if (targetMessage.candidates.length <= 1) {
                      targetMessage.candidates.push(accumulatedText);
                    } else {
                      targetMessage.candidates[targetMessage.candidates.length - 1] = accumulatedText;
                    }
                    targetMessage.currentIndex = targetMessage.candidates.length - 1;
                    targetMessage.content = accumulatedText;
                    currentMessages[lastMessageIndex] = targetMessage;

                    return {
                      character: {
                        ...state.character,
                        messages: currentMessages,
                      },
                    };
                  });
                }
              } catch {
                // Skip invalid JSON
              }
            }
            if (streamingDone) break;
          }

          addLog({
            characterName: get().character.name,
            promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
            resolvedSystemPrompt: systemMsg?.content || "",
            lastUserMessage: lastUserMsg?.content || "",
            lastAiResponse: accumulatedText,
            url: fetchUrl,
            headers: headers,
            params: { model: model_id, temperature, max_tokens, top_p },
            messages: contextMessages,
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
            {
              ...newCharacter,
              id: Date.now().toString(),
              lorebook: newCharacter.lorebook || { entries: [] },
            },
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

      // Character lorebook entry actions
      addCharLorebookEntry: (characterId) =>
        set((state) => {
          const updateCharacterLorebook = (char) => {
            if (char.id === characterId) {
              const lorebook = char.lorebook || { entries: [] }
              return {
                ...char,
                lorebook: {
                  ...lorebook,
                  entries: [
                    ...lorebook.entries,
                    { id: Date.now().toString(), keywords: '', content: '' },
                  ],
                },
              }
            }
            return char
          }
          return {
            characters: state.characters.map(updateCharacterLorebook),
            ...(state.character.id === characterId
              ? { character: updateCharacterLorebook(state.character) }
              : {}),
          }
        }),

      updateCharLorebookEntry: (characterId, entryId, updates) =>
        set((state) => {
          const updateEntry = (char) => {
            if (char.id === characterId && char.lorebook) {
              return {
                ...char,
                lorebook: {
                  ...char.lorebook,
                  entries: char.lorebook.entries.map((entry) =>
                    entry.id === entryId ? { ...entry, ...updates } : entry
                  ),
                },
              }
            }
            return char
          }
          return {
            characters: state.characters.map(updateEntry),
            ...(state.character.id === characterId
              ? { character: updateEntry(state.character) }
              : {}),
          }
        }),

      deleteCharLorebookEntry: (characterId, entryId) =>
        set((state) => {
          const removeEntry = (char) => {
            if (char.id === characterId && char.lorebook) {
              return {
                ...char,
                lorebook: {
                  ...char.lorebook,
                  entries: char.lorebook.entries.filter(
                    (entry) => entry.id !== entryId
                  ),
                },
              }
            }
            return char
          }
          return {
            characters: state.characters.map(removeEntry),
            ...(state.character.id === characterId
              ? { character: removeEntry(state.character) }
              : {}),
          }
        }),

      // Set active character
      setActiveCharacter: (characterId) =>
        set(state => {
          const selectedCharacter = state.characters.find(
            char => char.id === characterId
          )
          if (selectedCharacter) {
            const promptContent = usePromptStore.getState().getActivePromptContent()

            // Use buildPlaceholderValues for consistent placeholder resolution
            // Temporarily set character to selectedCharacter so buildPlaceholderValues picks it up
            const previousCharacter = state.character
            const values = buildPlaceholderValues()
            // Override char-related values with selectedCharacter data
            values.char = selectedCharacter?.name || ''
            values.char_description = selectedCharacter?.description || ''
            values.scenario = selectedCharacter?.scenario || ''
            const processedPrompt = replacePlaceholders(promptContent, values)
            const processedFirstMessage = replacePlaceholders(
              selectedCharacter.firstMessage,
              values
            )

            const newMessages = [
              { role: "system", content: processedPrompt },
              { role: "assistant", content: processedFirstMessage }
            ]

            useDebugStore.getState().clearPlaceholderData();

            return {
              character: { ...selectedCharacter, messages: newMessages },
              isInitialized: true
            }
          }
          return state
        }),
    }),
    {
      name: "character-storage",
    }
  )
);

export default useCharacterStore;
