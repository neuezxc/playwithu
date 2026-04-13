"use client";

import { useState } from "react";
import { X, Trash2, Power, ChevronDown, ChevronRight, Copy } from "lucide-react";
import useDebugStore from "../../store/useDebugStore";

function countTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.3);
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-[#8e8e8e] hover:text-[#f2f2f2] transition-colors"
      title="Copy"
    >
      {copied ? "Copied!" : <Copy size={12} />}
    </button>
  );
}

function Section({ title, count, action, children }) {
  return (
    <div className="bg-[#252525] rounded border border-[#333]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#333]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#d9d9d9]">{title}</span>
          {count && <span className="text-xs text-[#656565]">{count}</span>}
        </div>
        {action}
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}

function FullMessages({ messages }) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs text-[#5f9fdb] hover:text-[#8ec5ff] transition-colors flex items-center gap-1"
      >
        <ChevronRight size={12} />
        Full Messages ({messages.length})
      </button>
    );
  }

  const fullText = messages.map((m) => `[${m.role}]\n${m.content}`).join("\n\n---\n\n");

  return (
    <div className="bg-[#252525] rounded border border-[#333]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#333]">
        <span className="text-xs font-medium text-[#d9d9d9]">
          Full Messages ({messages.length})
        </span>
        <CopyButton text={fullText} />
      </div>
      <div className="px-3 py-2">
        <pre className="text-xs text-[#f2f2f2] whitespace-pre-wrap break-words font-mono max-h-64 overflow-y-auto">
          {fullText}
        </pre>
      </div>
    </div>
  );
}

function LogCard({ log, isExpanded, onToggle }) {
  const formatTime = (ts) => new Date(ts).toLocaleTimeString();

  const statusIcon = log.status === "ok" ? "✅" : "❌";

  return (
    <div className="border border-[#333] rounded-lg bg-[#1a1a1a] overflow-hidden">
      {/* Collapsed Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#252525] transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown size={14} className="text-[#8e8e8e] flex-shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-[#8e8e8e] flex-shrink-0" />
        )}
        <span className="text-xs text-[#8e8e8e] flex-shrink-0">
          {formatTime(log.timestamp)}
        </span>
        <span className="text-xs flex-shrink-0">{statusIcon}</span>
        <span className="text-xs text-[#d9d9d9] truncate">
          {log.characterName}
        </span>
        <span className="text-xs text-[#656565] truncate">
          — {log.promptName}
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Error Message */}
          {log.error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
              {log.error}
            </div>
          )}

          {/* System Prompt */}
          {log.resolvedSystemPrompt && (
            <Section
              title="System Prompt"
              count={`${countTokens(log.resolvedSystemPrompt)} tokens`}
              action={<CopyButton text={log.resolvedSystemPrompt} />}
            >
              <pre className="text-xs text-[#f2f2f2] whitespace-pre-wrap break-words font-mono">
                {log.resolvedSystemPrompt}
              </pre>
            </Section>
          )}

          {/* Last Exchange */}
          {(log.lastUserMessage || log.lastAiResponse) && (
            <Section
              title="Last Exchange"
              action={
                <CopyButton
                  text={`User: ${log.lastUserMessage}\n${log.characterName}: ${log.lastAiResponse}`}
                />
              }
            >
              {log.lastUserMessage && (
                <div className="mb-2">
                  <span className="text-xs text-[#3A9E49] font-medium">User:</span>
                  <p className="text-xs text-[#d9d9d9] mt-0.5 whitespace-pre-wrap">
                    {log.lastUserMessage}
                  </p>
                </div>
              )}
              {log.lastAiResponse && (
                <div>
                  <span className="text-xs text-[#5f9fdb] font-medium">
                    {log.characterName}:
                  </span>
                  <p className="text-xs text-[#d9d9d9] mt-0.5 whitespace-pre-wrap">
                    {log.lastAiResponse}
                  </p>
                </div>
              )}
            </Section>
          )}

          {/* Params */}
          {log.params && log.params.model && (
            <Section title="Params">
              <div className="text-xs text-[#d9d9d9] font-mono space-y-0.5">
                <div>model: {log.params.model}</div>
                <div>
                  temp: {log.params.temperature} · max_tokens: {log.params.max_tokens} · top_p: {log.params.top_p}
                </div>
              </div>
            </Section>
          )}

          {/* Full Messages Toggle */}
          {log.messages && log.messages.length > 0 && (
            <FullMessages messages={log.messages} />
          )}
        </div>
      )}
    </div>
  );
}

export default function DebugModal({ onClose }) {
  const { logs, clearLogs, isEnabled, toggleEnabled } = useDebugStore();
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    return log.status === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 bg-opacity-50 p-2 sm:p-4 overflow-y-auto">
      <div className="w-full h-full lg:h-auto max-w-4xl rounded-xl shadow-lg flex flex-col font-sans max-h-[90vh] my-2 sm:my-4 mx-1 sm:mx-2 border border-white/20 bg-white/2">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-[#3b3b3b]">
          <div>
            <h2 className="text-xl font-bold text-[#f2f2f2] tracking-tight flex items-center gap-2">
              Debug Logs
            </h2>
            <p className="text-xs text-[#8e8e8e] mt-1">API requests</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 bg-[#454545]/30 border border-[#454545] rounded-lg hover:bg-[#454545]/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </header>

        {/* Filter Bar */}
        <div className="px-4 py-2 border-b border-[#3b3b3b] flex flex-wrap gap-2 items-center">
          <button
            className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-lg ${
              filter === "all"
                ? "bg-[#5fdb72]/15 text-[#e4ffe8] border border-[#5fdb72]"
                : "text-[#d9d9d9] hover:text-white hover:bg-[#333]/50"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium rounded-lg ${
              filter === "error"
                ? "bg-red-500/15 text-red-300 border border-red-500"
                : "text-[#d9d9d9] hover:text-white hover:bg-[#333]/50"
            }`}
            onClick={() => setFilter("error")}
          >
            Errors
          </button>
          <button
            className={`ml-auto px-2 sm:px-3 py-1 text-xs font-medium flex items-center gap-1 ${
              isEnabled
                ? "text-green-400 hover:text-green-300"
                : "text-red-400 hover:text-red-300"
            }`}
            onClick={toggleEnabled}
          >
            <Power size={14} />
            {isEnabled ? "Enabled" : "Disabled"}
          </button>
          <button
            className="px-2 sm:px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1"
            onClick={clearLogs}
          >
            <Trash2 size={14} />
            Clear Logs
          </button>
        </div>

        {/* Log Cards */}
        <main className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#8e8e8e]">
              <p>No debug logs found</p>
              <p className="text-sm mt-2">Make API requests to see logs here</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                isExpanded={expandedId === log.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === log.id ? null : log.id))
                }
              />
            ))
          )}
        </main>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t border-[#333]">
          <div className="text-xs text-[#8e8e8e]">Total logs: {logs.length}</div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#454545]/30 border border-[#454545] rounded-lg text-[#f2f2f2] text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
