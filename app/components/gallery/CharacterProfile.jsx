'use client'
import React from 'react';
import { User } from 'lucide-react';

export default function CharacterProfile({ character }) {
  return (
    <>
      {/* Character Header */}
      <header className="flex-shrink-0 flex justify-center items-center w-full h-[45px] py-10">
        <h1 className="text-base font-medium tracking-tight flex flex-col items-center">
          {character.name}
          <span className="text-sm font-normal opacity-40">
            {character.bio}
          </span>
        </h1>
      </header>
    </>
  );
}