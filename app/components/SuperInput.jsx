"use client";

import { useState, useRef } from "react";
import { ArrowUp, Users, Square } from "lucide-react";
import useApiSettingStore from "../store/useApiSettingStore";
import useCharacterStore from "../store/useCharacterStore";
import useUserStore from "../store/useUserStore";
import useMemoryStore from "../store/useMemoryStore";
import usePromptStore from "../store/usePromptStore";
import useDebugStore from "../store/useDebugStore";
import { replacePlaceholders, buildPlaceholderValues } from "../utils/replacerTemplate"
import CharacterModal from "./modal/CharacterModal";
import CustomPromptModal from "./modal/CustomPromptModal";
import PatternReplacementModal from "./modal/PatternReplacementModal";
import DebugModal from "./modal/DebugModal";
import InputMenu from "./InputMenu";
import { useRouter } from "next/navigation";

export default function SuperInput() {
  const { api_endpoint, api_key, model_id, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = useApiSettingStore();
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
  const isLoading = useCharacterStore((state) => state.isLoading);
  const abortControllerRef = useRef(null);
  const router = useRouter();

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

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

      // Build structured debug data before async boundary
      const promptContent = usePromptStore.getState().getActivePromptContent();
      const activePrompt = usePromptStore.getState().getActivePrompt();
      const values = buildPlaceholderValues();
      const processedPrompt = replacePlaceholders(promptContent, values);
      const lastUserMsg = user.message;

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
        characterName: character.name,
        promptName: activePrompt?.name || "Unknown",
        resolvedSystemPrompt: processedPrompt,
        lastUserMessage: lastUserMsg,
        lastAiResponse: "",
        url: "",
        headers: {},
        params: { model: model_id, temperature, max_tokens, top_p },
        messages: messagesWithPrompt,
      });

      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const fetchUrl = api_endpoint;
        
        const headers = {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Title": "PlayWithU",
          "HTTP-Referer": window.location.origin,
        };
        if (api_key) {
          const cleanKey = api_key.startsWith('Bearer ') ? api_key.substring(7) : api_key;
          headers["Authorization"] = `Bearer ${cleanKey}`;
        }

        const body = {
          model: model_id,
          messages: messagesWithPrompt,
          temperature: temperature,
          top_p: top_p,
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
            signal: controller.signal,
          }
        );

        const data = await response.json().catch(() => ({}));

        // Error handling for API response
        if (!response.ok) {
          const errorMessage = data.error?.message || response.statusText || "API request failed";
          throw new Error(`${errorMessage} (${response.status})`);
        }
        if (!data.choices || data.choices.length === 0) {
          throw new Error("No choices returned from API");
        }

        const text = data.choices[0].message.content;

        // Log the response
        addLog({
          characterName: character.name,
          promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
          resolvedSystemPrompt: processedPrompt,
          lastUserMessage: lastUserMsg,
          lastAiResponse: text,
          url: fetchUrl,
          headers: headers,
          params: { model: model_id, temperature, max_tokens, top_p },
          messages: messagesWithPrompt,
        });

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
          characterName: character.name,
          promptName: usePromptStore.getState().getActivePrompt()?.name || "Unknown",
          resolvedSystemPrompt: processedPrompt,
          lastUserMessage: lastUserMsg,
          lastAiResponse: "",
          url: fetchUrl || "",
          headers: headers || {},
          error: error.message,
          params: { model: model_id, temperature, max_tokens, top_p },
          messages: messagesWithPrompt,
        });

        throw error;
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
      // You might want to revert the user message or show an error to the user
    } finally {
      // Reset loading state
      abortControllerRef.current = null;
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
          {isLoading ? (
            <button
              onClick={handleStop}
              className="flex items-center justify-center w-8 h-8 bg-red-500/30 border border-red-500 rounded-lg text-white hover:bg-red-500/50 transition-colors"
              title="Stop generation"
            >
              <Square size={16} className="text-[#D3D3D3] fill-current" />
            </button>
          ) : (
            <button
              onClick={handleMessage}
              className="flex items-center justify-center w-8 h-8 bg-[#3A9E49]/30 border border-[#3A9E49] rounded-lg text-white hover:bg-[#3A9E49]/50 transition-colors"
            >
              <ArrowUp size={18} className="text-[#D3D3D3]" />
            </button>
          )}
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
