"use client";

import dynamic from "next/dynamic";

const ThreeBlockMap = dynamic(() => import("./three-block-map"), {
  ssr: false,
});

export default function TestPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#031525]">
      <ThreeBlockMap />
    </main>
  );
}
