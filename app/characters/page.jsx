import React from 'react';
import { SquarePen, Download, Trash2 } from 'lucide-react';

export default function CharacterManager() {
  return (
    <div className="bg-[#151615] h-screen w-full flex justify-center p-4 md:p-8">
      {/* Main Content Container */}
      <div className="bg-[#151615] rounded-lg flex flex-col w-full max-w-6xl p-4 sm:p-8">
        
        {/* Header */}
        <header className="w-full pb-6 mb-6 border-b border-[#3b3b3b]">
          <h1 className="text-[#f2f2f2] text-2xl md:text-3xl font-bold tracking-tight">
            Character Manager
          </h1>
        </header>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <button className="bg-[#5fdb7226] border border-[#5fdb72] rounded-md px-5 py-2 text-[#edffef] text-sm font-medium hover:bg-[#5fdb7236] transition-colors">
            Create Character
          </button>
          <div className="flex items-center gap-2">
            <button className="bg-[#45454533] border border-[#454545] rounded-md px-5 py-2 text-white text-sm font-medium hover:bg-[#45454555] transition-colors">
              Import
            </button>
            <button className="bg-[#45454533] border border-[#454545] rounded-md px-5 py-2 text-white text-sm font-medium hover:bg-[#45454555] transition-colors">
              Export
            </button>
          </div>
        </div>

        {/* Character List Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
          
          {/* Active Character Card */}
          <div id="CharCardActive_17_7" className="bg-[#5fdb721a] border border-[#5fdb72] rounded-lg overflow-hidden flex flex-col group basis-1/2">
            <div id="CharImage_17_8" className="w-full h-56 bg-[#404040]">
              {/* Image would go here, e.g., <img src="..." alt="Character" className="w-full h-full object-cover" /> */}
            </div>
            <div className="p-4 flex flex-col flex-grow ">
              <h2 id="CharName_18_11" className="text-white text-xl font-medium">Character</h2>
              <p id="CharBio_18_16" className="text-[#949494] text-sm mt-1 mb-4 flex-grow">this is character bio..</p>
              <div id="Btns_89_114" className="flex items-center">
                <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                  <SquarePen id="LucideSquarePen_89_95" size={16} className="text-[#97D7A0]" />
                </button>
                <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                  <Download id="LucideDownload_89_100" size={16} className="text-[#97D7A0]" />
                </button>
                <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors ml-auto">
                  <Trash2 id="LucideTrash_89_107" size={16} className="text-white/30 transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* Inactive Character Card */}
          <div id="CharCard_18_19" className="bg-[#4545451a] border-2 border-[#454545] rounded-lg overflow-hidden flex flex-col group basis-1/2">
            <div id="CharImage_18_21" className="w-full h-56 bg-[#404040]"></div>
            <div className="p-4 flex flex-col flex-grow">
              <h2 id="CharName_18_23" className="text-white text-xl font-medium">Character</h2>
              <p id="CharBio_18_20" className="text-[#949494] text-sm mt-1 mb-4 flex-grow">this is character bio..</p>
              <div id="Btns_89_115" className="flex items-center ">
                <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                  <SquarePen id="LucideSquarePen_89_116" size={16} className="text-[#DADADA]" />
                </button>
                <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                  <Download id="LucideDownload_89_118" size={16} className="text-[#DADADA]" />
                </button>
                <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors ml-auto">
                  <Trash2 id="LucideTrash_89_120" size={16} className="text-white/30  transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}