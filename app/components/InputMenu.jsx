"use client";

import { useState, useRef, useEffect } from "react";
import {
  Settings2,
  CodeXml,
  Brain,
  User,
  FileText,
  Image,
  Braces,
  Asterisk,
  Regex,
  Bug,
} from "lucide-react";
import useApiSettingStore from "../store/useApiSettingStore";
import useCharacterStore from "../store/useCharacterStore";
import useMemoryStore from "../store/useMemoryStore";
import useDebugStore from "../store/useDebugStore";

export default function InputMenu({
  setIsCustomPromptOpen,
  setIsDebugModalOpen,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const setModal = useApiSettingStore((state) => state.setModal);
  const setModalMemory = useMemoryStore((state) => state.setModal);
  const setCharacterModal = useCharacterStore(
    (state) => state.setCharacterModal
  );
  const setPatternReplacementModal = useCharacterStore(
    (state) => state.setPatternReplacementModal
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      icon: <Braces size={18} />,
      label: "Custom Prompt",
      onClick: () => {
        setIsCustomPromptOpen(true);
        setIsOpen(false);
      },
    },
    {
      icon: <Brain size={18} />,
      label: "Memory",
      onClick: () => {
        setModalMemory(true);
        setIsOpen(false);
      },
    },
    {
      icon: <Regex />,
      label: "Pattern Replacement",
      onClick: () => {
        setPatternReplacementModal(true);
        setIsOpen(false);
      },
    },
    {
      icon: <Bug size={18} />,
      label: "Debug",
      onClick: () => {
        setIsDebugModalOpen(true);
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 bg-white/5 border border-[#454545] rounded-lg hover:bg-[#3A9E49]/30 hover:border-[#3A9E49] transition-all"
      >
        <Settings2 size={16} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-50 bg-[#212121] border border-[#454545] rounded-lg shadow-lg z-10">
          <div className="">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="flex items-center gap-2 w-full px-4 py-2 text-left text-[#CDCDCD] hover:bg-[#3A9E49]/30 border-b border-[#454545]/40 hover:border-[#3A9E49] transition-all"
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
