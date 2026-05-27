const CZK = new Intl.NumberFormat("cs-CZ", {
  style: "currency", currency: "CZK", maximumFractionDigits: 0,
});

const PCT = new Intl.NumberFormat("en-US", {
  style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1,
});

export const formatCZK = (n: number) => CZK.format(n);
export const formatNumber = (n: number) => new Intl.NumberFormat("cs-CZ").format(n);

export type Delta = { value: number; direction: "up" | "down" | "flat" };
export function computeDelta(current: number, prev: number): Delta {
  if (prev === 0) return { value: 0, direction: "flat" };
  const ratio = (current - prev) / prev;
  return {
    value: ratio,
    direction: Math.abs(ratio) < 0.001 ? "flat" : (ratio > 0 ? "up" : "down"),
  };
}
export const formatDelta = (d: Delta) => PCT.format(d.value);
