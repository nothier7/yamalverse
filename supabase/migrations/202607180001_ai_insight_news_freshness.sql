alter table public.news_articles
  add column if not exists discovered_at timestamptz,
  add column if not exists story_key text,
  add column if not exists source_tier text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'news_articles_source_tier_check'
      and conrelid = 'public.news_articles'::regclass
  ) then
    alter table public.news_articles
      add constraint news_articles_source_tier_check
      check (source_tier is null or source_tier in ('official', 'trusted'));
  end if;
end
$$;

create index if not exists news_articles_source_tier_discovered_at_idx
  on public.news_articles (source_tier, discovered_at desc nulls last);

create index if not exists news_articles_story_key_idx
  on public.news_articles (story_key);
