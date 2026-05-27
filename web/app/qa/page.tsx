import { Nav } from "@/components/Nav";
import { loadSnapshot } from "@/lib/snapshot";

export default function QAPage() {
  const snapshot = loadSnapshot();
  const rows = snapshot.unmatched_ad_spend;
  return (
    <main className="min-h-screen">
      <Nav generatedAt={snapshot.generated_at} />
      <section className="max-w-dashboard mx-auto px-6 py-10 space-y-6">
        <header>
          <p className="font-mono text-xs text-ink/60">Data quality</p>
          <h1 className="font-serif text-3xl text-forest">Unmatched ad spend rows</h1>
          <p className="text-sm text-ink/70 mt-2 max-w-prose">
            Ad-spend entries whose (date, product) does not match any order line item. These are surfaced here instead of being silently dropped, so the data-entry team can fix the source row.
          </p>
        </header>
        {rows.length === 0 ? (
          <p className="font-mono text-sm text-moss">All ad-spend rows matched. Nothing to review.</p>
        ) : (
          <div className="bg-bone/40 border border-bone-line rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bone-line bg-bone/30 text-left">
                  {["Date", "Campaign", "Product", "Spend", "Visual hook", "Intent"].map(h => (
                    <th key={h} className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-bone-line/60 last:border-0">
                    <td className="px-4 py-3 font-mono">{r.date}</td>
                    <td className="px-4 py-3">{r.campaign}</td>
                    <td className="px-4 py-3 font-serif">{r.product}</td>
                    <td className="px-4 py-3 font-mono">{r.spend_czk}</td>
                    <td className="px-4 py-3 text-ink/70">{r.visual_hook}</td>
                    <td className="px-4 py-3 text-ink/70">{r.intent_framing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <a href="/" className="inline-block font-mono text-xs underline">← back to dashboard</a>
      </section>
    </main>
  );
}
