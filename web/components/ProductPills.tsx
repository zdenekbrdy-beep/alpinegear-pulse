"use client";

type Props = {
  categories: { id: string | null; label: string; count: number }[];
  selected: string | null;
  onSelect: (id: string | null) => void;
};

export function ProductPills({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(c => {
        const isActive = selected === c.id;
        return (
          <button
            key={c.id ?? "all"}
            type="button"
            onClick={() => onSelect(c.id)}
            className={`px-4 py-2 rounded-full border text-sm transition
              ${isActive
                ? "bg-forest text-paper border-forest"
                : "bg-bone/40 text-ink border-bone-line hover:bg-bone"}`}
          >
            {c.label} <span className="font-mono text-xs opacity-70 ml-1">{c.count}</span>
          </button>
        );
      })}
    </div>
  );
}
