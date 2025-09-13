import React from "react";

function ChatList() {
  return (
    <main className="flex-1 w-full max-w-2xl px-4 overflow-y-auto">
      <div className="flex flex-col gap-6 py-6 mx-[50px]">
        {/* Character's Chat Message */}
        <div className="flex items-start gap-3">
          <div className="w-[50px] h-[50px] bg-[#393A39] rounded-lg flex-shrink-0">
            {/* You can place an <img /> tag here for the character's avatar */}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-base font-medium text-[#E4E4E4]">
              Character Name:
            </span>
            <p className="text-sm font-normal text-[#CDCDCD]">
              Hey there! The usual today? Or are we feeling adventurous and
              trying something new?
            </p>
          </div>
        </div>

        {/* User's Chat Message */}
        <div className="flex justify-end">
          <div className="bg-[#242524] border border-[#333333] rounded-2xl p-4 max-w-sm">
            <p className="text-sm font-normal text-[#CDCDCD]">
              Hmm, maybe something new. What do you recommend that's not too
              sweet?
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ChatList;
