import StatsCard from './components/StatsCard';
import { getAllTimeStats } from './lib/queries/getStats';

export default async function Home() {
  const allTime = await getAllTimeStats();
  const club = await getAllTimeStats({ type: 'Club' });
  const intl = await getAllTimeStats({ type: 'International' });
  const championsLeague = await getAllTimeStats({ competition: 'Champions Lg' });
  const Liga = await getAllTimeStats({ competition: 'La Liga' });
  const Copa = await getAllTimeStats({ competition: 'Copa del Rey' });
  const euro = await getAllTimeStats({ competition: 'Euro' });

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 py-10">
      <h1 className="text-2xl font-bold text-white">All-Time Stats</h1>
      {allTime && (
        <StatsCard
          title="All Time Career Stats"
          subtitle="Excluding club friendlies"
          {...allTime}
        />
      )}
      {club && (
        <StatsCard
          title="All Time Club Stats"
          subtitle="Excluding friendlies"
          {...club}
        />
      )}
      {Liga && (
        <StatsCard
          title="All Time La Liga Stats"
          {...Liga}
        />
      )}
      {Copa && (
        <StatsCard
          title="All Time CDR Stats"
          {...Copa}
        />
      )}
      {championsLeague && (
        <StatsCard
          title="All Time UEFA Champions League Stats"
          {...championsLeague}
        />
      )}
      {intl && (
        <StatsCard
          title="All Time International Stats"
          {...intl}
        />
      )}
      {euro && (
        <StatsCard
          title="All Time EURO Stats"
          {...euro}
        />
      )}
    </div>
  );
}
