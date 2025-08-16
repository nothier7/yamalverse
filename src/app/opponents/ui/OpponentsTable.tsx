"use client";

import type { OpponentContrib } from "../../lib/queries/getOpponentContribs";

export default function OpponentsTable({ rows }: { rows: OpponentContrib[] }) {
  if (!rows?.length) {
    return <div className="opacity-70">No opponents found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl shadow-lg bg-white/5 backdrop-blur-md border border-white/10">
      <table className="w-full text-left">
        <thead className="text-sm uppercase tracking-wide text-neutral-300">
          <tr className="[&>th]:px-4 [&>th]:py-3">
            <th className="w-10">#</th>
            <th>Opponent</th>
            <th className="text-right">Games</th>
            <th className="text-right">G</th>
            <th className="text-right">A</th>
            <th className="text-right">G+A</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {rows.map((r, i) => (
            <tr key={`${r.opponent}-${i}`} className="border-t border-white/10 hover:bg-white/[0.04] transition-colors">
              <td className="px-4 py-3 tabular-nums">{i + 1}</td>
              <td className="px-4 py-3">{r.opponent}</td>
              <td className="px-4 py-3 text-right tabular-nums">{r.games}</td>
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
