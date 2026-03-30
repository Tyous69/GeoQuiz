export type Continent = 'Europe' | 'Afrique' | 'Asie' | 'Amériques' | 'Océanie' | 'Tous';
export type GameMode = 'flag-to-country' | 'country-to-flag' | 'map-to-country';
export type Difficulty = 'facile' | 'moyen' | 'difficile';
export type InputMode = 'qcm' | 'libre';

export interface Country {
  code: string;
  name: string;
  continent: Continent;
}

export interface Question {
  country: Country;
  options: Country[];
  correctIndex: number;
}

export interface GameConfig {
  mode: GameMode;
  difficulty: Difficulty;
  continent: Continent;
  questionCount: number;
  inputMode: InputMode;
}

export interface GameResult {
  question: Question;
  selectedIndex: number | null;
  isCorrect: boolean;
  timeSpent: number;
}

export interface GameStats {
  bestScore: number;
  bestTime: number | null;
  gamesPlayed: number;
  lastQuestionCount: number;
}

export type StoredStats = Record<string, GameStats>;
