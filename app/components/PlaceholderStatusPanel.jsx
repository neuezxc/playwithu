"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import useDebugStore from "../store/useDebugStore";

function getStatusIcon(inTemplate, hasContent) {
  if (inTemplate && hasContent) return { icon: "✅", color: "text-green-400" };
  if (inTemplate && !hasContent) return { icon: "⚠️", color: "text-yellow-400" };
  if (!inTemplate && !hasContent) return { icon: "❌", color: "text-red-400" };
  return { icon: "⚠️", color: "text-orange-400" };
}

function getStatusLabel(inTemplate, hasContent) {
  if (inTemplate && hasContent) return "Sent to API";
  if (inTemplate && !hasContent) return "In template, but empty";
  if (!inTemplate && !hasContent) return "Not in template";
  return "Has content, but not in template";
}

function formatValue(value, tokenCount) {
  if (!value || !value.trim()) return "(empty)";
  const preview = value.length > 60 ? value.slice(0, 60) + "..." : value;
  return `"${preview}" (${tokenCount} tokens)`;
}

export default function PlaceholderStatusPanel() {
  const { placeholderData, isPlaceholderPanelOpen, togglePlaceholderPanel } = useDebugStore();
  const [expanded, setExpanded] = useState(true);

  if (!isPlaceholderPanelOpen) return null;

  const placeholderCount = placeholderData
    ? Object.keys(placeholderData.placeholders || {}).length
    : 0;

  return (
    <div className="w-full max-w-xl bg-[#1a1a1a] border border-[#333] rounded-xl p-0 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#d9d9d9]">Placeholder Status</span>
          {placeholderCount > 0 && (
            <span className="text-xs bg-[#333] text-[#8e8e8e] px-1.5 py-0.5 rounded">
              {placeholderCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-[#333] rounded transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown size={14} className="text-[#8e8e8e]" /> : <ChevronUp size={14} className="text-[#8e8e8e]" />}
          </button>
          <button
            onClick={togglePlaceholderPanel}
            className="p-1 hover:bg-[#333] rounded transition-colors"
            title="Close panel"
          >
            <X size={14} className="text-[#8e8e8e]" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 py-2">
          {!placeholderData ? (
            <p className="text-xs text-[#656565] py-2">Send a message to see placeholder status</p>
          ) : (
            <div className="space-y-1">
              {Object.entries(placeholderData.placeholders).map(([name, data]) => {
                const { icon, color } = getStatusIcon(data.inTemplate, data.hasContent);
                const label = getStatusLabel(data.inTemplate, data.hasContent);
                return (
                  <div
                    key={name}
                    className="flex items-start gap-2 py-1.5 text-xs"
                    title={label}
                  >
                    <span className="flex-shrink-0">{icon}</span>
                    <code className="flex-shrink-0 text-[#5f9fdb] font-mono min-w-[160px]">
                      {`{{${name}}}`}
                    </code>
                    <span className={`flex-shrink-0 ${color}`}>
                      {label}
                    </span>
                    <span className="text-[#8e8e8e] truncate">
                      {formatValue(data.value, data.tokenCount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
