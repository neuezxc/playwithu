import React from "react";
import { Settings2, CodeXml, ArrowUp} from "lucide-react";
import useApiSettingStore from "../store/useApiSettingStore";

function SuperInput() {
  const { api_key, model_id } = useApiSettingStore();
  const setModal = useApiSettingStore((state) => state.setModal);

  const handleMessage = async () => {
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
            messages: [
              {
                role: "user",
                content: "What is the meaning of life?",
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text = data.choices[0].message.content;
      console.log(text);
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  return (
    <footer className="flex flex-col items-center w-full p-4">
      <div className="w-full max-w-xl bg-[#212121] border border-[#282828] rounded-2xl p-3 flex flex-col gap-3">
        <textarea
          className="w-full bg-transparent text-[#CDCDCD] text-base placeholder:text-[#A2A2A2] resize-none outline-none"
          placeholder="Enter to send chat + Enter for linebreak."
          rows={3}
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

export default SuperInput;
