'use client';

import React from 'react';

type StatsFilterBarProps = {
  selectedFilter: { type: 'season' | 'year'; value: string | number } | null;
  onChange: (filter: { type: 'season' | 'year'; value: string | number } | null) => void;
  availableSeasons: string[];
  availableYears: number[];
};

export default function StatsFilterBar({
  selectedFilter,
  onChange,
  availableSeasons,
  availableYears
}: StatsFilterBarProps) {
  const optionStyle: React.CSSProperties = {
    backgroundColor: '#0b1040',
    color: '#ffffff',
  };

  return (
    <div className="flex items-center gap-4 flex-wrap text-white mb-6">
      <select
        value={selectedFilter?.type === 'season' ? selectedFilter.value : ''}
        onChange={(e) => {
          const val = e.target.value;
          if (val) onChange({ type: 'season', value: val });
        }}
        className="bg-slate-950/80 text-white border border-white/15 p-2 rounded backdrop-blur focus:outline-none focus:ring-2 focus:ring-indigo-400/60 disabled:opacity-40"
        style={{ colorScheme: 'dark' }}
        disabled={selectedFilter?.type === 'year'}
      >
        <option value="">Select Season</option>
        {availableSeasons.map((season) => (
          <option key={season} value={season} style={optionStyle}>{season}</option>
        ))}
      </select>

      <select
        value={selectedFilter?.type === 'year' ? selectedFilter.value : ''}
        onChange={(e) => {
          const val = e.target.value;
          if (val) onChange({ type: 'year', value: Number(val) });
        }}
        className="bg-slate-950/80 text-white border border-white/15 p-2 rounded backdrop-blur focus:outline-none focus:ring-2 focus:ring-indigo-400/60 disabled:opacity-40"
        style={{ colorScheme: 'dark' }}
        disabled={selectedFilter?.type === 'season'}
      >
        <option value="">Select Year</option>
        {availableYears.map((year) => (
          <option key={year} value={year} style={optionStyle}>{year}</option>
        ))}
      </select>

      {selectedFilter && (
        <button
          onClick={() => onChange(null)}
          className="text-sm text-red-400 underline"
        >
          Clear Filter
        </button>
      )}
    </div>
  );
}
