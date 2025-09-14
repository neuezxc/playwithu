import { create } from "zustand";
import { persist } from "zustand/middleware";
import usePromptStore from "./usePromptStore";

const replacerTemplate = (template, character) => {
  const replacements = {
    memory: "",
    char: character?.name || "",
    char_description: character?.description || "",
  };
  
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (match, key) => replacements[key] || ""
  );
};



const useCharacterStore = create(
  persist(
    (set, get) => ({
      character: {
        name: "Hayeon",
        avatarURL: "",
        bio: "streamer",
        description: "hayeon 23, streamer have million views",
        scenario: "living together with user",
        firstMessage: "YOOOOO?",
        messages: [],
      },
      //RENDER FIRST AS DEFAULT
      isInitialized: false,
      initializeMessage: () => {
        if (get().isInitialized) return;
        const currentFirstMessage = get().character.firstMessage;
        const system_prompt = usePromptStore.getState().system_prompt;
        const processedPrompt = replacerTemplate(system_prompt, get().character); 

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
        const processedPrompt = replacerTemplate(system_prompt, get().character); 


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
        const processedPrompt = replacerTemplate(newPrompt, get().character); 

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
