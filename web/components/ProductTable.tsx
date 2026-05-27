"use client";
import { useState } from "react";
import { formatCZK, formatNumber } from "@/lib/format";
import { NewBadge } from "./NewBadge";

export type ProductRow = {
  product: string;
  orders: number;
  revenue: number;
  aov: number;
  ad_spend: number;
  roas: number;
  cac: number;
  isNew: boolean;
};

type SortKey = keyof Omit<ProductRow, "isNew" | "product">;

export function ProductTable({ rows }: { rows: ProductRow[] }) {
  const [sort, setSort] = useState<SortKey>("revenue");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const sorted = [...rows].sort((a, b) => {
    const av = a[sort];
    const bv = b[sort];
    return dir === "desc" ? (bv as number) - (av as number) : (av as number) - (bv as number);
  });

  const headers: { key: SortKey | "product"; label: string; align: "left" | "right" }[] = [
    { key: "product",  label: "Product",  align: "left"  },
    { key: "orders",   label: "Orders",   align: "right" },
    { key: "revenue",  label: "Revenue",  align: "right" },
    { key: "aov",      label: "AOV",      align: "right" },
    { key: "ad_spend", label: "Ad spend", align: "right" },
    { key: "roas",     label: "ROAS",     align: "right" },
    { key: "cac",      label: "CAC",      align: "right" },
  ];

  return (
    <div className="bg-bone/40 border border-bone-line rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-bone-line">
        <h3 className="font-serif text-xl text-forest">All products</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bone-line bg-bone/30">
              {headers.map(h => (
                <th key={h.key}
                    className={`px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/60
                                ${h.align === "right" ? "text-right" : "text-left"} cursor-pointer`}
                    onClick={() => {
                      if (h.key === "product") return;
                      const k = h.key as SortKey;
                      if (k === sort) setDir(dir === "asc" ? "desc" : "asc");
                      else { setSort(k); setDir("desc"); }
                    }}>
                  {h.label}{h.key === sort && (dir === "desc" ? " ▼" : " ▲")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => (
              <tr key={r.product} className="border-b border-bone-line/60 last:border-0">
                <td className="px-4 py-3 font-serif text-ink">
                  {r.product}{r.isNew && <NewBadge />}
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatNumber(r.orders)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatCZK(r.revenue)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatCZK(r.aov)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatCZK(r.ad_spend)}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {r.roas > 0 ? r.roas.toFixed(2) + "x" : "—"}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {r.cac > 0 ? formatCZK(r.cac) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
