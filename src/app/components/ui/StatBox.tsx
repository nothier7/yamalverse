'use client';

type StatBoxProps = {
  label: string;
  value: number | string;
};

/**
 * Shared StatBox component - extracted to deduplicate code from StatsCard and DribblesCard
 * (code organization best practice)
 */
export default function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="flex flex-col items-center rounded-md border border-white/15 bg-white/10 p-3 backdrop-blur">
      <span className="text-xl font-semibold text-white tabular-nums">{value}</span>
      <span className="text-xs text-neutral-400">{label}</span>
    </div>
  );
}
