'use client';

import React from 'react';

type HonoursCardProps = {
  title: string;
  subtitle?: string;
};

const HonoursCard: React.FC<HonoursCardProps> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-950/65 px-8 py-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)] backdrop-blur">
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-neutral-300/80">{subtitle}</p>}
    </div>
  );
};

export default HonoursCard;
