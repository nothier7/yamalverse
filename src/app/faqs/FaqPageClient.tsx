'use client';

import { useState } from 'react';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqPageClientProps = {
  faqs: FaqItem[];
};

export default function FaqPageClient({ faqs }: FaqPageClientProps) {
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
}
