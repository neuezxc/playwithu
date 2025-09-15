import React, { useState } from "react";
import useCharacterStore from "../store/useCharacterStore";
import { useRef, useEffect } from "react";
import { Edit, Trash2, Loader2 } from "lucide-react";

function ChatList() {
  const { character, editMessage, deleteMessage, isLoading } = useCharacterStore();
  const messages = character.messages;
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState(null);
 // Find indices of the most recent user and assistant messages
  let lastUserMessageIndex = -1;
  let lastAssistantMessageIndex = -1;
  
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user" && lastUserMessageIndex === -1) {
      lastUserMessageIndex = i;
    } else if (messages[i].role === "assistant" && lastAssistantMessageIndex === -1) {
      lastAssistantMessageIndex = i;
    }
    
    // Break early if we found both
    if (lastUserMessageIndex !== -1 && lastAssistantMessageIndex !== -1) {
      break;
    }
  }

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

  const handleEditClick = (id, content) => {
    // Prevent editing system messages
    if (id === 0 && messages[0].role === "system") {
      return;
    }
    // Only allow editing the most recent user or assistant message
    if (id !== lastUserMessageIndex && id !== lastAssistantMessageIndex) {
      return;
    }
    setEditingMessageId(id);
    setEditContent(content);
  };

  const handleSaveEdit = (id) => {
    editMessage(id, editContent);
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleDeleteClick = (id) => {
    // Prevent deletion of system messages
    if (id === 0 && messages[0].role === "system") {
      return;
    }
    // Only allow deleting the most recent user or assistant message
    if (id !== lastUserMessageIndex && id !== lastAssistantMessageIndex) {
      return;
    }
    setDeletingMessageId(id);
  };

  const confirmDelete = (id) => {
    deleteMessage(id);
    setDeletingMessageId(null);
  };

  const cancelDelete = () => {
    setDeletingMessageId(null);
  };

  return (
    <main className="flex-1 w-full max-w-2xl px-5 lg:px-14 overflow-y-auto">
      <div className="flex flex-col gap-6 py-6">
        {messages.map((message, id) => {
          if (message.role === "assistant") {
            return (
              <CharacterChat
                text={characterChatReplacerDisplay(message)}
                character={character}
                key={id}
                messageId={id}
                messageContent={message.content}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isEditing={editingMessageId === id}
                editContent={editContent}
                setEditContent={setEditContent}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                isDeleting={deletingMessageId === id}
                onConfirmDelete={confirmDelete}
                onCancelDelete={cancelDelete}
                isRecentMessage={id === lastAssistantMessageIndex}
              />
            );
          } else if (message.role === "user") {
            return (
              <UserChat
                text={message.content}
                key={id}
                messageId={id}
                messageContent={message.content}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isEditing={editingMessageId === id}
                editContent={editContent}
                setEditContent={setEditContent}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                isDeleting={deletingMessageId === id}
                onConfirmDelete={confirmDelete}
                onCancelDelete={cancelDelete}
                isRecentMessage={id === lastUserMessageIndex}
              />
            );
          }
        })}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-[50px] h-[50px] bg-[#393A39] rounded-lg flex-shrink-0 overflow-hidden items-center justify-center">
              {character.avatarURL ? (
                <img
                  src={character.avatarURL}
                  className="object-cover w-full h-full"
                />
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-[#E4E4E4]">
                  {character.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#3A9E49] animate-spin" />
                <span className="text-sm text-[#CDCDCD]">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </main>
  );
}

function CharacterChat({
 text,
  character,
 messageId,
  messageContent,
  onEdit,
  onDelete,
  isEditing,
  editContent,
  setEditContent,
  onSaveEdit,
  onCancelEdit,
  isDeleting,
  onConfirmDelete,
  onCancelDelete,
  isRecentMessage
}) {
  // Process the text to apply styling
  const processText = (inputText) => {
    if (!inputText) return "";
    // Replace "text" with span having primary color
    let processed = inputText.replace(
      /"(.*?)"/g,
      '<span style="font-weight: bold;">$1</span>'
    );

    return processed;
  };

  const processedText = processText(text);

  // Don't show edit/delete buttons for system messages
  const isSystemMessage = messageId === 0 && messageContent.role === "system";

  return (
    <div className="flex items-start gap-3">
      <div className="w-[50px] h-[50px] bg-[#393A39] rounded-lg flex-shrink-0 overflow-hidden items-center justify-center">
        {/* You can place an <img /> tag here for the character's avatar */}
        {character.avatarURL ? (
          <img
            src={character.avatarURL}
            className="object-cover w-full h-full"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-[#E4E4E4]">
            {character.name}
          </span>
       </div>
        
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              className="w-full bg-[#242524] border border-[#333333] rounded-lg p-2 text-sm text-[#CDCDCD] resize-y h-[100px] max-h-[200px] outline-none focus:border-[#3A9E49]"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onSaveEdit(messageId)}
                className="px-3 py-1 bg-[#3A9E49]/30 border border-[#3A9E49] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#3A9E49]/50 transition-colors"
              >
                Save
              </button>
              <button
                onClick={onCancelEdit}
                className="px-3 py-1 bg-[#242524] border border-[#333333] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#33333] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isDeleting ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#CDCDCD]">Are you sure you want to delete this message?</p>
            <div className="flex gap-2">
              <button
                onClick={() => onConfirmDelete(messageId)}
                className="px-3 py-1 bg-red-500/30 border border-red-500 rounded-lg text-sm text-[#E4E4E4] hover:bg-red-500/50 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={onCancelDelete}
                className="px-3 py-1 bg-[#242524] border border-[#333333] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#333333] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            className="text-sm font-normal text-[#CDCDCD] flex flex-col gap-4"
            dangerouslySetInnerHTML={{ __html: processedText }}
          />
        )}
          {!isSystemMessage && !isEditing && !isDeleting && isRecentMessage && (
            <div className="flex opacity-50 gap-2 mt-2">
              <button
                onClick={() => onEdit(messageId, messageContent)}
                className=" text-[#A2A2A2] hover:text-[#E4E4E4] transition-colors"
                aria-label="Edit message"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(messageId)}
                className=" text-[#A2A2A2] hover:text-red-400 transition-colors"
                aria-label="Delete message"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
 
      </div>

    </div>
  );
}

function UserChat({
  text,
  messageId,
  messageContent,
  onEdit,
  onDelete,
  isEditing,
  editContent,
  setEditContent,
  onSaveEdit,
  onCancelEdit,
  isDeleting,
  onConfirmDelete,
  onCancelDelete,
  isRecentMessage
}) {
  const processText = (inputText) => {
    if (!inputText) return "";
    // Replace "text" with span having primary color
    let processed = inputText.replace(
      /"(.*?)"/g,
      '<span style="font-weight: bold;">$1</span>'
    );

    return processed;
  };

  const processedText = processText(text);

  // Don't show edit/delete buttons for system messages
  const isSystemMessage = messageId === 0 && messageContent.role === "system";

  return (
    <div className="flex justify-end">
        {!isSystemMessage && !isEditing && !isDeleting && isRecentMessage && (
          <div className="flex items-center mb-2 gap-2 mr-2 opacity-40">
            <button
              onClick={() => onEdit(messageId, messageContent)}
              className=" text-[#A2A2A2] hover:text-white/100 transition-colors"
              aria-label="Edit message"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(messageId)}
              className=" text-[#A2A2A2] hover:text-red-400 transition-colors"
              aria-label="Delete message"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}


      <div className="bg-[#242524] border border-[#333333] rounded-2xl p-4 max-w-lg flex flex-col">
        
        {isEditing ? (
          <div className="flex flex-col gap-2 min:w-full w-[300px] ">
            <textarea
              className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#3A9E49] outline-none  rounded-lg p-2 text-sm text-[#CDCDCD] "
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={5}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onSaveEdit(messageId)}
                className="px-3 py-1 bg-[#3A9E49]/30 border border-[#3A9E49] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#3A9E49]/50 transition-colors"
              >
                Save
              </button>
              <button
                onClick={onCancelEdit}
                className="px-3 py-1 bg-[#1A1A1A] border border-[#333333] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#33333] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isDeleting ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#CDCDCD]">Are you sure you want to delete this message?</p>
            <div className="flex gap-2">
              <button
                onClick={() => onConfirmDelete(messageId)}
                className="px-3 py-1 bg-red-500/30 border border-red-500 rounded-lg text-sm text-[#E4E4E4] hover:bg-red-500/50 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={onCancelDelete}
                className="px-3 py-1 bg-[#1A1A1A] border border-[#333333] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#333333] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            className="text-sm font-normal text-[#CDCDCD]"
            dangerouslySetInnerHTML={{ __html: processedText }}
          />
        )}

      </div>
    </div>
  );
}

export default ChatList;
