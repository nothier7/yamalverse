'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AllTimeCareerSection from '../components/AllTimeCareerSection';
import RecentFormSection from '../components/RecentFormSection';
import StatsCard from '../components/StatsCard';
import StatsFilterBar from '../components/StatsFilterBar';
import { YamalStats } from '../types/stats';
import { getAllTimeTeamStats, TeamCareerStats } from '../lib/queries/getAllTimeTeamStats';
import { getFilteredStats } from '../lib/queries/getFilteredStats';
import { getRecentMatches, RecentMatchRow } from '../lib/queries/getRecentMatches';

// Hoist static constants outside component (rendering-hoist-jsx)
const seasons = ['2022/23', '2023/24', '2024/25', '2025/26'];
const years = [2023, 2024, 2025, 2026];

type HomeClientProps = {
  initialRecentMatches?: RecentMatchRow[] | null;
  initialCareerStats?: {
    barcelona: TeamCareerStats | null;
    spain: TeamCareerStats | null;
  } | null;
};

export default function HomeClient({
  initialRecentMatches,
  initialCareerStats,
}: HomeClientProps) {
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
  const [recentMatches, setRecentMatches] = useState<RecentMatchRow[]>(initialRecentMatches ?? []);
  const [recentLoading, setRecentLoading] = useState(initialRecentMatches == null);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [careerStats, setCareerStats] = useState<{
    barcelona: TeamCareerStats | null;
    spain: TeamCareerStats | null;
  }>(initialCareerStats ?? { barcelona: null, spain: null });
  const [careerLoading, setCareerLoading] = useState(initialCareerStats == null);
  const [careerError, setCareerError] = useState<string | null>(null);

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

  useEffect(() => {
    if (initialRecentMatches != null) return;
    let isActive = true;
    setRecentLoading(true);
    setRecentError(null);

    getRecentMatches(5)
      .then((data) => {
        if (!isActive) return;
        setRecentMatches(data ?? []);
      })
      .catch((err) => {
        console.error('Error fetching recent matches:', err);
        if (!isActive) return;
        setRecentError('Failed to load recent matches.');
      })
      .finally(() => {
        if (!isActive) return;
        setRecentLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [initialRecentMatches]);

  useEffect(() => {
    if (initialCareerStats != null) return;
    let isActive = true;
    setCareerLoading(true);
    setCareerError(null);

    Promise.all([getAllTimeTeamStats('Barcelona'), getAllTimeTeamStats('Spain')])
      .then(([barcelona, spain]) => {
        if (!isActive) return;
        setCareerStats({ barcelona, spain });
      })
      .catch((err) => {
        console.error('Error fetching career stats:', err);
        if (!isActive) return;
        setCareerError('Failed to load career numbers.');
      })
      .finally(() => {
        if (!isActive) return;
        setCareerLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [initialCareerStats]);

  const snapshotTitle = selectedFilter
    ? `${selectedFilter.value} ${selectedFilter.type === 'season' ? 'Season' : 'Year'}`
    : 'Select a season or year';

  return (
    <div className="relative z-10 flex flex-col gap-16 py-16 text-white px-4 sm:px-6 lg:px-12">
      <AllTimeCareerSection
        barcelona={careerStats.barcelona}
        spain={careerStats.spain}
        loading={careerLoading}
        error={careerError}
      />

      <RecentFormSection matches={recentMatches} loading={recentLoading} error={recentError} />

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
