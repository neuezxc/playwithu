import { Settings2, CodeXml, ArrowUp } from "lucide-react";
import useApiSettingStore from "../store/useApiSettingStore";
import useCharacterStore from "../store/useCharacterStore";
import useUserStore from "../store/useUserStore";

export default function SuperInput() {
  const { api_key, model_id } = useApiSettingStore();
  const setModal = useApiSettingStore((state) => state.setModal);
  const { character } = useCharacterStore();
  const { user } = useUserStore();
  const setUser = useUserStore((state) => state.setUser);
  const setCharacter = useCharacterStore((state) => state.setCharacter);

  const handleMessage = async () => {
  try {
    const updatedMessage = [...character.messages, {role: "user", content: user.message}]; 
    // Update UI immediately for better UX
    setCharacter({ ...character, messages: updatedMessage });
    setUser({ ...user, message: "" });

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
          messages: updatedMessage, // Use the updated messages array
        }),
      }
    );

    const data = await response.json();
    
    // Error handling for API response
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No choices returned from API');
    }

    const text = data.choices[0].message.content;
    
    setCharacter({
      ...character,
      messages: [
        ...updatedMessage, // Use the updatedMessage array that includes user message
        {
          role: "assistant",
          content: text,
        },
      ],
    });
  } catch (error) {
    console.error("Error sending message:", error.message);
    // You might want to revert the user message or show an error to the user
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
    <footer className="flex flex-col items-center w-full p-4">
      <div className="w-full max-w-xl bg-[#212121] border border-[#282828] rounded-2xl p-3 flex flex-col gap-3">
        <textarea
          className="w-full bg-transparent text-[#CDCDCD] text-base placeholder:text-[#A2A2A2] resize-none outline-none"
          placeholder="Enter to send chat + Enter for linebreak."
          rows={3}
          value={user.message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
        ></textarea>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setModal(true)}
              className="flex items-center justify-center w-8 h-8 bg-white/10 border border-[#454545] rounded-lg hover:bg-[#3A9E49]/30 hover:border-[#3A9E49] transition-all"
            >
              <Settings2 size={16} />
            </button>
            <button className="flex items-center justify-center w-8 h-8 bg-white/10 border border-[#454545] rounded-lg hover:bg-[#3A9E49]/30 hover:border-[#3A9E49] transition-all ">
              <CodeXml size={18} className="" />
            </button>
            <button className="flex items-center justify-center px-3 h-8 bg-white/10 border border-[#454545] rounded-lg hover:bg-[#3A9E49]/30 hover:border-[#3A9E49] transition-all">
              <span className="text-sm font-medium text-[#EEEEEE]">
                Characters
              </span>
            </button>
          </div>
          <button
            onClick={handleMessage}
            className="flex items-center justify-center w-8 h-8 bg-[#3A9E49]/30 border border-[#3A9E49] rounded-lg hover:bg-[#3A9E49]/50 transition-colors"
          >
            <ArrowUp size={16} className="text-[#D3D3D3]" />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-2 text-xs font-normal text-[#656565]">
        This is an AI-generated persona, not a real person.
      </p>
    </footer>
  );
}
