"use client";
import { useState } from "react";
import { presetRange, type DateRange } from "@/lib/filters";

const PRESETS: { id: Parameters<typeof presetRange>[0]; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 days" },
  { id: "last14", label: "Last 14 days" },
  { id: "last30", label: "Last 30 days" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "lifetime", label: "Lifetime" },
];

type Props = {
  range: DateRange;
  lifetimeStart: string;
  onChange: (range: DateRange, presetLabel: string) => void;
};

export function DateRangePicker({ range, lifetimeStart, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(range.from);
  const [customTo, setCustomTo]   = useState(range.to);
  const [activeLabel, setActiveLabel] = useState("Last 30 days");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="px-3 py-2 border border-bone-line bg-bone/40 rounded-lg text-sm font-mono hover:bg-bone transition"
      >
        {activeLabel} · {range.from} → {range.to}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-paper border border-bone-line rounded-xl shadow-lg p-3 z-40">
          <ul className="space-y-1">
            {PRESETS.map(p => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    const r = presetRange(p.id, lifetimeStart);
                    setActiveLabel(p.label);
                    onChange(r, p.label);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-bone text-sm"
                >
                  {p.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-bone-line my-3" />
          <p className="text-xs font-mono text-ink/60 mb-2">Custom</p>
          <div className="flex gap-2">
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                   className="flex-1 border border-bone-line rounded-md px-2 py-1 text-xs" />
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                   className="flex-1 border border-bone-line rounded-md px-2 py-1 text-xs" />
          </div>
          <button
            type="button"
            className="mt-2 w-full bg-forest text-paper text-sm py-2 rounded-md hover:opacity-90"
            onClick={() => {
              setActiveLabel("Custom");
              onChange({ from: customFrom, to: customTo }, "Custom");
              setOpen(false);
            }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
