import { StoredStats, GameStats } from '../types';

const STORAGE_KEY = 'geoquiz_stats';

function getStats(): StoredStats {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

export function getStatKey(mode: string, difficulty: string, continent: string): string {
  return `${mode}__${difficulty}__${continent}`;
}

export function getBestStats(mode: string, difficulty: string, continent: string): GameStats | null {
  return getStats()[getStatKey(mode, difficulty, continent)] ?? null;
}

export function saveStats(
  mode: string,
  difficulty: string,
  continent: string,
  score: number,
  time: number | null,
  questionCount = 0
): void {
  const stats = getStats();
  const key = getStatKey(mode, difficulty, continent);
  const existing = stats[key];

  stats[key] = {
    bestScore: existing ? Math.max(existing.bestScore, score) : score,
    bestTime:
      time !== null
        ? existing?.bestTime != null ? Math.min(existing.bestTime, time) : time
        : existing?.bestTime ?? null,
    gamesPlayed: (existing?.gamesPlayed ?? 0) + 1,
    lastQuestionCount: questionCount,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function getAllStats(): StoredStats {
  return getStats();
}
