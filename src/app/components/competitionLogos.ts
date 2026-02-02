const COMPETITION_LOGOS: Record<string, string> = {
  'la liga': '/liga.png',
  'copa del rey': '/copadelrey.png',
  'champions lg': '/ucl.png',
  'uefa nations league': '/nationsleague.png',
  'uefa euro': 'https://upload.wikimedia.org/wikipedia/en/7/7b/UEFA_Euro_2024_logo.svg',
  'uefa euro qualifying': 'https://upload.wikimedia.org/wikipedia/en/7/7b/UEFA_Euro_2024_logo.svg',
  'supercopa de espana': 'https://upload.wikimedia.org/wikipedia/en/8/8a/Supercopa_de_Espa%C3%B1a_logo.svg',
  'world cup': 'https://upload.wikimedia.org/wikipedia/en/6/6d/FIFA_World_Cup_2026_logo.svg',
};

function normalizeCompetition(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getCompetitionLogo(name: string | null | undefined): string | null {
  if (!name) return null;
  const normalized = normalizeCompetition(name);
  return COMPETITION_LOGOS[normalized] ?? null;
}

export function getCompetitionInitials(name: string | null | undefined): string {
  if (!name) return '??';
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
