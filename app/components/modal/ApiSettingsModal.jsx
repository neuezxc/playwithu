'use client'
import { useState } from "react";
import { X, Eye, EyeOff, RefreshCw, Play, Info, Server, Sliders, ChevronRight, ShieldCheck, Cpu } from "lucide-react";
import useApiSettingStore from "@/app/store/useApiSettingStore";

export default function ApiSettingsModal() {
  const {
    api_endpoint,
    api_key,
    model_id,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty
  } = useApiSettingStore();

  const setApiEndpoint = useApiSettingStore((state) => state.setApiEndpoint);
  const setModal = useApiSettingStore((state) => state.setModal);
  const setApiKey = useApiSettingStore((state) => state.setApiKey);
  const setModelId = useApiSettingStore((state) => state.setModelId);
  const setTemperature = useApiSettingStore((state) => state.setTemperature);
  const setMaxTokens = useApiSettingStore((state) => state.setMaxTokens);
  const setTopP = useApiSettingStore((state) => state.setTopP);
  const setFrequencyPenalty = useApiSettingStore((state) => state.setFrequencyPenalty);
  const setPresencePenalty = useApiSettingStore((state) => state.setPresencePenalty);
  const resetParameters = useApiSettingStore((state) => state.resetParameters);

  const [activeTab, setActiveTab] = useState("connection");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const headers = {
        "Accept": "application/json",
        "X-Title": "PlayWithU",
        "HTTP-Referer": window.location.origin,
      };

      if (api_key) {
        const cleanKey = api_key.startsWith('Bearer ') ? api_key.substring(7) : api_key;
        headers["Authorization"] = `Bearer ${cleanKey}`;
      }

      const response = await fetch(api_endpoint, {
        method: "GET",
        headers,
      });

      if (response.ok) {
        setTestResult({ success: true, message: "Connection successful!" });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestResult({ 
          success: false, 
          message: `${errorData.error?.message || response.statusText || "Connection failed"} (${response.status})` 
        });
      }
    } catch (error) {
      setTestResult({ success: false, message: "Network error. Check your URL and CORS settings." });
    } finally {
      setIsTesting(false);
    }
  };

  const navItems = [
    { id: "connection", label: "Connection", icon: Server },
    { id: "parameters", label: "Model Config", icon: Sliders },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl h-[85vh] md:h-[600px] bg-[#0d0d0d]/90 rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-48 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 flex flex-row md:flex-col p-2 md:p-4 shrink-0 items-center md:items-stretch overflow-x-auto scrollbar-hide">
          {/* Logo - Hidden on Mobile */}
          <div className="hidden md:flex items-center gap-2 px-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3A9E49] to-[#2d7a39] flex items-center justify-center shadow-lg shadow-[#3A9E49]/20">
              <Cpu size={18} className="text-white" />
            </div>
            <span className="font-bold text-[#f2f2f2] tracking-tight">AI Settings</span>
          </div>

          <nav className="flex flex-row md:flex-col gap-1.5 flex-1 min-w-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2 md:py-2.5 rounded-xl text-sm font-medium transition-all group whitespace-nowrap ${
                  activeTab === item.id
                    ? "bg-[#3A9E49]/10 text-[#3A9E49] border border-[#3A9E49]/20 shadow-inner"
                    : "text-[#8e8e8e] hover:text-[#f2f2f2] hover:bg-white/5"
                }`}
              >
                <item.icon size={16} className={activeTab === item.id ? "text-[#3A9E49]" : "group-hover:text-[#f2f2f2]"} />
                <span className="md:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={() => setModal(false)}
            className="flex items-center gap-3 px-3 py-2 md:py-2.5 rounded-xl text-sm font-medium text-[#8e8e8e] hover:text-white hover:bg-white/5 transition-all md:mt-4"
          >
            <X size={16} />
            <span className="hidden md:inline">Close</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden">
          {/* Header */}
          <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 shrink-0">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 capitalize">
              {activeTab} Settings
            </h2>
            <div className="flex gap-2 items-center">
              <div className="h-1.5 w-1.5 rounded-full bg-[#3A9E49] animate-pulse" />
              <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#656565] font-bold">System Online</div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
            <div className="max-w-md mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              
              {/* Connection Tab Content */}
              {activeTab === "connection" && (
                <div className="space-y-5 md:space-y-6">
                  {/* Base URL */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#656565] group-focus-within:text-[#3A9E49] transition-colors">
                      Endpoint URL
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={api_endpoint || ""}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        placeholder="https://openrouter.ai/api/v1/chat/completions"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 md:py-3 text-sm text-[#f2f2f2] placeholder:text-[#454545] focus:border-[#3A9E49]/50 focus:bg-[#3A9E49]/5 outline-none transition-all font-mono"
                      />
                      <Server className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#3A9E49]/40" size={16} />
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#656565] group-focus-within:text-[#3A9E49] transition-colors flex items-center gap-2">
                       Authentication Key
                       <ShieldCheck size={12} className="text-[#3A9E49]/50" />
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={api_key}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API token..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 md:py-3 pr-12 text-sm text-[#f2f2f2] placeholder:text-[#454545] focus:border-[#3A9E49]/50 focus:bg-[#3A9E49]/5 outline-none transition-all font-mono"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#454545] hover:text-[#f2f2f2] transition-colors"
                      >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-[#656565] px-1 italic">Keys are encrypted and stored solely on your local device.</p>
                  </div>

                  {/* Model ID */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#656565] group-focus-within:text-[#3A9E49] transition-colors font-sans">
                      Model Identifier
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={model_id || ""}
                        onChange={(e) => setModelId(e.target.value)}
                        placeholder="e.g. gpt-4o, sonoma-dusk..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 md:py-3 text-sm text-[#f2f2f2] placeholder:text-[#454545] focus:border-[#3A9E49]/50 focus:bg-[#3A9E49]/5 outline-none transition-all font-mono"
                      />
                      <Cpu className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#3A9E49]/40" size={16} />
                    </div>
                  </div>

                  {/* Connection Actions */}
                  <div className="pt-2 md:pt-4 space-y-3 md:space-y-4">
                    <button
                      onClick={handleTestConnection}
                      disabled={isTesting || !api_endpoint}
                      className={`w-full py-3 md:py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                        !api_endpoint
                          ? "bg-white/5 text-[#454545] cursor-not-allowed border border-white/5"
                          : "bg-[#3A9E49] text-white hover:bg-[#43b654] shadow-lg shadow-[#3A9E49]/20 border border-white/10"
                      }`}
                    >
                      {isTesting ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <Play size={18} fill="currentColor" />
                      )}
                      {isTesting ? "Validating..." : "Verify Endpoint"}
                    </button>

                    {testResult && (
                      <div className={`p-4 rounded-xl border animate-in slide-in-from-top-2 flex items-start gap-3 ${
                        testResult.success
                          ? "bg-[#3A9E49]/10 border-[#3A9E49]/20 text-[#3A9E49]"
                          : "bg-red-500/5 border-red-500/20 text-red-400"
                      }`}>
                        <div className={`mt-0.5 p-1 rounded-full ${testResult.success ? "bg-[#3A9E49]/20" : "bg-red-500/20"}`}>
                          <ChevronRight size={12} className={testResult.success ? "text-[#3A9E49]" : "text-red-400"} />
                        </div>
                        <div className="text-[11px] leading-relaxed font-medium">
                          {testResult.message}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Parameters Tab Content */}
              {activeTab === "parameters" && (
                <div className="space-y-6 md:space-y-8 pb-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 md:pb-4 gap-4">
                    <p className="text-[10px] md:text-[11px] text-[#656565] max-w-[180px] md:max-w-[200px] leading-relaxed">
                      Optimize how the AI generates responses.
                    </p>
                    <button
                      onClick={resetParameters}
                      className="px-2 md:px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-[#8e8e8e] hover:text-[#3A9E49] hover:bg-[#3A9E49]/10 hover:border-[#3A9E49]/20 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <RefreshCw size={12} /> Reset
                    </button>
                  </div>

                  {/* Temperature Slider */}
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#8e8e8e] transition-colors group-hover:text-[#3A9E49]">Temperature</label>
                        <Info size={12} className="text-[#333] hover:text-[#3A9E49] cursor-help transition-colors" />
                      </div>
                      <span className="text-[11px] md:text-xs font-bold font-mono text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">{temperature.toFixed(1)}</span>
                    </div>
                    <div className="relative group/slider pt-1">
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer outline-none accent-[#3A9E49] hover:accent-[#43b654] transition-all"
                      />
                    </div>
                    <div className="flex justify-between text-[8px] md:text-[9px] text-[#454545] font-bold uppercase tracking-widest px-0.5">
                      <span>Focused</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#8e8e8e]">Max Response Length</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={max_tokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value) || 0)}
                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 md:py-2.5 text-sm text-[#f2f2f2] focus:border-[#3A9E49]/50 focus:bg-[#3A9E49]/5 outline-none transition-all font-mono"
                      />
                      <span className="text-[9px] md:text-[10px] text-[#656565] font-medium w-20 md:w-24 leading-tight">Tokens<br/>(0 = Full)</span>
                    </div>
                  </div>

                  {/* Advanced Sliders Grid */}
                  <div className="grid grid-cols-1 gap-5 md:gap-6 py-1">
                    {/* Top P */}
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#8e8e8e]">Top P Sampling</label>
                        <span className="text-[10px] font-mono text-[#3A9E49] font-bold">{top_p.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={top_p}
                        onChange={(e) => setTopP(parseFloat(e.target.value))}
                        className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer outline-none accent-[#3A9E49]"
                      />
                    </div>

                    {/* Frequency Penalty */}
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#8e8e8e]">Frequency Penalty</label>
                        <span className="text-[10px] font-mono text-[#3A9E49] font-bold">{frequency_penalty.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={frequency_penalty}
                        onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                        className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer outline-none accent-[#3A9E49]"
                      />
                    </div>

                    {/* Presence Penalty */}
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[#8e8e8e]">Presence Penalty</label>
                        <span className="text-[10px] font-mono text-[#3A9E49] font-bold">{presence_penalty.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={presence_penalty}
                        onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                        className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer outline-none accent-[#3A9E49]"
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>
          </main>

          {/* Footer Blur Edge */}
          <div className="h-6 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none sticky bottom-0" />
        </div>
      </div>
    </div>
  );
}
