export type HonourCategory = 'team' | 'individual';
export type TeamName = 'Barcelona' | 'Spain';

type HonourBase = {
  title: string;
  times: number;
  seasons: string[];
  sourceUrl: string;
};

export type TeamHonour = HonourBase & {
  category: 'team';
  team: TeamName;
};

export type IndividualHonour = HonourBase & {
  category: 'individual';
  team?: never;
};

export type Honour = TeamHonour | IndividualHonour;

const BARCA_HONOURS_URL =
  'https://www.fcbarcelona.com/en/football/first-team/squad/129404/lamine-yamal';
const BARCA_KOPA_URL =
  'https://www.fcbarcelona.com/en/football/first-team/news/4367534/lamine-yamal-retains-kopa-trophy';
const BARCA_CAREER_AWARDS_URL =
  'https://www.fcbarcelona.com/en/football/first-team/news/4308882/lamine-yamal-reaches-18-years-of-age-as-a-record-breaker';
const LALIGA_PLAYER_URL =
  'https://www.laliga.com/en-GB/news/lamine-yamal-ea-sports-laliga-player-of-the-season-2025-2026';
const UEFA_YAMAL_URL =
  'https://www.uefa.com/uefachampionsleague/news/0299-1da96484ee13-427fe7a11603-1000--lamine-yamal-barcelona-and-spain-star-s-champions-league-/';

export const honours: Honour[] = [
  {
    title: 'FIFA World Cup',
    times: 1,
    seasons: ['2026'],
    category: 'team',
    team: 'Spain',
    sourceUrl:
      'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/spain-argentina-final-report-highlights',
  },
  {
    title: 'La Liga',
    times: 3,
    seasons: ['2022/23', '2024/25', '2025/26'],
    category: 'team',
    team: 'Barcelona',
    sourceUrl: BARCA_HONOURS_URL,
  },
  {
    title: 'Copa del Rey',
    times: 1,
    seasons: ['2024/25'],
    category: 'team',
    team: 'Barcelona',
    sourceUrl: BARCA_HONOURS_URL,
  },
  {
    title: 'Spanish Super Cup',
    times: 2,
    seasons: ['2024/25', '2025/26'],
    category: 'team',
    team: 'Barcelona',
    sourceUrl: BARCA_HONOURS_URL,
  },
  {
    title: 'UEFA EURO',
    times: 1,
    seasons: ['2024'],
    category: 'team',
    team: 'Spain',
    sourceUrl:
      'https://www.uefa.com/uefaeuro/history/news/028f-1b5e5c2b7b67-d5faab9be20b-1000--spain-2-1-england-late-oyarzabal-winner-earns-la-roja-reco/',
  },
  {
    title: 'La Liga Player of the Season',
    times: 1,
    seasons: ['2025/26'],
    category: 'individual',
    sourceUrl: LALIGA_PLAYER_URL,
  },
  {
    title: 'Zarra Trophy',
    times: 1,
    seasons: ['2025/26'],
    category: 'individual',
    sourceUrl:
      'https://www.fcbarcelona.com/en/football/first-team/news/4509422/lamine-yamal-and-ferran-torres-win-zarra-trophy',
  },
  {
    title: "FIFPRO Men's World 11",
    times: 1,
    seasons: ['2025'],
    category: 'individual',
    sourceUrl:
      'https://www.fifpro.org/en/articles/2025/11/who-is-in-the-2025-fifpro-men-s-world-11',
  },
  {
    title: 'Golden Boy',
    times: 1,
    seasons: ['2024'],
    category: 'individual',
    sourceUrl: BARCA_CAREER_AWARDS_URL,
  },
  {
    title: 'Kopa Trophy',
    times: 2,
    seasons: ['2024', '2025'],
    category: 'individual',
    sourceUrl: BARCA_KOPA_URL,
  },
  {
    title: 'UEFA EURO Young Player of the Tournament',
    times: 1,
    seasons: ['2024'],
    category: 'individual',
    sourceUrl:
      'https://www.uefa.com/uefaeuro/history/news/028f-1b5e5e91b6e6-b9784b9e13fb-1000--lamine-yamal-named-euro-2024-young-player-of-the-tournament/',
  },
  {
    title: 'La Liga Team of the Season',
    times: 1,
    seasons: ['2024/25'],
    category: 'individual',
    sourceUrl: BARCA_KOPA_URL,
  },
  {
    title: 'UEFA Champions League Team of the Season',
    times: 1,
    seasons: ['2024/25'],
    category: 'individual',
    sourceUrl: UEFA_YAMAL_URL,
  },
  {
    title: 'UEFA EURO Goal of the Tournament',
    times: 1,
    seasons: ['2024'],
    category: 'individual',
    sourceUrl: UEFA_YAMAL_URL,
  },
  {
    title: 'La Liga U23 Player of the Season',
    times: 2,
    seasons: ['2023/24', '2024/25'],
    category: 'individual',
    sourceUrl: BARCA_KOPA_URL,
  },
  {
    title: "IFFHS Men's World's Best Youth Player",
    times: 1,
    seasons: ['2024'],
    category: 'individual',
    sourceUrl:
      'https://iffhs.com/en/news/iffhs-awards-2024-lamine-yamal-mens-world-best-youth-player-4059',
  },
  {
    title: "The Best FIFA Men's 11",
    times: 1,
    seasons: ['2024'],
    category: 'individual',
    sourceUrl:
      'https://www.fifa.com/en/the-best-fifa-football-awards/2024/articles/mens-11-vote',
  },
  {
    title: 'Laureus World Breakthrough of the Year',
    times: 1,
    seasons: ['2025'],
    category: 'individual',
    sourceUrl:
      'https://www.laureus.com/world-sports-awards/2025/laureus-world-breakthrough-of-the-year/lamine-yamal',
  },
];

export const teamHonours = honours.filter(
  (honour): honour is TeamHonour => honour.category === 'team'
);
export const individualHonours = honours.filter(
  (honour): honour is IndividualHonour => honour.category === 'individual'
);

function normalizeTeamName(teamName: string): string {
  return teamName.trim().toLowerCase();
}

export function getTeamTitleCount(
  teamName: string | null | undefined
): number {
  if (!teamName) return 0;

  const normalizedTeamName = normalizeTeamName(teamName);
  return teamHonours.reduce(
    (total, honour) =>
      normalizeTeamName(honour.team) === normalizedTeamName
        ? total + honour.times
        : total,
    0
  );
}
