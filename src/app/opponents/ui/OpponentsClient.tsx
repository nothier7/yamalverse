"use client";

import { useEffect, useMemo, useState } from "react";
import { getOpponentContribs, type OpponentContrib, type OpponentType } from "../../lib/queries/getOpponentContribs";
import OpponentsFilterBar from "./OpponentsFilterBar";
import OpponentsTable from "./OpponentsTable";

type FilterState = { type: OpponentType; season: string | null; year: number | null };

export default function OpponentsClient() {
  const [filters, setFilters] = useState<FilterState>({ type: "Both", season: null, year: null });
  const [rows, setRows] = useState<OpponentContrib[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const safe = useMemo(() => (filters.season && filters.year ? { ...filters, year: null } : filters), [filters]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await getOpponentContribs({ season: safe.season, year: safe.year, type: safe.type });
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to load.";
        setErr(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  }, [safe.season, safe.year, safe.type]);

  return (
    <div className="space-y-4">
      <OpponentsFilterBar
        type={filters.type}
        season={filters.season}
        year={filters.year}
        onChange={(next) => setFilters((f) => ({ ...f, ...next }))}
      />
      {loading ? <div className="opacity-70">Loading…</div> :
       err ? <div className="text-red-400">Error: {err}</div> :
       rows.length === 0 ? <div className="opacity-70">No opponents found for the selected filters.</div> :
       <OpponentsTable rows={rows} />}
    </div>
  );
}
