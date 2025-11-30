import { Edit, Trash2, Loader2, Grid, Copy, RefreshCw, Check, ChevronLeft, ChevronRight } from "lucide-react";
import useCharacterStore from "@/app/store/useCharacterStore";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { processText } from "../../utils/textUtils";
import { useState } from "react";

export default function CharacterChat({
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
  isRecentMessage,
  onRegenerate,
  onNavigate,
  isFirstMessage,
  onImageClick,
}) {
  const [copied, setCopied] = useState(false);

  const processedText = processText(text.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(text.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const replacerTools = (text) => {
    // Get pattern replacement settings from store
    const { patternReplacements } = useCharacterStore.getState();

    // If no settings or empty array, return original text
    if (!patternReplacements || patternReplacements.length === 0) {
      return text;
    }

    let result = text;

    // Apply all active patterns sequentially
    for (const pattern of patternReplacements) {
      if (!pattern.active || !pattern.findPattern) continue;

      try {
        let finalReplacePattern = pattern.replacePattern || "";
        // Replace {{tools}} placeholder in the replace pattern with the prompt input
        if (pattern.prompt) {
          finalReplacePattern = finalReplacePattern.replace(/\{\{tools\}\}/g, pattern.prompt);
        }

        if (pattern.isRegex) {
          // Create regex from find pattern
          const regex = new RegExp(pattern.findPattern, 'g');
          result = result.replace(regex, finalReplacePattern);
        } else {
          // Use normal text replacement
          // Escape special regex characters in the find pattern for literal matching
          const escapedFindPattern = pattern.findPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedFindPattern, 'g');
          result = result.replace(regex, finalReplacePattern);
        }
      } catch (error) {
        console.error("Error in replacerTools for pattern:", pattern, error);
        // Continue to next pattern even if one fails
      }
    }

    return result;
  };

  // Don't show edit/delete buttons for system messages
  const isSystemMessage = messageId === 0 && messageContent.role === "system";

  return (
    <div className="flex items-start gap-3">
      <div
        className="w-[50px] h-[50px] bg-[#393A39] rounded-lg flex-shrink-0 overflow-hidden items-center justify-center cursor-pointer"
        onClick={onImageClick}
      >
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
                className="px-3 py-1 bg-[#242524] border border-[#333333] rounded-lg text-sm text-[#E4E4E4] hover:bg-[#333333] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm font-normal text-[#CDCDCD] flex flex-col gap-4">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{replacerTools(processedText)}</ReactMarkdown>
          </div>
        )}
        {!isSystemMessage && !isEditing && !isDeleting && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex opacity-50 gap-2">
              {text.candidates && text.candidates.length > 1 && (
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={() => onNavigate('prev')}
                    disabled={!text.currentIndex || text.currentIndex === 0}
                    className="text-[#A2A2A2] hover:text-[#E4E4E4] disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-[#A2A2A2]">
                    {(text.currentIndex || 0) + 1}/{text.candidates.length}
                  </span>
                  <button
                    onClick={() => onNavigate('next')}
                    disabled={text.currentIndex === text.candidates.length - 1}
                    className="text-[#A2A2A2] hover:text-[#E4E4E4] disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {isRecentMessage && (
                <>
                  <button
                    onClick={handleCopy}
                    className="text-[#A2A2A2] hover:text-[#E4E4E4] transition-colors"
                    aria-label="Copy message"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  {!isFirstMessage && (
                    <>
                      <button
                        onClick={onRegenerate}
                        className="text-[#A2A2A2] hover:text-[#E4E4E4] transition-colors"
                        aria-label="Regenerate response"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(messageId, messageContent)}
                        className="text-[#A2A2A2] hover:text-[#E4E4E4] transition-colors"
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
