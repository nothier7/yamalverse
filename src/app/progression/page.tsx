'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import supabase from '../lib/supabaseClient';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import StatsFilterBar from '../components/StatsFilterBar';

type MatchRow = {
  date: string; // ISO
  season: string | null;
  year: number | null;
  competition: string | null;
  opponent: string | null;
  goals?: number | null;
  assists?: number | null;
  take_ons_attempted?: number | null;
  take_ons_successful?: number | null;
};

type MetricKey = 'ga' | 'goals' | 'assists' | 'dribbles';

type Point = {
  idx: number;
  date: string;
  opponent: string | null;
  competition: string | null;
  goals: number;
  assists: number;
  ga: number;
  dribbles: number | null;
};

// Simple, dependency-free line chart with dots, tooltip and axes
function LineChart({
  data,
  metric,
  color,
  height = 320,
}: {
  data: Point[];
  metric: MetricKey;
  color: string;
  height?: number;
}) {
  const [hover, setHover] = useState<{
    p: Point;
    cx: number;
    cy: number;
    x: number;
    y: number;
  } | null>(null);

  const padding = { top: 24, right: 16, bottom: 36, left: 36 };
  const width = 960; // container is responsive via CSS; SVG viewBox handles scaling

  const values = data.map((d) => (metric === 'dribbles' ? (d.dribbles ?? 0) : d[metric]));
  const maxY = Math.max(1, ...values);

  const xScale = (i: number) => {
    const n = Math.max(1, data.length);
    const innerW = width - padding.left - padding.right;
    return padding.left + (innerW * (i - 1)) / (n - 1 || 1);
  };
  const yScale = (v: number) => {
    const innerH = height - padding.top - padding.bottom;
    return padding.top + innerH - (innerH * v) / maxY;
  };

  const linePath = useMemo(() => {
    if (data.length === 0) return '';
    const coords = data.map((d) => {
      const v = metric === 'dribbles' ? (d.dribbles ?? 0) : d[metric];
      return `${xScale(d.idx)},${yScale(v)}`;
    });
    return `M${coords.join(' L')}`;
  }, [data, metric]);

  const ticksX = useMemo(() => {
    const out: { x: number; label: string }[] = [];
    const n = data.length;
    const step = n > 10 ? Math.ceil(n / 10) : 1;
    for (let i = 1; i <= n; i += step) {
      out.push({ x: xScale(i), label: String(i) });
    }
    if (n > 1) out.push({ x: xScale(n), label: String(n) });
    return out;
  }, [data]);

  const ticksY = useMemo(() => {
    const out: number[] = [];
    const t = Math.max(3, Math.min(6, maxY));
    const step = Math.max(1, Math.ceil(maxY / t));
    for (let v = 0; v <= maxY; v += step) out.push(v);
    if (!out.includes(maxY)) out.push(maxY);
    return out;
  }, [maxY]);

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[280px] sm:h-[360px]"
        role="img"
        aria-label="Per-match progression chart"
      >
        {/* Grid */}
        <g stroke="hsl(var(--border))" opacity="0.4">
          {ticksY.map((t, i) => (
            <line key={i} x1={padding.left} x2={width - padding.right} y1={yScale(t)} y2={yScale(t)} />
          ))}
        </g>

        {/* Axes labels */}
        <g fill="white" fontSize="10">
          {ticksX.map((t, i) => (
            <text key={i} x={t.x} y={height - padding.bottom + 14} textAnchor="middle">
              {t.label}
            </text>
          ))}
          {ticksY.map((t, i) => (
            <text key={i} x={padding.left - 8} y={yScale(t) + 3} textAnchor="end">
              {t}
            </text>
          ))}
        </g>
        {/* Axis titles */}
        <g fill="white" fontSize="12" fontWeight={600}>
          <text x={width / 2} y={height - 6} textAnchor="middle">Game</text>
          <text x={12} y={height / 2} textAnchor="middle" transform={`rotate(-90 12 ${height / 2})`}>
            Stats
          </text>
        </g>

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} />

        {/* Points */}
        {data.map((d) => {
          const v = metric === 'dribbles' ? (d.dribbles ?? 0) : d[metric];
          const cx = xScale(d.idx);
          const cy = yScale(v);
          return (
            <g key={d.idx}>
              <circle cx={cx} cy={cy} r={3.5} fill={color} opacity={0.9}
                onMouseEnter={(e) => {
                  setHover({ p: d, cx, cy, x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-white/10 bg-black/80 text-white text-xs px-3 py-2 shadow"
          style={{ left: Math.min(hover.cx, 860), top: Math.max(hover.cy - 60, 0) }}
        >
          <div className="font-semibold">Game {hover.p.idx}</div>
          <div className="opacity-90">
            {metric.toUpperCase()}: {metric === 'dribbles' ? (hover.p.dribbles ?? 0) : hover.p[metric]}
          </div>
          <div className="opacity-80">
            {new Date(hover.p.date).toLocaleDateString()} · vs {hover.p.opponent || '—'} · {hover.p.competition || '—'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProgressionPage() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const [metric, setMetric] = useState<MetricKey>('ga');
  const [selectedFilter, setSelectedFilter] = useState<{
    type: 'season' | 'year';
    value: string | number;
  } | null>(null);
  const [competitions, setCompetitions] = useState<string[]>([]); // available list
  const [selectedComps, setSelectedComps] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MatchRow[]>([]);

  // range selector removed

  // URL -> State on mount
  useEffect(() => {
    const urlMetric = (params.get('metric') as MetricKey) || 'ga';
    setMetric(['ga', 'goals', 'assists', 'dribbles'].includes(urlMetric) ? urlMetric : 'ga');

    const season = params.get('season');
    const year = params.get('year');
    if (season) setSelectedFilter({ type: 'season', value: season });
    else if (year) setSelectedFilter({ type: 'year', value: Number(year) });

    const compParams = params.getAll('comp');
    if (compParams && compParams.length) setSelectedComps(compParams);
  }, []);

  // State -> URL
  useEffect(() => {
    const sp = new URLSearchParams();
    sp.set('metric', metric);
    if (selectedFilter) {
      if (selectedFilter.type === 'season') sp.set('season', String(selectedFilter.value));
      if (selectedFilter.type === 'year') sp.set('year', String(selectedFilter.value));
    }
    selectedComps.forEach((c) => sp.append('comp', c));
    router.replace(`${pathname}?${sp.toString()}`);
  }, [metric, selectedFilter, selectedComps]);

  // Load available competitions (distinct)
  const loadMeta = useCallback(async () => {
    const { data } = await supabase
      .from('yamal_matches')
      .select('competition, season, year');
    const comps = Array.from(new Set((data || []).map((r) => r.competition).filter(Boolean))) as string[];
    // seasons / years for dropdowns (fallbacks if empty)
    const seasons = Array.from(new Set((data || []).map((r) => r.season).filter(Boolean))) as string[];
    const years = Array.from(new Set((data || []).map((r) => r.year).filter(Boolean))) as number[];
    setCompetitions(comps.sort());
    // If StatsFilterBar needs available lists, we compute below
    setAvailableSeasons(seasons.length ? seasons.sort() : ['2023/24', '2024/25']);
    setAvailableYears(years.length ? years.sort() : [2023, 2024, 2025]);
  }, []);

  // Load rows based on filters
  const loadRows = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('yamal_matches')
      .select('date, season, year, competition, opponent, goals, assists, take_ons_attempted, take_ons_successful')
      .order('date', { ascending: true });

    if (selectedFilter?.type === 'season') query = query.eq('season', selectedFilter.value as string);
    if (selectedFilter?.type === 'year') query = query.eq('year', selectedFilter.value as number);
    if (selectedComps.length > 0) query = query.in('competition', selectedComps);

    const { data, error } = await query;
    if (!error && data) setRows(data as MatchRow[]);
    else setRows([]);
    setLoading(false);
  }, [selectedFilter, selectedComps]);

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const [availableSeasons, setAvailableSeasons] = useState<string[]>(['2023/24', '2024/25']);
  const [availableYears, setAvailableYears] = useState<number[]>([2023, 2024, 2025]);

  const points = useMemo<Point[]>(() => {
    let cumGoals = 0;
    let cumAssists = 0;
    let cumGA = 0;
    let cumDribbles = 0;

    return rows.map((r, i) => {
      const g = r.goals ?? 0;
      const a = r.assists ?? 0;
      const d = typeof r.take_ons_successful === 'number' ? r.take_ons_successful : 0; // completed dribbles

      cumGoals += g;
      cumAssists += a;
      cumGA += g + a;
      cumDribbles += d;

      return {
        idx: i + 1,
        date: r.date,
        opponent: r.opponent ?? null,
        competition: r.competition ?? null,
        goals: cumGoals,
        assists: cumAssists,
        ga: cumGA,
        dribbles: cumDribbles,
      } as Point;
    });
  }, [rows]);

  const hasDribbles = useMemo(() => points.some((p) => p.dribbles !== null), [points]);

  const metricColor = useMemo(() => {
    switch (metric) {
      case 'ga':
        return 'white';
      case 'goals':
        return '#10b981'; // emerald-500
      case 'assists':
        return '#38bdf8'; // sky-400
      case 'dribbles':
        return '#d946ef'; // fuchsia-500
      default:
        return 'white';
    }
  }, [metric]);

  // no range state

  return (
    <div className="relative z-10 flex flex-col gap-6 py-8 px-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Progression</h1>
        <p className="text-sm text-neutral-300">Per-match timeline of key attacking stats.</p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3">
        <StatsFilterBar
          selectedFilter={selectedFilter}
          onChange={(f) => {
            setSelectedFilter(f);
          }}
          availableSeasons={availableSeasons}
          availableYears={availableYears}
        />

        {/* Competition multi-select chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedComps([])}
            className={[
              'px-3 py-1.5 text-xs rounded-full border',
              selectedComps.length === 0
                ? 'bg-white/20 border-white/20 text-white'
                : 'bg-white/5 border-white/10 text-neutral-200 hover:bg-white/10',
            ].join(' ')}
          >
            All competitions
          </button>
          {competitions.map((c) => {
            const active = selectedComps.includes(c);
            return (
              <button
                key={c}
                onClick={() =>
                  setSelectedComps((prev) =>
                    prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                  )
                }
                className={[
                  'px-3 py-1.5 text-xs rounded-full border',
                  active
                    ? 'bg-white/20 border-white/20 text-white'
                    : 'bg-white/5 border-white/10 text-neutral-200 hover:bg-white/10',
                ].join(' ')}
                title={c}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {([
          { key: 'ga', label: 'G+A' },
          { key: 'goals', label: 'Goals' },
          { key: 'assists', label: 'Assists' },
          ...(hasDribbles ? [{ key: 'dribbles', label: 'Dribbles' } as const] : []),
        ] as const).map((t) => {
          const active = metric === (t.key as MetricKey);
          return (
            <button
              key={t.key}
              onClick={() => setMetric(t.key as MetricKey)}
              className={[
                'px-3 py-1.5 text-sm rounded-lg border transition',
                active ? 'bg-white/20 border-white/20 text-white' : 'bg-white/5 border-white/10 text-neutral-200 hover:bg-white/10',
              ].join(' ')}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Chart card */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
        {loading ? (
          <div className="animate-pulse h-[320px] w-full rounded-lg bg-white/10" />
        ) : points.length === 0 ? (
          <div className="h-[200px] grid place-items-center text-neutral-300">
            No matches found for these filters.
          </div>
        ) : (
          <LineChart data={points} metric={metric} color={metricColor} />
        )}

        {/* Range selector removed */}
      </div>
    </div>
  );
}
