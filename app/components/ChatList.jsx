import React from "react";
import useCharacterStore from "../store/useCharacterStore";
import { useRef, useEffect } from "react";

function ChatList() {
  const { character } = useCharacterStore();
  const messages = character.messages;

  const characterChatReplacerDisplay = (message) => {
    // Replace <test> with an image or something.
    const dynamicText = message.content.replace(
      "<test>",
      "<img src='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg.freepik.com%2Fpremium-vector%2Fcute-cartoon-lucky-cat-maneki-neko-vector-illustration_773815-126.jpg%3Fw%3D2000&f=1&nofb=1&ipt=200b5aa523ae53bf6745569493d4dbb17806a6b73a3facb8eb7c7795de98e8d9' />"
    );
    return dynamicText;
  };
  // Inside your component
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // This will run whenever messages change

  return (
    <main className="flex-1 w-full max-w-2xl px-14 overflow-y-auto">
      <div className="flex flex-col gap-6 py-6">
        {messages.map((message, id) => {
          if (message.role === "assistant") {
            return (
              <CharacterChat
                text={characterChatReplacerDisplay(message)}
                character={character}
                key={id}
              />
            );
          } else if (message.role === "user") {
            return <UserChat text={message.content} key={id} />;
          }
        })}
        <div ref={messagesEndRef} />
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
        <p
          className="text-sm font-normal text-[#CDCDCD] flex flex-col gap-4"
          dangerouslySetInnerHTML={{ __html: text }}
        />
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
