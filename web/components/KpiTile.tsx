import { computeDelta, formatDelta, type Delta } from "@/lib/format";

type Props = {
  label: string;
  value: string;
  prevValue?: number;
  currentNumeric?: number;
  unit?: string;
};

export function KpiTile({ label, value, prevValue, currentNumeric, unit }: Props) {
  let delta: Delta | null = null;
  if (prevValue !== undefined && currentNumeric !== undefined) {
    delta = computeDelta(currentNumeric, prevValue);
  }
  const arrowColor = delta?.direction === "up" ? "text-moss"
                  : delta?.direction === "down" ? "text-rust"
                  : "text-ink/40";
  const arrow = delta?.direction === "up" ? "▲" : delta?.direction === "down" ? "▼" : "—";
  return (
    <div className="bg-bone/40 border border-bone-line rounded-xl px-5 py-6 overflow-hidden">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink/60">{label}</p>
      <p className="font-serif text-[1.5rem] xl:text-[1.75rem] text-ink mt-2 leading-tight tracking-tight tabular-nums whitespace-nowrap">
        {value}{unit && <span className="text-sm text-ink/50 ml-1">{unit}</span>}
      </p>
      {delta && (
        <p className={`font-mono text-xs mt-2 ${arrowColor}`}>
          {arrow} {formatDelta(delta)} vs prev period
        </p>
      )}
    </div>
  );
}
