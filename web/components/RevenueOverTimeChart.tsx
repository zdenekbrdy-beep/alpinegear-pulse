"use client";
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { formatCZK } from "@/lib/format";

type Datum = { date: string; revenue: number; ad_spend: number; roas: number };

export function RevenueOverTimeChart({ data }: { data: Datum[] }) {
  return (
    <div className="bg-bone/40 border border-bone-line rounded-xl p-6">
      <h3 className="font-serif text-xl text-forest mb-1">Revenue vs ad spend</h3>
      <p className="font-mono text-xs text-ink/60 mb-4">Daily, with ROAS secondary axis</p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="var(--bone-line)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "var(--ink)", fontSize: 11 }} minTickGap={20} />
          <YAxis yAxisId="left" tick={{ fill: "var(--ink)", fontSize: 11 }}
                 tickFormatter={(v) => formatCZK(v as number)} />
          <YAxis yAxisId="right" orientation="right"
                 tick={{ fill: "var(--terracotta)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "var(--paper)", border: "1px solid var(--ink)",
              borderRadius: 8, fontSize: 12,
            }}
            formatter={(v, name) => {
              const n = Number(v);
              if (name === "revenue")  return [formatCZK(n), "Revenue"];
              if (name === "ad_spend") return [formatCZK(n), "Ad spend"];
              if (name === "roas")     return [n.toFixed(2) + "x", "ROAS"];
              return [String(v ?? ""), String(name ?? "")];
            }}
          />
          <Line yAxisId="left"  type="monotone" dataKey="revenue"  stroke="var(--forest)"
                strokeWidth={2} dot={false} />
          <Line yAxisId="left"  type="monotone" dataKey="ad_spend" stroke="var(--clay)"
                strokeWidth={2} strokeDasharray="4 4" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="roas"     stroke="var(--terracotta)"
                strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
