"use client";

import { ArrowUp, Users } from "lucide-react";
import useApiSettingStore from "../store/useApiSettingStore";
import useCharacterStore from "../store/useCharacterStore";
import useUserStore from "../store/useUserStore";
import useMemoryStore from "../store/useMemoryStore";
import usePromptStore from "../store/usePromptStore";
import useDebugStore from "../store/useDebugStore";
import { replacePlaceholders } from "../utils/replacerTemplate";
import CharacterModal from "./modal/CharacterModal";
import CustomPromptModal from "./modal/CustomPromptModal";
import PatternReplacementModal from "./modal/PatternReplacementModal";
import DebugModal from "./modal/DebugModal";
import InputMenu from "./InputMenu";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SuperInput() {
  const { api_key, model_id, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = useApiSettingStore();
  const setModal = useApiSettingStore((state) => state.setModal);
  const setModalMemory = useMemoryStore((state) => state.setModal);
  const { character, isCharacterModalOpen } = useCharacterStore();
  const setCharacterModal = useCharacterStore((state) => state.setCharacterModal);
  const { user } = useUserStore();
  const setUser = useUserStore((state) => state.setUser);
  const setCharacter = useCharacterStore((state) => state.setCharacter);
  const resetMessage = useCharacterStore((state) => state.resetMessage);
  const setSummarizeText = useMemoryStore((state) => state.setSummarizeText);
  const setActive = useMemoryStore((state) => state.setActive);
  const setLoading = useCharacterStore((state) => state.setLoading);
  const [isCustomPromptOpen, setIsCustomPromptOpen] = useState(false);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const setPatternReplacementModal = useCharacterStore((state) => state.setPatternReplacementModal);
  const router = useRouter();

  const handleMessage = async () => {
    if (!user.message.trim()) return;
    if (user.message.startsWith("/")) {
      const command = user.message.trim().toLowerCase();
      if (command === "/reset") {
        resetMessage();
        setSummarizeText("");
        setActive(false);
        setUser({ ...user, message: "" });
        console.log("Conversation reset");
      } else if (command === "/characters") {
        router.push("/characters");
        setUser({ ...user, message: "" });
        return;
      } else if (command === "/dbg") {
        setIsDebugModalOpen(true);
        setUser({ ...user, message: "" });
        return;
      }

      return;
    }

    try {
      const updatedMessage = [
        ...character.messages,
        { role: "user", content: user.message },
      ];
      // Update UI immediately for better UX
      setCharacter({ ...character, messages: updatedMessage });
      setUser({ ...user, message: "" });

      // Set loading state
      setLoading(true);

      // Get the effective prompt (custom or default)
      const { getEffectivePrompt } = usePromptStore.getState();
      const promptTemplate = getEffectivePrompt();

      // Get character and user data for placeholder replacement
      const { character: charData } = useCharacterStore.getState();
      const { user: userData } = useUserStore.getState();
      const { summarizeText } = useMemoryStore.getState();
      const { patternReplacements } = useCharacterStore.getState();

      // Replace placeholders in the prompt
      const processedPrompt = replacePlaceholders(promptTemplate, {
        char: charData.name || "AI Assistant",
        user: userData.name || "User",
        char_description: charData.description || "",
        user_description: userData.description || "",
        scenario: charData.scenario || "",
        memory: summarizeText || "",
        tools: patternReplacements
          .filter((p) => p.active && p.prompt)
          .map((p) => p.prompt)
          .join("\n"),
      });

      // Update the system prompt in the character store
      const { updateSystemPrompt } = useCharacterStore.getState();
      updateSystemPrompt(processedPrompt);

      // Update the first message in updatedMessage to ensure it has the latest processed prompt
      // The first message should be the system prompt
      const messagesWithPrompt = updatedMessage.map((message, index) => {
        if (index === 0 && message.role === "system") {
          return { ...message, content: processedPrompt };
        }
        return message;
      });

      // Get debug store
      const { addLog } = useDebugStore.getState();

      // Log the request
      addLog({
        type: "api",
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        request: {
          model: model_id,
          messages: messagesWithPrompt,
        }
      });

      try {
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
              messages: messagesWithPrompt, // Use the messages array with the processed prompt
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
            messages: messagesWithPrompt,
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

        setCharacter({
          ...character,
          messages: [
            ...messagesWithPrompt, // Use the messagesWithPrompt array that includes the updated system prompt
            {
              role: "assistant",
              content: text,
            },
          ],
        });
      } catch (error) {
        // Log the error
        addLog({
          type: "api",
          endpoint: "https://openrouter.ai/api/v1/chat/completions",
          error: error.message,
          request: {
            model: model_id,
            messages: messagesWithPrompt,
          }
        });

        throw error;
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
      // You might want to revert the user message or show an error to the user
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  //Textarea
  const handleInput = (e) => {
    setUser({ ...user, message: e.target.value });
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessage();
    }
  };

  return (
    <footer className="flex flex-col items-center w-full lg:p-4">
      <div className="w-full max-w-xl bg-[#212121]/80 border border-[#282828] lg:rounded-2xl rounded-t-2xl p-4 flex flex-col gap-3">
        <textarea
          className="w-full bg-transparent text-[#CDCDCD] text-base placeholder:text-[#A2A2A2] resize-none outline-none h-[40px] lg:h-[auto]"
          placeholder="Enter to send chat + Enter for linebreak."
          rows={3}
          value={user.message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
        ></textarea>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <InputMenu
              setIsCustomPromptOpen={setIsCustomPromptOpen}
              setIsDebugModalOpen={setIsDebugModalOpen}
            />
            <button
              onClick={() => router.push("/characters")}
              className="flex items-center justify-center w-8 h-8 bg-white/5 border border-[#454545] rounded-lg hover:bg-[#3A9E49]/30 hover:border-[#3A9E49] transition-all"
              title="All Characters"
            >
              <Users size={16} className="text-[#EEEEEE]" />
            </button>
            <button
              onClick={() => setCharacterModal(true)}
              className="flex items-center justify-center px-3 h-8 bg-white/5 border border-[#454545] rounded-lg hover:bg-[#3A9E49]/30 hover:border-[#3A9E49] transition-all"
            >
              <span className="text-sm font-medium text-[#EEEEEE]">
                Character
              </span>
            </button>
          </div>
          <button
            onClick={handleMessage}
            className="flex items-center justify-center w-8 h-8 bg-[#3A9E49]/30 border border-[#3A9E49] rounded-lg text-white hover:bg-[#3A9E49]/50 transition-colors"
          >
            <ArrowUp size={18} className="text-[#D3D3D3]" />
          </button>
        </div>
      </div>

      {/* Character Modal */}
      {isCharacterModalOpen && <CharacterModal prefillActive={true} />}


      {/* Pattern Replacement Modal */}
      <PatternReplacementModal />

      {/* Custom Prompt Modal */}
      {isCustomPromptOpen && <CustomPromptModal onClose={() => setIsCustomPromptOpen(false)} />}

      {/* Debug Modal */}
      {isDebugModalOpen && <DebugModal onClose={() => setIsDebugModalOpen(false)} />}

      {/* Disclaimer */}
      <p className="mt-2 text-xs font-normal text-[#656565] hidden">
        This is an AI-generated persona, not a real person.
      </p>
    </footer>
  );
}
