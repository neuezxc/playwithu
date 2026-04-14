'use client'
import React, { useState } from 'react'
import { X, Plus, Trash2, BookOpen, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'

import useCharacterStore from '@/app/store/useCharacterStore'
import useLorebookStore from '@/app/store/useLorebookStore'

export default function LorebookModal({ onClose }) {
  const router = useRouter()
  const { character, addCharLorebookEntry, updateCharLorebookEntry, deleteCharLorebookEntry } = useCharacterStore()
  const { globalLorebooks, setModal: setGlobalModal } = useLorebookStore()

  const charEntries = character?.lorebook?.entries || []
  const enabledGlobalCount = globalLorebooks.filter((lb) => lb.enabled).length
  const enabledGlobalEntries = globalLorebooks
    .filter((lb) => lb.enabled)
    .reduce((acc, lb) => acc + lb.entries.length, 0)

  const handleAddEntry = () => {
    addCharLorebookEntry(character.id)
  }

  const handleUpdateEntry = (entryId, field, value) => {
    updateCharLorebookEntry(character.id, entryId, { [field]: value })
  }

  const handleDeleteEntry = (entryId) => {
    deleteCharLorebookEntry(character.id, entryId)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0d0d0d]/90 rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#3A9E49]" />
            <h2 className="text-sm font-semibold text-white">Lorebook — {character?.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8e8e8e] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </header>

        {/* Info bar */}
        <div className="px-5 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-[11px] text-[#656565]">
          <span>{charEntries.length} entries</span>
          <span>{enabledGlobalCount} global lorebooks ({enabledGlobalEntries} entries)</span>
        </div>

        {/* Entries list */}
        <main className="flex-1 overflow-y-auto p-4 space-y-3">
          {charEntries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-[#656565] gap-2">
              <BookOpen size={32} strokeWidth={1} className="opacity-30" />
              <p className="text-sm">No entries yet.</p>
              <p className="text-[10px] text-[#454545]">Add keywords and content to inject world info into the chat.</p>
            </div>
          )}

          {charEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-white/[0.03] border border-white/10 rounded-xl space-y-2 group hover:border-[#3A9E49]/20 transition-all"
            >
              {/* Keywords */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#656565]">Keywords</label>
                <input
                  type="text"
                  value={entry.keywords}
                  onChange={(e) => handleUpdateEntry(entry.id, 'keywords', e.target.value)}
                  placeholder="sword, blade, weapon (comma-separated)"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#f2f2f2] placeholder:text-[#454545] focus:border-[#3A9E49]/50 focus:bg-[#3A9E49]/5 outline-none transition-all"
                />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#656565]">Content</label>
                <textarea
                  value={entry.content}
                  onChange={(e) => handleUpdateEntry(entry.id, 'content', e.target.value)}
                  placeholder="World info content..."
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#f2f2f2] placeholder:text-[#454545] focus:border-[#3A9E49]/50 focus:bg-[#3A9E49]/5 outline-none transition-all font-mono resize-none"
                />
              </div>

              {/* Delete button */}
              <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </main>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/5 bg-[#0d0d0d]/80 space-y-2 shrink-0">
          <button
            onClick={handleAddEntry}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-[#3A9E49] text-white hover:bg-[#43b654] shadow-lg shadow-[#3A9E49]/20 border border-white/10 transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            Add Entry
          </button>

          <button
            onClick={() => {
              onClose()
              router.push('/lorebook')
            }}
            className="w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 bg-white/5 text-[#8e8e8e] hover:text-white hover:bg-white/10 border border-white/5 transition-all"
          >
            <Globe size={14} />
            Manage Global Lorebooks
          </button>
        </div>
      </div>
    </div>
  )
}
