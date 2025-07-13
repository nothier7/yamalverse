'use client';

import React from 'react';

type StatsCardProps = {
  title: string;
  subtitle?: string;
  appearances: number;
  assists: number;
  goals: number;
  contributions: number;
  minutesPerGoal: number;
  minutesPerContribution: number;
};

const StatBox = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-md p-3">
    <span className="text-xl font-semibold text-white">{value}</span>
    <span className="text-xs text-neutral-400">{label}</span>
  </div>
);

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  subtitle,
  appearances,
  assists,
  goals,
  contributions,
  minutesPerGoal,
  minutesPerContribution,
}) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-md backdrop-blur-md">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-neutral-400 ">{subtitle}</p>}

      <div className="grid grid-cols-2 gap-4 mt-4">
        <StatBox label="Appearances" value={appearances} />
        <StatBox label="Assists" value={assists} />
        <StatBox label="Goals" value={goals} />
        <StatBox label="G + A" value={contributions} />
        <StatBox label="Min / Goal" value={minutesPerGoal} />
        <StatBox label="Min / Contribution" value={minutesPerContribution} />
      </div>
    </div>
  );
};

export default StatsCard;