"use client";

import { useId } from "react";
import type { OpponentType } from "../../lib/queries/getOpponentContribs";

type Props = {
  type: OpponentType;
  season: string | null;
  year: number | null;
  onChange: (next: Partial<{ type: OpponentType; season: string | null; year: number | null }>) => void;
};

const types: OpponentType[] = ["Both", "Club", "International"];

export default function OpponentsFilterBar({ type, season, year, onChange }: Props) {
  const seasonId = useId();
  const yearId = useId();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      {/* Type Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-300">Type:</span>
        <div className="inline-flex rounded-xl border border-white/10 bg-white/5 backdrop-blur p-1">
          {types.map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                onClick={() => onChange({ type: t })}
                className={[
                  "px-3 py-1.5 text-sm rounded-lg transition",
                  active ? "bg-white/20 text-white" : "text-neutral-300 hover:bg-white/10",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Season / Year (mutually exclusive) */}
      <div className="flex items-end gap-3">
        <div className="flex flex-col">
          <label htmlFor={seasonId} className="text-xs text-neutral-400 mb-1">
            Season
          </label>
          <input
            id={seasonId}
            value={season ?? ""}
            placeholder="e.g. 2024/25"
            onChange={(e) => onChange({ season: e.target.value || null, year: null })}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor={yearId} className="text-xs text-neutral-400 mb-1">
            Year
          </label>
          <input
            id={yearId}
            type="number"
            value={year ?? ""}
            placeholder="e.g. 2024"
            onChange={(e) => {
              const val = e.target.value;
              onChange({ year: val ? Number(val) : null, season: null });
            }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-white/20 w-28"
          />
        </div>

        <button
          onClick={() => onChange({ season: null, year: null, type })}
          className="h-10 px-3 rounded-lg border border-white/10 bg-transparent hover:bg-white/10 text-sm"
          title="Clear filters"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
