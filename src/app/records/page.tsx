'use client';

import { useState } from 'react';

type RecordGroup = {
  title: string;
  emoji: string;
  records: string[];
};

const recordSections: RecordGroup[] = [
  {
    title: 'LaLiga Records',
    emoji: '🇪🇸',
    records: [
      'Youngest Barça debutant in LaLiga: 15 years, 290 days (vs. Betis, 4-0)',
      'Youngest starter in LaLiga in the 21st century: 16 years, 38 days (vs. Cádiz, 2-0)',
      'Youngest assist provider in LaLiga: 16 years, 45 days (assist to Gavi vs. Villarreal, 3-4)',
      'Youngest goalscorer in LaLiga: 16 years, 87 days (vs. Granada, 2-2)',
      'Youngest to score a brace in LaLiga: 16 years, 213 days (vs. Granada, 3-3)',
      'Youngest to play 50 matches with Barça: 16 years, 310 days (vs. Rayo Vallecano, 3-0)',
      'Youngest to play 100 official matches: 17 years, 217 days (vs. Rayo Vallecano, 1-0)',
      'Youngest to reach 50 LaLiga wins: 17 years, 283 days (vs. Mallorca, 1-0)',
      'Youngest to play 100 matches with Barça: 17 years, 291 days (vs. Inter, 3-3)',
    ],
  },
  {
    title: 'Champions League Records',
    emoji: '🏆',
    records: [
      'Youngest Barça player to debut: 16 years, 68 days (vs. Antwerp, 5-0)',
      'Second youngest player to debut: 16 years, 68 days (vs. Antwerp, 5-0)',
      'Youngest starter: 16 years, 83 days (vs. Porto, 0-1)',
      'Youngest assist provider: 16 years, 153 days (vs. Antwerp, 3-2)',
      'Youngest to play a knockout round: 16 years, 223 days (vs. Napoli, 1-1)',
      'Youngest to play in Champions quarterfinals: 16 years, 272 days (vs. PSG, 2-3)',
      'Youngest to play 10 Champions matches: 16 years, 278 days (vs. PSG, 1-4)',
      'Youngest to both score and assist: 17 years, 241 days (vs. Benfica, 3-1)',
      'Youngest to play 20 Champions matches: 17 years, 270 days (vs. Dortmund, 4-0)',
      'Youngest goalscorer in Champions semifinals: 17 years, 291 days (vs. Inter, 3-3)',
    ],
  },
  {
    title: 'Spain National Team Records',
    emoji: '🌍',
    records: [
      'Youngest debutant for Spain: 16 years, 57 days (vs. Georgia, 1-7)',
      'Youngest goalscorer for Spain: 16 years, 57 days (vs. Georgia, 1-7)',
      'Youngest debutant at the Euros: 16 years, 339 days (vs. Croatia, 3-0)',
      'Youngest assist provider at the Euros: 16 years, 339 days (vs. Croatia, 3-0)',
      'Youngest to play a Euro knockout round: 16 years, 352 days (vs. Georgia, 4-1)',
      'Youngest to play a Euro semifinal: 16 years, 362 days (vs. France, 2-1)',
      'Youngest goalscorer at the Euros: 16 years, 362 days (vs. France, 2-1)',
      'Youngest to play a Euro final: 17 years, 1 day (vs. England, 2-1)',
      'Youngest to win a tournament with Spain: 17 years, 1 day (Euro)',
      'Youngest goalscorer in the Nations League: 17 years, 253 days (vs. Netherlands, 3-3)',
    ],
  },
  {
    title: 'Other Records',
    emoji: '📚',
    records: [
      'Youngest goalscorer in the Copa del Rey in the 21st century: 16 years, 195 days (vs. Athletic, 4-2)',
      'Youngest debutant and goalscorer in Supercopa: 16 years, 182 days (vs. Osasuna, 2-0)',
      'Youngest debutant in El Clásico: 16 years, 107 days (vs. Real Madrid)',
      'Youngest goalscorer in El Clásico: 17 years, 105 days (vs. Real Madrid, 0-4)',
      'Youngest Ballon d’Or nominee: 17 years, 53 days',
      'Youngest Top-10 Ballon d’Or finisher (8th place): 17 years, 109 days',
      'Youngest winner of the Kopa Trophy: 17 years, 109 days',
    ],
  },
];

export default function RecordsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 py-10 px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Lamine Yamal Records</h1>

      {recordSections.map((section, i) => (
        <div
          key={i}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md shadow-md"
        >
          <button
            onClick={() => toggle(i)}
            className="flex justify-between items-center w-full text-left text-white font-semibold text-base"
          >
            <span>
              {section.emoji} {section.title}
            </span>
            <span className="text-lg">{openIndex === i ? '−' : '+'}</span>
          </button>

          {openIndex === i && (
            <ul className="mt-3 list-disc list-inside text-sm text-neutral-300 space-y-1">
              {section.records.map((rec, j) => (
                <li key={j}>{rec}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
