import { Edit, Trash2, Loader2, Grid } from "lucide-react";
import useCharacterStore from "@/app/store/useCharacterStore";

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
}) {
  // Process the text to apply styling
  const processText = (inputText) => {
    if (!inputText) return "";
    // Replace "text" with span having primary color
    let processed = inputText.content.replace(
      /"(.*?)"/g,
      '<span style="font-weight: bold;">$1</span>'
    );

    return processed;
  };

  const processedText = processText(text);

  const replacerTools = (text) => {
    // Get pattern replacement settings from store
    const { patternReplacementSettings } = useCharacterStore.getState();
    
    // If no settings or patterns are empty, return original text
    if (!patternReplacementSettings ||
        !patternReplacementSettings.findPattern ||
        !patternReplacementSettings.replacePattern) {
      return text;
    }
    
    // Replace {{tools}} placeholder in the replace pattern with the prompt input
    let finalReplacePattern = patternReplacementSettings.replacePattern;
    if (patternReplacementSettings.prompt) {
      finalReplacePattern = finalReplacePattern.replace(/\{\{tools\}\}/g, patternReplacementSettings.prompt);
    }
    
    try {
      // Check if we should use regex or normal text replacement
      if (patternReplacementSettings.isRegex) {
        // Create regex from find pattern
        const regex = new RegExp(patternReplacementSettings.findPattern, 'g');
        
        // Replace using the replace pattern
        return text.replace(regex, finalReplacePattern);
      } else {
        // Use normal text replacement
        // Escape special regex characters in the find pattern for literal matching
        const escapedFindPattern = patternReplacementSettings.findPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedFindPattern, 'g');
        
        // Replace using the replace pattern
        return text.replace(regex, finalReplacePattern);
      }
    } catch (error) {
      console.error("Error in replacerTools:", error);
      return text;
    }
  };

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
          <p
            className="text-sm font-normal text-[#CDCDCD] flex flex-col gap-4"
            dangerouslySetInnerHTML={{ __html: replacerTools(processedText) }}
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
