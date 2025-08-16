import { Suspense } from "react";
import OpponentsClient from "./ui/OpponentsClient";

export default function Page() {
  return (
    <main className="min-h-screen px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Opponents by Contributions</h1>
      <p className="text-neutral-300 mb-6">
        Clubs & national teams Lamine Yamal has scored or assisted against. Ranked by total contributions (G + A).
      </p>
      <Suspense fallback={<div className="opacity-70">Loading…</div>}>
        <OpponentsClient />
      </Suspense>
    </main>
  );
}
