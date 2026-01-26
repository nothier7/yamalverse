'use client';

import StatBox from './ui/StatBox';

type DribblesCardProps = {
  title: string;
  dribbles_completed: number;
  dribbles_attempted: number;
  dribbles_per_90: number;
  success_rate: number;
};

const DribblesCard = ({
  title,
  dribbles_completed,
  dribbles_attempted,
  dribbles_per_90,
  success_rate,
}: DribblesCardProps) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-md backdrop-blur-md">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <StatBox label="Completed" value={dribbles_completed} />
        <StatBox label="Attempted" value={dribbles_attempted} />
        <StatBox label="Per 90" value={dribbles_per_90} />
        <StatBox label="Success %" value={`${success_rate}%`} />
      </div>
    </div>
  );
};

export default DribblesCard;
