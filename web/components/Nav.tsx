"use client";
import { ReactNode } from "react";

export function Nav({ generatedAt, children }: { generatedAt: string; children?: ReactNode }) {
  const synced = new Date(generatedAt);
  const stamp = synced.toLocaleString("en-GB", {
    hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", year: "numeric",
    timeZone: "Europe/Prague",
  });
  const isFresh = Date.now() - synced.getTime() < 60 * 60 * 1000;
  return (
    <nav className="sticky top-0 z-30 backdrop-blur bg-paper/85 border-b border-bone-line">
      <div className="max-w-dashboard mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-xl text-forest">AlpineGear</span>
          <span className="font-mono text-xs text-ink/60">· Sales Pulse</span>
        </div>
        <div className="flex items-center gap-4">
          {children}
          <span className={`hidden md:inline font-mono text-xs text-ink/70 ${isFresh ? "synced-pulse" : ""}`}>
            Last synced: {stamp} CEST
          </span>
        </div>
      </div>
    </nav>
  );
}
