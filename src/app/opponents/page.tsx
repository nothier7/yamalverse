// app/opponents/page.tsx
import OpponentsTable from "./ui/OpponentsTable";
import { getOpponentContribs } from "../lib/queries/getOpponentContribs";

export default async function Page() {
  // No filters/toggles — just fetch everything (Club + International)
  const rowsResult = await getOpponentContribs({ season: null, year: null, type: "Both" });
  const rows = Array.isArray(rowsResult) ? rowsResult : [];

  return (
    <main className="min-h-screen px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Favorite Opponents</h1>
      <p className="text-neutral-300 mb-6">
        Clubs & national teams Lamine Yamal has scored or assisted against. Ranked by total contributions (G + A).
      </p>

      {Array.isArray(rowsResult) ? (
        <OpponentsTable rows={rows} />
      ) : (
        <div className="text-red-500">Error: {rowsResult.Error}</div>
      )}
    </main>
  );
}
