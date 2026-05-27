import { addDays, format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import type { DailyRow } from "./types";

export type DateRange = { from: string; to: string };

export function todayIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function presetRange(
  preset:
    | "today" | "yesterday" | "last7" | "last14" | "last30"
    | "thisMonth" | "lastMonth" | "lifetime",
  lifetimeStart: string,
): DateRange {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  switch (preset) {
    case "today":     return { from: todayStr, to: todayStr };
    case "yesterday": { const y = format(addDays(today, -1), "yyyy-MM-dd"); return { from: y, to: y }; }
    case "last7":     return { from: format(addDays(today, -6),  "yyyy-MM-dd"), to: todayStr };
    case "last14":    return { from: format(addDays(today, -13), "yyyy-MM-dd"), to: todayStr };
    case "last30":    return { from: format(addDays(today, -29), "yyyy-MM-dd"), to: todayStr };
    case "thisMonth": return { from: format(startOfMonth(today), "yyyy-MM-dd"), to: todayStr };
    case "lastMonth": {
      const lm = subMonths(today, 1);
      return { from: format(startOfMonth(lm), "yyyy-MM-dd"), to: format(endOfMonth(lm), "yyyy-MM-dd") };
    }
    case "lifetime":  return { from: lifetimeStart, to: todayStr };
  }
}

export function filterRows(
  daily: DailyRow[],
  range: DateRange,
  productFilter: string | null,
): DailyRow[] {
  return daily.filter(r => {
    if (r.date < range.from || r.date > range.to) return false;
    if (productFilter && r.product_normalized !== productFilter) return false;
    return true;
  });
}

export function previousRange(range: DateRange): DateRange {
  const ms = 86_400_000;
  const from = new Date(range.from + "T00:00:00Z").getTime();
  const to   = new Date(range.to   + "T00:00:00Z").getTime();
  const lenDays = Math.round((to - from) / ms) + 1;
  const prevTo = new Date(from - ms);
  const prevFrom = new Date(prevTo.getTime() - (lenDays - 1) * ms);
  return {
    from: format(prevFrom, "yyyy-MM-dd"),
    to:   format(prevTo, "yyyy-MM-dd"),
  };
}
