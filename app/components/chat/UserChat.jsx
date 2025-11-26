import React from "react";
import { Edit, Trash2, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { processText } from "../../utils/textUtils";
import { useState } from "react";

export default function UserChat({
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
    isRecentMessage,
    isFirstMessage,
}) {
    const [copied, setCopied] = useState(false);

    const processedText = processText(text);

    // Don't show edit/delete buttons for system messages
    const isSystemMessage = messageId === 0 && messageContent.role === "system";

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex justify-end group">
            {!isSystemMessage && !isEditing && !isDeleting && isRecentMessage && (
                <div className="flex items-center mb-2 gap-2 mr-2 opacity-40">
                    <button
                        onClick={handleCopy}
                        className="text-[#A2A2A2] hover:text-white/100 transition-colors"
                        aria-label="Copy message"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    {!isFirstMessage && (
                        <>
                            <button
                                onClick={() => onEdit(messageId, messageContent)}
                                className="text-[#A2A2A2] hover:text-white/100 transition-colors"
                                aria-label="Edit message"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(messageId)}
                                className="text-[#A2A2A2] hover:text-red-400 transition-colors"
                                aria-label="Delete message"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
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
                        <p className="text-sm text-[#CDCDCD]">
                            Are you sure you want to delete this message?
                        </p>
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
                    <div className="text-sm font-normal text-[#CDCDCD]">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{processedText}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}
