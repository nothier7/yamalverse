const TEAM_CRESTS: Record<string, string> = {
  'fc barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
  barcelona: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
  spain: '/spain.png',
};

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getTeamCrest(teamName: string | null | undefined): string | null {
  if (!teamName) return null;
  const normalized = normalizeName(teamName);
  return TEAM_CRESTS[normalized] ?? null;
}

export function getTeamInitials(teamName: string | null | undefined): string {
  if (!teamName) return '??';
  const parts = teamName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
