import "server-only";
import { loadSnapshot } from "@/lib/snapshot";
export function getSnapshot() { return loadSnapshot(); }
