'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'Where does the data come from?',
    answer: 'All stats are manually verified and sourced from publicly available match reports and performance datasets. We use OPTA data for match statistics.',
  },
  {
    question: 'How often is the site updated?',
    answer: 'Match stats are updated within 24 hours after each game played by Lamine Yamal.',
  },
  {
    question: 'Do you track data for frienly matches?',
    answer: 'We do track data for International friendlies, but not for club friendlies. Only competitive matches are included in the stats.',
  },
  {
    question: 'What if I notice an error?',
    answer: 'You can report errors by contacting us on Twitter/X @yamalverse',
  },
  {
    question: 'Is this site officially affiliated with Lamine Yamal?',
    answer: 'No. This is a fan-made project and not affiliated with FC Barcelona, the Spanish Football Federation, or Lamine Yamal.',
  },
];

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Frequently Asked Questions</h1>

      <div className="w-full flex flex-col gap-4">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md transition duration-200 shadow-md"
          >
            <button
              className="flex justify-between items-center w-full text-left text-white font-medium text-base"
              onClick={() => toggle(i)}
            >
              <span>{faq.question}</span>
              <span className="text-lg">{openIndex === i ? '−' : '+'}</span>
            </button>

            {openIndex === i && (
              <p className="text-sm text-neutral-300 mt-2">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqPage;
