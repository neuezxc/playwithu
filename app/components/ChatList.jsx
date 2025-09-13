import React from "react";
import useCharacterStore from "../store/useCharacterStore";

function ChatList() {
  const { character } = useCharacterStore();
  console.log(character);

  const messages = character.messages;
  return (
    <main className="flex-1 w-full max-w-2xl px-4 overflow-y-auto">
      <div className="flex flex-col gap-6 py-6 mx-[50px]">
        {messages.map((message) => {
          console.log(messages);
          if (message.role === "assistant") {
            return (
              <CharacterChat text={message.content} character={character} />
            );
          } else if (message.role === "user") {
            return <UserChat text={message.content} />;
          }
        })}
      </div>
    </main>
  );
}

function CharacterChat({ text, character }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-[50px] h-[50px] bg-[#393A39] rounded-lg flex-shrink-0">
        {/* You can place an <img /> tag here for the character's avatar */}
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-base font-medium text-[#E4E4E4]">
          {character.name}
        </span>
        <p className="text-sm font-normal text-[#CDCDCD]">{text}</p>
      </div>
    </div>
  );
}
function UserChat({ text }) {
  return (
    <div className="flex justify-end">
      <div className="bg-[#242524] border border-[#333333] rounded-2xl p-4 max-w-sm">
        <p className="text-sm font-normal text-[#CDCDCD]">{text}</p>
      </div>
    </div>
  );
}

export default ChatList;
