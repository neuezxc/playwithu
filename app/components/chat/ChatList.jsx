"use client";

import React, { useState } from "react";
import useCharacterStore from "../../store/useCharacterStore";
import { useRef, useEffect } from "react";
import { Edit, Trash2, Loader2, Grid } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import CharacterChat from "./CharacterChat";
import UserChat from "./UserChat";

function ChatList() {
  const {
    character,
    editMessage,
    deleteMessage,
    isLoading,
    editUserMessageAndRegenerate,
    regenerateLastMessage,
    navigateMessage,
  } = useCharacterStore();
  const messages = character.messages;
  const firstVisibleMessageIndex = messages.findIndex(m => m.role !== "system");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  // Find indices of the most recent user and assistant messages
  let lastUserMessageIndex = -1;
  let lastAssistantMessageIndex = -1;

  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user" && lastUserMessageIndex === -1) {
      lastUserMessageIndex = i;
    } else if (
      messages[i].role === "assistant" &&
      lastAssistantMessageIndex === -1
    ) {
      lastAssistantMessageIndex = i;
    }

    // Break early if we found both
    if (lastUserMessageIndex !== -1 && lastAssistantMessageIndex !== -1) {
      break;
    }
  }

  // Inside your component
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // This will run whenever messages change

  const handleEditClick = (id, content) => {
    // Prevent editing system messages or the first message
    if (id === firstVisibleMessageIndex) {
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
    // Check if the message being edited is a user message or character message
    const message = messages[id];
    if (message.role === "user") {
      // For user messages, edit and regenerate character response
      editUserMessageAndRegenerate(id, editContent);
    } else {
      // For character messages, just edit the message
      editMessage(id, editContent);
    }
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleDeleteClick = (id) => {
    // Prevent deletion of system messages or the first message
    if (id === firstVisibleMessageIndex) {
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
          // Hide the last assistant message while regenerating
          if (isLoading && id === messages.length - 1 && message.role === "assistant") {
            return null;
          }

          if (message.role === "assistant") {
            return (
              <CharacterChat
                text={message}
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
                isFirstMessage={id === firstVisibleMessageIndex}
                onRegenerate={regenerateLastMessage}
                onNavigate={(direction) => navigateMessage(id, direction)}
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
                isFirstMessage={id === firstVisibleMessageIndex}
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


export default ChatList;
