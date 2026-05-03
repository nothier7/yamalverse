import { NewsArticle } from './types';
import { NewsSource, YAMAL_MATCH_TERMS } from './newsSources';

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, ' '));
}

function toAbsoluteSportingNewsUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return new URL(url, 'https://www.sportingnews.com').toString();
}

function findMatchedTerms(text: string): string[] {
  const normalized = text.toLowerCase();
  return YAMAL_MATCH_TERMS.filter((term) => normalized.includes(term));
}

function extractArticleCandidates(html: string, source: NewsSource): NewsArticle[] {
  const candidates = new Map<string, NewsArticle>();
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorPattern.exec(html)) !== null) {
    const rawUrl = match[1];
    const rawContent = match[2];
    if (!rawUrl || !rawUrl.includes('/us/soccer/')) continue;

    const title = stripTags(rawContent);
    if (title.length < 20) continue;

    const matchedTerms = findMatchedTerms(title);
    if (matchedTerms.length === 0) continue;

    const canonicalUrl = toAbsoluteSportingNewsUrl(rawUrl).split('?')[0];
    candidates.set(canonicalUrl, {
      source: source.name,
      source_url: source.url,
      canonical_url: canonicalUrl,
      title,
      excerpt: null,
      author: null,
      published_at: null,
      matched_terms: matchedTerms,
      raw_metadata: {
        source_id: source.id,
      },
    });
  }

  return [...candidates.values()];
}

export async function fetchSportingNewsArticles(source: NewsSource): Promise<NewsArticle[]> {
  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'YamalverseBot/1.0 (+https://yamalverse.com)',
      Accept: 'text/html,application/xhtml+xml',
    },
    next: {
      revalidate: 0,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.name}: ${response.status}`);
  }

  const html = await response.text();
  return extractArticleCandidates(html, source);
}
