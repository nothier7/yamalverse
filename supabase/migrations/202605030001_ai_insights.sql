create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_url text not null,
  canonical_url text not null unique,
  title text not null,
  excerpt text,
  author text,
  published_at timestamptz,
  ingested_at timestamptz not null default now(),
  matched_terms text[] not null default '{}',
  raw_metadata jsonb not null default '{}'::jsonb
);

create index if not exists news_articles_source_idx
  on public.news_articles (source);

create index if not exists news_articles_published_at_idx
  on public.news_articles (published_at desc nulls last);

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  surface text not null,
  headline text not null,
  summary text not null,
  bullets text[] not null default '{}',
  sources jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'success',
  model text,
  input_fingerprint text,
  error_message text,
  created_at timestamptz not null default now(),
  constraint ai_insights_status_check check (status in ('success', 'error'))
);

create index if not exists ai_insights_surface_generated_at_idx
  on public.ai_insights (surface, generated_at desc);

alter table public.news_articles enable row level security;
alter table public.ai_insights enable row level security;

drop policy if exists "Public can read news articles" on public.news_articles;
create policy "Public can read news articles"
  on public.news_articles
  for select
  using (true);

drop policy if exists "Public can read successful AI insights" on public.ai_insights;
create policy "Public can read successful AI insights"
  on public.ai_insights
  for select
  using (status = 'success');
