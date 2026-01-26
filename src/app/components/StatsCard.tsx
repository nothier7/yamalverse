'use client';

import StatBox from './ui/StatBox';

type StatsCardProps = {
  title: string;
  subtitle?: string;
  appearances: number;
  assists: number;
  goals: number;
  contributions: number;
  minutesPerGoal?: number;
  minutesPerContribution?: number;
};

const StatsCard = ({
  title,
  subtitle,
  appearances,
  assists,
  goals,
  contributions,
  minutesPerGoal,
  minutesPerContribution,
}: StatsCardProps) => {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-950/65 px-8 py-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)] backdrop-blur">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-neutral-300/80">{subtitle}</p>}

      <div className="grid grid-cols-2 gap-4 mt-4">
        <StatBox label="Appearances" value={appearances} />
        <StatBox label="Assists" value={assists} />
        <StatBox label="Goals" value={goals} />
        <StatBox label="G + A" value={contributions} />
        {typeof minutesPerGoal === 'number' && (
          <StatBox label="Min / Goal" value={minutesPerGoal} />
        )}
        {typeof minutesPerContribution === 'number' && (
          <StatBox
            label="Min / Contribution"
            value={minutesPerContribution}
          />
        )}
      </div>
    </div>
  );
};

export default StatsCard;
