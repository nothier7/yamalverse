import type { Metadata } from 'next';
import FeedbackPageClient from './FeedbackPageClient';

export const metadata: Metadata = {
  title: 'Send Feedback - Yamalverse',
  description:
    'Share feedback, report bugs, or suggest features to improve Yamalverse and its Lamine Yamal stats coverage.',
  openGraph: {
    title: 'Send Feedback - Yamalverse',
    description:
      'Share feedback, report bugs, or suggest features to improve Yamalverse and its Lamine Yamal stats coverage.',
    url: 'https://yamalverse.com/feedback',
    images: ['/og-image.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Send Feedback - Yamalverse',
    description:
      'Share feedback, report bugs, or suggest features to improve Yamalverse and its Lamine Yamal stats coverage.',
    images: ['/og-image.jpeg'],
  },
};

export default function FeedbackPage() {
  return <FeedbackPageClient />;
}
