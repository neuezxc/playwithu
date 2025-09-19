"use client";

import { useState } from "react";
import { X, Trash2, Power } from "lucide-react";
import useDebugStore from "../../store/useDebugStore";

export default function DebugModal({ onClose }) {
  const { logs, clearLogs, isEnabled, toggleEnabled } = useDebugStore();
  const [filter, setFilter] = useState("all");

  // Filter logs based on selected filter
  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    return log.type === filter;
  });

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    // Modal Overlay: Centers the modal and provides a backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 bg-opacity-50 p-2 sm:p-4 overflow-y-auto">
      {/* Modal Content */}
      <div className="w-full h-full lg:h-auto max-w-4xl rounded-xl shadow-lg flex flex-col font-sans max-h-[90vh] my-2 sm:my-4 mx-1 sm:mx-2 border border-white/20 bg-white/2">
        {/* Modal Header */}
        <header className="flex items-center justify-between p-4 border-b border-[#3b3b3b]">
          <div>
            <h2 className="text-xl font-bold text-[#f2f2f2] tracking-tight flex items-center gap-2">
              Debug Logs
            </h2>
            <p className="text-xs text-[#8e8e] mt-1">
              API requests
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 bg-[#4545]/30 border border-[#454545] rounded-lg hover:bg-[#454545]/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </header>
        
        {/* Filter Controls */}
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
              filter === "api"
                ? "bg-[#5fdb72]/15 text-[#e4ffe8] border border-[#5fdb72]"
                : "text-[#d9d9d9] hover:text-white hover:bg-[#333]/50"
            }`}
            onClick={() => setFilter("api")}
          >
            API Requests
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
        
        {/* Modal Body */}
        <main className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#8e8e] py-8">
              <p className="text-center">No debug logs found</p>
              <p className="text-center text-sm mt-2">Make API requests to see logs here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="border border-[#333] rounded-lg p-3 bg-[#1a1a1a]"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        log.type === "api"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}>
                        API
                      </span>
                      <span className="text-xs text-[#8e8e]">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  {log.endpoint && (
                    <div className="mt-2">
                      <p className="text-xs text-[#8e8e]">Endpoint</p>
                      <p className="text-sm text-[#f2f2f2] font-mono break-all">
                        {log.endpoint}
                      </p>
                    </div>
                  )}
                  
                  {log.request && (
                    <div className="mt-2">
                      <p className="text-xs text-[#8e8e]">Request</p>
                      <pre className="text-xs text-[#f2f2f2] bg-[#252525] p-2 rounded mt-1 whitespace-pre-wrap break-words">
                        {typeof log.request === "string"
                          ? log.request
                          : JSON.stringify(log.request, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {log.response && (
                    <div className="mt-2">
                      <p className="text-xs text-[#8e8e]">Response</p>
                      <pre className="text-xs text-[#f2f2f2] bg-[#252525] p-2 rounded mt-1 whitespace-pre-wrap break-words">
                        {typeof log.response === "string"
                          ? log.response
                          : JSON.stringify(log.response, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {log.error && (
                    <div className="mt-2">
                      <p className="text-xs text-red-400">Error</p>
                      <p className="text-sm text-red-300">
                        {log.error}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
        
        {/* Modal Footer */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t border-[#333]">
          <div className="text-xs text-[#8e8e]">
            Total logs: {logs.length}
          </div>
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