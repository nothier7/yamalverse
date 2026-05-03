export type NewsSource = {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
};

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'sporting-news-barcelona',
    name: 'Sporting News Barcelona',
    url: 'https://www.sportingnews.com/us/soccer/barcelona/news',
    enabled: true,
  },
];

export const YAMAL_MATCH_TERMS = [
  'lamine yamal',
  'yamal',
  'lamine',
];
