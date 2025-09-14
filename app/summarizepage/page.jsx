"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import useChatStore from "../store/useChatStore";

function page() {

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <textarea>
      </textarea>
      <Link href="/">Go back</Link>
    </div>
  );
}

export default page;
