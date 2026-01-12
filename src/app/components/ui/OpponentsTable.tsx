"use client";

import { useEffect, useState } from "react";
import { getOpponentContribs } from "../../lib/queries/getOpponentContribs";

// Define OppRow type here if not exported from the module
type OppRow = {
  opponent: string;
  goals: number;
  assists: number;
  contributions: number;
};

export default function OpponentsTable({ season, year }: { season?: string; year?: number }) {
  const [rows, setRows] = useState<OppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await getOpponentContribs({ season: season ?? null, year: year ?? null });
        if (Array.isArray(data)) {
          setRows(data);
        } else if (data && typeof data === "object" && "Error" in data) {
          setErr(data.Error);
          setRows([]);
        } else {
          setErr("Unexpected response format.");
          setRows([]);
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to load.";
        setErr(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, [season, year]);

  if (loading) return <div className="opacity-70">Loading…</div>;
  if (err) return <div className="text-red-400">Error: {err}</div>;
  if (!rows.length) return <div className="opacity-70">No opponents found for the selected filter.</div>;

  return (
    <div className="overflow-x-auto rounded-2xl shadow-lg bg-white/5 backdrop-blur-md border border-white/10">
      <table className="w-full text-left">
        <thead className="text-sm uppercase tracking-wide text-neutral-300">
          <tr className="[&>th]:px-4 [&>th]:py-3">
            <th className="w-10">#</th>
            <th>Opponent</th>
            <th className="text-right">G</th>
            <th className="text-right">A</th>
            <th className="text-right">G + A</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {rows.map((r, i) => (
            <tr key={r.opponent} className="border-t border-white/10 hover:bg-white/[0.04] transition-colors">
              <td className="px-4 py-3 tabular-nums">{i + 1}</td>
              <td className="px-4 py-3">{r.opponent}</td>
              <td className="px-4 py-3 text-right tabular-nums">{r.goals}</td>
              <td className="px-4 py-3 text-right tabular-nums">{r.assists}</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">{r.contributions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
