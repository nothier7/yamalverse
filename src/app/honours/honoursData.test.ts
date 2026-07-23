import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getTeamTitleCount,
  individualHonours,
  teamHonours,
} from './honoursData.ts';

test('team honours include the third La Liga title and 2026 World Cup', () => {
  const laLiga = teamHonours.find((honour) => honour.title === 'La Liga');
  assert.deepEqual(laLiga, {
    title: 'La Liga',
    times: 3,
    seasons: ['2022/23', '2024/25', '2025/26'],
    category: 'team',
    team: 'Barcelona',
    sourceUrl: 'https://www.fcbarcelona.com/en/football/first-team/squad/129404/lamine-yamal',
  });

  const worldCup = teamHonours.find((honour) => honour.title === 'FIFA World Cup');
  assert.deepEqual(worldCup, {
    title: 'FIFA World Cup',
    times: 1,
    seasons: ['2026'],
    category: 'team',
    team: 'Spain',
    sourceUrl: 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/spain-argentina-final-report-highlights',
  });
});

test('derives landing-page title totals from official team honours', () => {
  assert.equal(getTeamTitleCount('Barcelona'), 6);
  assert.equal(getTeamTitleCount('  spain  '), 2);
  assert.equal(getTeamTitleCount('Unknown'), 0);
  assert.equal(getTeamTitleCount(undefined), 0);
});

test('individual honours include the latest major official season awards', () => {
  assert.deepEqual(
    individualHonours
      .filter((honour) => [
        'La Liga Player of the Season',
        'Zarra Trophy',
        "FIFPRO Men's World 11",
      ].includes(honour.title))
      .map(({ title, seasons }) => ({ title, seasons })),
    [
      { title: 'La Liga Player of the Season', seasons: ['2025/26'] },
      { title: 'Zarra Trophy', seasons: ['2025/26'] },
      { title: "FIFPRO Men's World 11", seasons: ['2025'] },
    ]
  );
});

test('honour counts match seasons and every entry has HTTPS provenance', () => {
  for (const honour of [...teamHonours, ...individualHonours]) {
    assert.equal(honour.times, honour.seasons.length, honour.title);
    assert.match(honour.sourceUrl, /^https:\/\//, honour.title);
  }
});

test('the EURO young-player award uses the official title casing', () => {
  assert.ok(
    individualHonours.some(
      (honour) => honour.title === 'UEFA EURO Young Player of the Tournament'
    )
  );
});
