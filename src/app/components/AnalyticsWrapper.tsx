'use client';

import dynamic from 'next/dynamic';

// Defer analytics loading - loads after hydration (bundle-defer-third-party)
const Analytics = dynamic(
  () => import('@vercel/analytics/next').then((m) => m.Analytics),
  { ssr: false }
);

export default function AnalyticsWrapper() {
  return <Analytics />;
}
