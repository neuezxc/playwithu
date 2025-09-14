"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import useChatStore from "../store/useChatStore";

function page() {
  useEffect(() => {
    console.log(character.messages.length);
  }, [character.messages]);
  const { summarizeText } = useChatStore();
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <textarea name="" id="">
        {summarizeText}
      </textarea>
      <Link href="/">Go back</Link>
    </div>
  );
}

export default page;
