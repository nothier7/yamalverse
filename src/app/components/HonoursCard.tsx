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
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-md backdrop-blur-md">
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-neutral-400 ">{subtitle}</p>}
    </div>
  );
};

export default HonoursCard;