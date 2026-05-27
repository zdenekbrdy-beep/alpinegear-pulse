"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCZK } from "@/lib/format";

type Datum = { product: string; revenue: number; roas: number; visual_hook: string };

export function RevenueByProductChart({ data }: { data: Datum[] }) {
  return (
    <div className="bg-bone/40 border border-bone-line rounded-xl p-6">
      <h3 className="font-serif text-xl text-forest mb-1">Revenue by product</h3>
      <p className="font-mono text-xs text-ink/60 mb-4">Sorted descending</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 24 }}>
          <CartesianGrid stroke="var(--bone-line)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="product" tick={{ fill: "var(--ink)", fontSize: 11 }}
                 interval={0} angle={-25} textAnchor="end" height={60} />
          <YAxis tick={{ fill: "var(--ink)", fontSize: 11 }} tickFormatter={(v) => formatCZK(v as number)} />
          <Tooltip
            contentStyle={{
              background: "var(--paper)", border: "1px solid var(--ink)",
              borderRadius: 8, fontSize: 12,
            }}
            formatter={(v, name) => {
              if (name === "revenue") return [formatCZK(Number(v)), "Revenue"];
              return [String(v ?? ""), String(name ?? "")];
            }}
            labelFormatter={(label, payload) => {
              const d = payload?.[0]?.payload as Datum | undefined;
              if (!d) return String(label);
              return `${label} · ROAS ${d.roas.toFixed(2)}x${d.visual_hook ? ` · ${d.visual_hook}` : ""}`;
            }}
          />
          <Bar dataKey="revenue" fill="var(--forest)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
