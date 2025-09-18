"use client";

import { useState, useEffect } from "react";
import { X, FileText, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import usePromptStore from "../../store/usePromptStore";

export default function CustomPromptModal({ onClose }) {
  const {
    system_prompt,
    custom_prompts,
    prompt_names,
    selected_prompt_index,
    setCustomPrompts,
    setPromptNames,
    setSelectedPromptIndex,
    addCustomPrompt,
    updateCustomPrompt,
    updatePromptName,
    removeCustomPrompt
  } = usePromptStore();
  
 const [activeTab, setActiveTab] = useState('default');
 const [promptValues, setPromptValues] = useState(['']);
 const [promptNames, setPromptNamesLocal] = useState([]);
 const [isPlaceholdersCollapsed, setIsPlaceholdersCollapsed] = useState(true);

 // Initialize prompt values and active tab when component mounts
 useEffect(() => {
   // Update prompt values if we have persisted data
   if (custom_prompts.length > 0) {
     setPromptValues([...custom_prompts]);
   }
   
   // Update prompt names if we have persisted data
   if (prompt_names.length > 0) {
     setPromptNamesLocal([...prompt_names]);
   } else {
     // Initialize with default names
     const defaultNames = Array(custom_prompts.length).fill('').map((_, i) => `Prompt ${i + 1}`);
     setPromptNamesLocal(defaultNames);
   }
   
   // Set active tab to the selected prompt or default
   if (selected_prompt_index >= 0) {
     setActiveTab(selected_prompt_index);
   } else {
     setActiveTab('default');
   }
 }, [custom_prompts, prompt_names, selected_prompt_index]);

  const handleSave = () => {
    setCustomPrompts(promptValues);
    setPromptNames(promptNames);
    if (activeTab !== 'default' && activeTab < promptValues.length) {
      setSelectedPromptIndex(activeTab);
    } else {
      setSelectedPromptIndex(-1);
    }
    onClose();
  };

  const handleReset = () => {
    setPromptValues(['']);
    setPromptNamesLocal([]);
    setCustomPrompts([]);
    setPromptNames([]);
    setSelectedPromptIndex(-1);
    setActiveTab('default');
  };

  const handleAddPrompt = () => {
    const newPromptValues = [...promptValues, ''];
    const newPromptNames = [...promptNames, `Prompt ${promptValues.length + 1}`];
    setPromptValues(newPromptValues);
    setPromptNamesLocal(newPromptNames);
    setActiveTab(newPromptValues.length - 1);
  };

  const handleRemovePrompt = (index) => {
    if (promptValues.length <= 1) return;
    
    const newPromptValues = promptValues.filter((_, i) => i !== index);
    const newPromptNames = promptNames.filter((_, i) => i !== index);
    setPromptValues(newPromptValues);
    setPromptNamesLocal(newPromptNames);
    
    // Adjust active tab if needed
    if (activeTab === index) {
      setActiveTab(newPromptValues.length > 0 ? Math.max(0, index - 1) : 'default');
    } else if (activeTab > index) {
      setActiveTab(activeTab - 1);
    }
  };

  const handlePromptChange = (index, value) => {
    const newPromptValues = [...promptValues];
    newPromptValues[index] = value;
    setPromptValues(newPromptValues);
  };

  const handlePromptNameChange = (index, value) => {
    const newPromptNames = [...promptNames];
    newPromptNames[index] = value;
    setPromptNamesLocal(newPromptNames);
  };

  const getActivePromptValue = () => {
    if (activeTab === 'default') {
      return system_prompt;
    }
    return promptValues[activeTab] || '';
  };

  const renderTabContent = () => {
    if (activeTab === 'default') {
      return (
        <div className="flex flex-col gap-3">
          <label
            htmlFor="defaultPrompt"
            className="text-lg font-medium text-[#f2f2f2]"
          >
            Default Prompt Template
          </label>
          <textarea
            id="defaultPrompt"
            className="w-full h-48 sm:h-64 px-4 py-3 bg-green-500/20 rounded-lg text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72]/0 transition-shadow resize-none"
            value={system_prompt}
            readOnly
            placeholder="Default prompt template"
          />
          <p className="text-sm text-[#8e8e8e]">
            This is the default prompt. To customize, add a new prompt tab.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`customPrompt-${activeTab}`}
              className="text-lg font-medium text-[#f2f2f2]"
            >
              Prompt Template
            </label>
            <input
              type="text"
              className="w-full max-w-xs px-2 py-1 bg-[#161616]/30 border border-white/10 rounded text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow"
              value={promptNames[activeTab] || `Prompt ${activeTab + 1}`}
              onChange={(e) => handlePromptNameChange(activeTab, e.target.value)}
              placeholder={`Prompt ${activeTab + 1}`}
            />
          </div>
          {promptValues.length > 1 && (
            <button
              onClick={() => handleRemovePrompt(activeTab)}
              className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <Trash2 size={14} />
              <span className="text-xs">Delete</span>
            </button>
          )}
        </div>
        <textarea
          id={`customPrompt-${activeTab}`}
          className="w-full h-48 sm:h-64 px-4 py-3 bg-[#161616]/30 border border-white/10 rounded-lg text-white placeholder:text-[#f2f2f2]/40 text-sm font-medium outline-none focus:ring-2 focus:ring-[#5fdb72] transition-shadow resize-none"
          value={promptValues[activeTab] || ''}
          onChange={(e) => handlePromptChange(activeTab, e.target.value)}
          placeholder="Enter your custom prompt with placeholders like {{char}}, {{user}}, {{tools}}, etc."
        />
      </div>
    );
  };

  return (
    // Modal Overlay: Centers the modal and provides a backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 bg-opacity-50 p-4 overflow-y-auto">
      {/* Modal Content */}
      <div className="w-full h-full lg:h-auto max-w-3xl rounded-xl shadow-lg flex flex-col font-sans max-h-[90vh] my-4 mx-2 border border-white/20 bg-white/2">
        {/* Modal Header */}
        <header className="flex items-center justify-between p-4 border-b border-[#3b3b3b]">
          <div>
            <h2 className="text-xl font-bold text-[#f2f2f2] tracking-tight flex items-center gap-2">
              Custom Prompts
            </h2>
            <p className="text-xs text-[#8e8e] mt-1">
              Create and manage multiple prompt templates
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 bg-[#454545]/30 border border-[#454545] rounded-lg hover:bg-[#454545]/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={16}  />
          </button>
        </header>
        
        {/* Tabs */}
        <div className="px-4 border-b border-[#3b3b3b]">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            <button
              className={`px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap ${
                activeTab === 'default'
                  ? 'bg-[#5fdb72]/15 text-[#e4ffe8] border-b-2 border-[#5fdb72]'
                  : 'text-[#d9d9d9] hover:text-white hover:bg-[#333]/50'
              }`}
              onClick={() => setActiveTab('default')}
            >
              Default
            </button>
            
            {promptValues.map((_, index) => (
              <div key={index} className="flex items-center">
                <button
                  className={`px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap ${
                    activeTab === index
                      ? 'bg-[#5fdb72]/15 text-[#e4ffe8] border-b-2 border-[#5fdb72]'
                      : 'text-[#d9d9d9] hover:text-white hover:bg-[#33]/50'
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  {promptNames[index] || `Prompt ${index + 1}`}
                </button>
              </div>
            ))}
            
            <button
              onClick={handleAddPrompt}
              className="flex items-center gap-1 px-2 py-2 text-xs font-medium text-[#d9d9d9] hover:text-white hover:bg-[#333]/50 rounded-lg"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <main className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
          {renderTabContent()}
          
          {/* Placeholders Section */}
          <div className="flex flex-col gap-3">
            <button
              className="flex items-center gap-2 text-lg font-medium text-[#f2f2f2] hover:text-[#5fdb72] transition-colors"
              onClick={() => setIsPlaceholdersCollapsed(!isPlaceholdersCollapsed)}
            >
              {isPlaceholdersCollapsed ? (
                <ChevronRight size={20} className="text-[#5fdb72]" />
              ) : (
                <ChevronDown size={20} className="text-[#5fdb72]" />
              )}
              <span>Available Placeholders</span>
            </button>
            
            {!isPlaceholdersCollapsed && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#1a1a1a] rounded-lg border border-[#333]">
                <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-2 rounded-lg">
                  <span className="text-[#e4ffe8] font-mono text-xs">{"{{char}}"}</span>
                </div>
                <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-2 rounded-lg">
                  <span className="text-[#e4ffe8] font-mono text-xs">{"{{user}}"}</span>
                </div>
                <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-2 rounded-lg">
                  <span className="text-[#e4ffe8] font-mono text-xs">{"{{char_description}}"}</span>
                </div>
                <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-2 rounded-lg">
                  <span className="text-[#e4ffe8] font-mono text-xs">{"{{user_description}}"}</span>
                </div>
                <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-2 rounded-lg">
                  <span className="text-[#e4ffe8] font-mono text-xs">{"{{scenario}}"}</span>
                </div>
                <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-2 rounded-lg">
                  <span className="text-[#e4ffe8] font-mono text-xs">{"{{memory}}"}</span>
                </div>
                <div className="bg-[#5fdb72]/10 border border-[#5fdb72] p-2 rounded-lg">
                  <span className="text-[#e4ffe8] font-mono text-xs">{"{{tools}}"}</span>
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Modal Footer */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t border-[#333]">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-white/80 bg-[#454545]/30 border border-[#454545] hover:bg-white/10 rounded-lg transition-colors w-full sm:w-auto"
            >
              Reset All
            </button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white/80 bg-[#454545]/30 border border-[#454545] hover:bg-white/10 rounded-lg transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#5fdb72]/15 border border-[#5fdb72] rounded-lg text-[#e4ffe8] text-sm font-medium hover:bg-[#5fdb72]/25 transition-colors w-full sm:w-auto"
            >
              Save & Apply
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}