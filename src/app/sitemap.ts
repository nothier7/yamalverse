import type { MetadataRoute } from 'next';

const baseUrl = 'https://yamalverse.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${baseUrl}/`, lastModified, priority: 1, changeFrequency: 'weekly' },
    { url: `${baseUrl}/club`, lastModified, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/international`, lastModified, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/per90`, lastModified, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/motm`, lastModified, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${baseUrl}/dribbles`, lastModified, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${baseUrl}/opponents`, lastModified, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${baseUrl}/honours`, lastModified, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/records`, lastModified, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${baseUrl}/progression`, lastModified, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${baseUrl}/faqs`, lastModified, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${baseUrl}/support`, lastModified, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${baseUrl}/feedback`, lastModified, priority: 0.3, changeFrequency: 'yearly' },
  ];
}
