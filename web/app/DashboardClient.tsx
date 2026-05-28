"use client";
import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { DateRangePicker } from "@/components/DateRangePicker";
import { KpiTile } from "@/components/KpiTile";
import { ProductPills } from "@/components/ProductPills";
import { RevenueByProductChart } from "@/components/RevenueByProductChart";
import { RevenueOverTimeChart } from "@/components/RevenueOverTimeChart";
import { ProductTable, type ProductRow } from "@/components/ProductTable";
import { filterRows, presetRange, previousRange, type DateRange } from "@/lib/filters";
import { formatCZK, formatNumber } from "@/lib/format";
import type { Snapshot } from "@/lib/types";

export function DashboardClient({ snapshot }: { snapshot: Snapshot }) {
  const LIFETIME_START = snapshot.daily.reduce(
    (min, r) => (r.date < min ? r.date : min),
    "9999-12-31",
  );
  const INITIAL_RANGE = presetRange("last30", LIFETIME_START);

  const [range, setRange] = useState<DateRange>(INITIAL_RANGE);
  const [category, setCategory] = useState<string | null>(null);

  const productsInCategory = useMemo(() => {
    if (!category) return null;
    return new Set(
      snapshot.products
        .filter(p => p.category === category)
        .map(p => p.product_normalized),
    );
  }, [category, snapshot.products]);

  const filtered = useMemo(() => {
    const rows = filterRows(snapshot.daily, range, null);
    if (!productsInCategory) return rows;
    return rows.filter(r => productsInCategory.has(r.product_normalized));
  }, [range, productsInCategory, snapshot.daily]);

  const prevRange = useMemo(() => previousRange(range), [range]);
  const prevFiltered = useMemo(() => {
    const rows = filterRows(snapshot.daily, prevRange, null);
    if (!productsInCategory) return rows;
    return rows.filter(r => productsInCategory.has(r.product_normalized));
  }, [prevRange, productsInCategory, snapshot.daily]);

  const totals = useMemo(() => {
    const revenue = filtered.reduce((s, r) => s + r.revenue_czk, 0);
    const orders  = filtered.reduce((s, r) => s + r.orders, 0);
    const spend   = filtered.reduce((s, r) => s + r.spend_czk, 0);
    return {
      revenue, orders, spend,
      aov:  orders ? revenue / orders : 0,
      roas: spend  ? revenue / spend  : 0,
      cac:  orders ? spend   / orders : 0,
    };
  }, [filtered]);

  const prevTotals = useMemo(() => {
    const revenue = prevFiltered.reduce((s, r) => s + r.revenue_czk, 0);
    const orders  = prevFiltered.reduce((s, r) => s + r.orders, 0);
    const spend   = prevFiltered.reduce((s, r) => s + r.spend_czk, 0);
    return {
      revenue, orders, spend,
      aov:  orders ? revenue / orders : 0,
      roas: spend  ? revenue / spend  : 0,
      cac:  orders ? spend   / orders : 0,
    };
  }, [prevFiltered]);

  const categoriesForPills = useMemo(() => {
    const rowsInRange = filterRows(snapshot.daily, range, null);
    const counts: Record<string, number> = {};
    for (const p of snapshot.products) {
      const has = rowsInRange.some(r => r.product_normalized === p.product_normalized);
      if (has) counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return [
      { id: null as string | null, label: "All products", count: total },
      ...Object.entries(counts).map(([cat, c]) => ({ id: cat, label: cat, count: c })),
    ];
  }, [range, snapshot.daily, snapshot.products]);

  const byProduct = useMemo(() => {
    const map = new Map<string, ProductRow>();
    for (const r of filtered) {
      const p = snapshot.products.find(x => x.product_normalized === r.product_normalized);
      const display = p?.product_display ?? r.product_raw;
      const isNew = p?.first_order_date
        ? p.first_order_date >= range.from && p.first_order_date <= range.to
        : false;
      const cur = map.get(r.product_normalized) ?? {
        product: display, orders: 0, revenue: 0, aov: 0, ad_spend: 0, roas: 0, cac: 0, isNew,
      };
      cur.orders   += r.orders;
      cur.revenue  += r.revenue_czk;
      cur.ad_spend += r.spend_czk;
      map.set(r.product_normalized, cur);
    }
    for (const v of map.values()) {
      v.aov  = v.orders ? v.revenue / v.orders : 0;
      v.roas = v.ad_spend ? v.revenue / v.ad_spend : 0;
      v.cac  = v.orders ? v.ad_spend / v.orders : 0;
    }
    return Array.from(map.values());
  }, [filtered, range, snapshot.products]);

  const barChartData = useMemo(() => byProduct.map(r => ({
    product: r.product, revenue: r.revenue, roas: r.roas, visual_hook: "",
  })), [byProduct]);

  const timeChartData = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; ad_spend: number; roas: number }>();
    for (const r of filtered) {
      const cur = map.get(r.date) ?? { date: r.date, revenue: 0, ad_spend: 0, roas: 0 };
      cur.revenue  += r.revenue_czk;
      cur.ad_spend += r.spend_czk;
      map.set(r.date, cur);
    }
    return Array.from(map.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(r => ({ ...r, roas: r.ad_spend ? r.revenue / r.ad_spend : 0 }));
  }, [filtered]);

  return (
    <main className="min-h-screen">
      <Nav generatedAt={snapshot.generated_at}>
        <DateRangePicker
          range={range}
          lifetimeStart={LIFETIME_START}
          onChange={(r) => setRange(r)}
        />
      </Nav>

      <section className="max-w-dashboard mx-auto px-6 py-10 space-y-10">
        <header className="space-y-2">
          <p className="font-mono text-xs text-ink/60">{range.from} → {range.to}</p>
          <h1 className="font-serif text-4xl text-forest">Sales Pulse</h1>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiTile label="Revenue"  value={formatCZK(totals.revenue)} currentNumeric={totals.revenue} prevValue={prevTotals.revenue} />
          <KpiTile label="Orders"   value={formatNumber(totals.orders)} currentNumeric={totals.orders} prevValue={prevTotals.orders} />
          <KpiTile label="AOV"      value={formatCZK(totals.aov)} currentNumeric={totals.aov} prevValue={prevTotals.aov} />
          <KpiTile label="Ad spend" value={formatCZK(totals.spend)} currentNumeric={totals.spend} prevValue={prevTotals.spend} />
          <KpiTile label="ROAS"     value={totals.roas.toFixed(2)} unit="x" currentNumeric={totals.roas} prevValue={prevTotals.roas} />
          <KpiTile label="CAC"      value={formatCZK(totals.cac)} currentNumeric={totals.cac} prevValue={prevTotals.cac} />
        </div>

        <ProductPills
          categories={categoriesForPills}
          selected={category}
          onSelect={setCategory}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueByProductChart data={barChartData} />
          <RevenueOverTimeChart data={timeChartData} />
        </div>

        <ProductTable rows={byProduct} />
      </section>

      <footer className="border-t border-bone-line mt-16">
        <div className="max-w-dashboard mx-auto px-6 py-6 flex items-center justify-between text-xs font-mono text-ink/60">
          <span>Built by Zdeněk Bradáč · <a className="underline" href="https://zdenekbradac.vercel.app">zdenekbradac.vercel.app</a></span>
          <span>
            <a className="underline mr-4" href="/qa">QA: unmatched ad spend</a>
            <a className="underline" href="https://github.com/zdenekbrdy-beep/alpinegear-pulse">GitHub repo</a>
          </span>
        </div>
      </footer>
    </main>
  );
}
