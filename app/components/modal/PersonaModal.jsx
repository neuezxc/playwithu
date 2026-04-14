'use client'
import React, { useState, useEffect } from "react";
import { X, User, Image, Save } from "lucide-react";
import useUserStore from "@/app/store/useUserStore";

export default function PersonaModal({ isOpen, onClose }) {
  const { user } = useUserStore();
  const setUser = useUserStore((state) => state.setUser);

  const [editableUser, setEditableUser] = useState({
    name: "",
    description: "",
    avatarURL: "",
  });

  useEffect(() => {
    if (isOpen) {
      setEditableUser({
        name: user?.name || "",
        description: user?.description || "",
        avatarURL: user?.avatarURL || "",
      });
    }
  }, [isOpen, user]);

  const handleInputChange = (field, value) => {
    setEditableUser({
      ...editableUser,
      [field]: value,
    });
  };

  const handleSave = () => {
    setUser({ ...user, ...editableUser });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="w-full h-full md:h-auto md:max-h-[90vh] max-w-3xl rounded-2xl shadow-2xl flex flex-col font-sans border border-white/10 bg-[#121212] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#181818]">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-green-500/10 rounded-lg">
              <User size={18} className="text-green-400" />
            </div>
            Your Persona
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="flex flex-col md:flex-row gap-6">

            {/* Left Column: Avatar Preview & URL */}
            <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
              {/* Avatar Preview */}
              <div className="aspect-square w-full bg-[#1a1a1a] rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
                {editableUser.avatarURL ? (
                  <img
                    src={editableUser.avatarURL}
                    alt="Avatar preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-600">
                    <Image size={48} strokeWidth={1} />
                    <span className="text-xs">No Avatar</span>
                  </div>
                )}
              </div>

              {/* Avatar URL Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avatar URL</label>
                <input
                  type="text"
                  value={editableUser.avatarURL}
                  onChange={(e) => handleInputChange("avatarURL", e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* Right Column: Name & Description */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={editableUser.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your name (e.g. Mac)"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-lg font-medium text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={editableUser.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Your appearance, personality, background..."
                  className="w-full flex-1 min-h-[200px] bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all resize-none leading-relaxed font-mono"
                />
                <p className="text-[10px] text-gray-500 text-right">
                  Used as &#123;&#123;user_description&#125;&#125; in prompts.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-[#181818]">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
          >
            <Save size={16} />
            Save
          </button>
        </footer>

      </div>
    </div>
  );
}
