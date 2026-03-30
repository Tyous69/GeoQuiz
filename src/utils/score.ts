import { GameResult } from '../types';

export function calculateScore(results: GameResult[]): number {
  if (results.length === 0) return 0;
  const correct = results.filter((r) => r.isCorrect).length;
  return Math.round((correct / results.length) * 100);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Exceptionnel !', color: 'var(--success)' };
  if (score >= 75) return { label: 'Très bien !', color: 'var(--primary)' };
  if (score >= 50) return { label: 'Pas mal !', color: 'var(--warning)' };
  return { label: 'À améliorer…', color: 'var(--error)' };
}
