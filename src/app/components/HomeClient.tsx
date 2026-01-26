'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import StatsFilterBar from '../components/StatsFilterBar';
import { YamalStats } from '../types/stats';
import { getFilteredStats } from '../lib/queries/getFilteredStats';

// Hoist static constants outside component (rendering-hoist-jsx)
const seasons = ['2022/23', '2023/24', '2024/25', '2025/26'];
const years = [2023, 2024, 2025, 2026];

export default function HomeClient() {
  const [selectedFilter, setSelectedFilter] = useState<{
    type: 'season' | 'year';
    value: string | number;
  } | null>(null);

  const [stats, setStats] = useState<{
    allTime: YamalStats | null;
    club: YamalStats | null;
    intl: YamalStats | null;
    championsLeague: YamalStats | null;
    Liga: YamalStats | null;
    Copa: YamalStats | null;
    euro: YamalStats | null;
  }>({
    allTime: null,
    club: null,
    intl: null,
    championsLeague: null,
    Liga: null,
    Copa: null,
    euro: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFilter) {
      setStats({
        allTime: null,
        club: null,
        intl: null,
        championsLeague: null,
        Liga: null,
        Copa: null,
        euro: null,
      });
      return;
    }

    const filterParams =
      selectedFilter.type === 'season'
        ? { season: String(selectedFilter.value) }
        : { year: Number(selectedFilter.value) };

    const queries = [
      { key: 'allTime', args: { ...filterParams } },
      { key: 'club', args: { type: 'Club', ...filterParams } },
      { key: 'intl', args: { type: 'International', ...filterParams } },
      { key: 'championsLeague', args: { competition: 'Champions Lg', ...filterParams } },
      { key: 'Liga', args: { competition: 'La Liga', ...filterParams } },
      { key: 'Copa', args: { competition: 'Copa del Rey', ...filterParams } },
      { key: 'euro', args: { competition: 'UEFA Euro', ...filterParams } },
    ] as const;

    setLoading(true);
    setError(null);

    getFilteredStats(queries)
      .then((result) => {
        setStats(result as {
          allTime: YamalStats | null;
          club: YamalStats | null;
          intl: YamalStats | null;
          championsLeague: YamalStats | null;
          Liga: YamalStats | null;
          Copa: YamalStats | null;
          euro: YamalStats | null;
        });
      })
      .catch((err) => {
        console.error('Error fetching stats:', err);
        setError('Failed to load stats. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedFilter]);

  const snapshotTitle = selectedFilter
    ? `${selectedFilter.value} ${selectedFilter.type === 'season' ? 'Season' : 'Year'}`
    : 'Select a season or year';

  return (
    <div className="relative z-10 flex flex-col gap-16 py-16 text-white px-4 sm:px-6 lg:px-12">
      <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-950/90 via-slate-950/70 to-indigo-950/65 p-8 shadow-[0_25px_55px_-30px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(255,255,255,0.12),transparent_55%),radial-gradient(circle_at_80%_100%,rgba(116,135,255,0.22),transparent_45%)] opacity-90" />
        <div className="absolute inset-x-6 top-0 h-px bg-white/30 [mask-image:linear-gradient(90deg,transparent,white,transparent)]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/80 backdrop-blur">
              Building the definitive Lamine tracker
              <span className="h-1 w-1 rounded-full bg-white/70" />
            </span>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Follow the rise of Lamine Yamal with context, cadence, and clarity.
            </h1>
            <p className="text-sm text-neutral-200/80 md:text-base">
              Yamalverse distils each appearance, competition, and milestone into a living timeline.
              Dive into the numbers that matter, understand how his role evolves, and stay ready for what comes next.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="#season-snapshot"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-medium text-white shadow-[0_10px_30px_-16px_rgba(255,255,255,0.75)] backdrop-blur transition hover:border-white/60 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                Track This Season
              </Link>
              <Link
                href="/per90"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80 transition hover:border-white/45 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                Explore Per 90 Radar
              </Link>
            </div>
          </div>
          <div className="relative mt-6 flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur md:mt-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-200/80">
              Latest Focus
            </span>
            <h2 className="text-xl font-semibold">
              How is Yamal shaping games right now?
            </h2>
            <p className="text-sm text-neutral-200/70">
              Use the live filter below to zero in on a season or calendar stretch, then branch into detailed opposition scouting, honours, or match breakdowns.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-neutral-200/80">
              <span className="rounded-full border border-white/20 px-3 py-1">Season timeline</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Competition splits</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Per 90 analytics</span>
            </div>
          </div>
        </div>
      </section>

      <section id="season-snapshot" className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Season Snapshot</h2>
            <p className="text-sm text-neutral-300/80">
              Tune the dashboard by campaign or calendar year to see how his contributions stack up as the story unfolds.
            </p>
          </div>
          <StatsFilterBar
            selectedFilter={selectedFilter}
            onChange={setSelectedFilter}
            availableSeasons={seasons}
            availableYears={years}
          />
        </div>

        {selectedFilter ? (
          loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-neutral-200/80" aria-live="polite">
              Loading stats…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-6 text-red-100">
              {error}
            </div>
          ) : stats.allTime ? (
            <div className="flex flex-col gap-6 lg:flex-row">
              <StatsCard
                title={`${snapshotTitle} Overview`}
                subtitle="Competitive fixtures only"
                {...stats.allTime}
              />
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h3 className="text-lg font-semibold text-white">What to Watch</h3>
                <p className="mt-2 text-sm text-neutral-200/70">
                  Compare this run with his club and international splits to understand how role and output shift between contexts.
                  Use the quick links below to layer on per-90 metrics or opposition-specific breakdowns.
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-neutral-200/80">
                  <Link
                    href="/club"
                    className="rounded-full border border-white/20 px-3 py-1 transition hover:border-indigo-200/60 hover:text-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                  >
                    Club hub
                  </Link>
                  <Link
                    href="/international"
                    className="rounded-full border border-white/20 px-3 py-1 transition hover:border-indigo-200/60 hover:text-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                  >
                    International form
                  </Link>
                  <Link
                    href="/opponents"
                    className="rounded-full border border-white/20 px-3 py-1 transition hover:border-indigo-200/60 hover:text-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                  >
                    Opposition scouting
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-6 text-amber-100">
              Data for this selection is still syncing. Try a different season or check back once new fixtures are logged.
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-neutral-200/80">
            Choose a season or year above to generate a focused snapshot. It updates instantly, so you can return after every matchday for the latest shape of his campaign.
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Choose Your Deep Dive</h2>
          <p className="text-sm text-neutral-300/80">
            Every surface links to a richer data story. Jump straight into the lane that matches what you want to track next.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/per90"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-indigo-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="relative space-y-2">
              <h3 className="text-lg font-semibold text-white">Per 90 Dashboard</h3>
              <p className="text-sm text-neutral-200/75">
                Compare output across possession phases, gauge usage, and identify spikes in form.
              </p>
              <span className="text-xs font-semibold text-indigo-200/80">
                View radar →
              </span>
            </div>
          </Link>

          <Link
            href="/opponents"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-indigo-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="relative space-y-2">
              <h3 className="text-lg font-semibold text-white">Opponent Matchups</h3>
              <p className="text-sm text-neutral-200/75">
                Understand how his influence shifts by opponent profile and defensive scheme.
              </p>
              <span className="text-xs font-semibold text-indigo-200/80">
                Explore matchups →
              </span>
            </div>
          </Link>

          <Link
            href="/honours"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-indigo-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="relative space-y-2">
              <h3 className="text-lg font-semibold text-white">Milestones &amp; Honours</h3>
              <p className="text-sm text-neutral-200/75">
                Track trophies, awards, and milestone appearances as his career accelerates.
              </p>
              <span className="text-xs font-semibold text-indigo-200/80">
                Review accolades →
              </span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
