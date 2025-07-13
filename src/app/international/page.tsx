import StatsCard from '../components/StatsCard';
import { getAllTimeStats } from '../lib/queries/getStats';

export default async function InternationalPage() {
  const intlStats = await getAllTimeStats({ type: 'International' });

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 py-10">
      <h1 className="text-2xl font-bold text-white">All-Time International Stats</h1>
      {intlStats && (
        <StatsCard
          title="International Career Totals"
          {...intlStats}
        />
      )}
    </div>
  );
}
