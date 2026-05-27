import fs from "node:fs";
import path from "node:path";
import type { Snapshot } from "./types";

export function loadSnapshot(): Snapshot {
  const p = path.join(process.cwd(), "..", "data", "snapshot.json");
  if (!fs.existsSync(p)) {
    return { generated_at: new Date().toISOString(), products: [], daily: [], unmatched_ad_spend: [] };
  }
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw) as Snapshot;
}
