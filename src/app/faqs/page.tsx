import React from 'react';
import type { Metadata } from 'next';
import FaqPageClient from './FaqPageClient';

const faqs = [
  {
    question: 'Where does the data come from?',
    answer:
      'All stats are manually verified and sourced from publicly available match reports and performance datasets. We use OPTA data for match statistics.',
  },
  {
    question: 'How often is the site updated?',
    answer: 'Match stats are updated within 24 hours after each game played by Lamine Yamal.',
  },
  {
    question: 'Do you track data for friendly matches?',
    answer:
      'We do track data for International friendlies, but not for club friendlies. Only competitive matches are included in the stats.',
  },
  {
    question: 'What if I notice an error?',
    answer: 'You can report errors by contacting us on Twitter/X @yamalverse',
  },
  {
    question: 'Is this site officially affiliated with Lamine Yamal?',
    answer:
      'No. This is a fan-made project and not affiliated with FC Barcelona, the Spanish Football Federation, or Lamine Yamal.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export const metadata: Metadata = {
  title: 'FAQs About Lamine Yamal Stats - Yamalverse',
  description:
    'Answers to common questions about Yamalverse, data sources, update frequency, and match coverage.',
  openGraph: {
    title: 'FAQs About Lamine Yamal Stats',
    description:
      'Answers to common questions about Yamalverse, data sources, update frequency, and match coverage.',
    url: 'https://yamalverse.com/faqs',
    images: ['/og-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQs About Lamine Yamal Stats',
    description:
      'Answers to common questions about Yamalverse, data sources, update frequency, and match coverage.',
    images: ['/og-image.jpeg'],
  },
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqPageClient faqs={faqs} />
    </>
  );
}
