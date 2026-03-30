import { useState, useCallback } from 'react';
import { Country, Question, GameConfig, GameResult } from '../types';
import { shuffle, getRandomItems } from '../utils/shuffle';
import countriesData from '../data/countries.json';

function generateQuestion(country: Country, pool: Country[]): Question {
  const others = pool.filter((c) => c.code !== country.code);
  const sameContinent = others.filter((c) => c.continent === country.continent);
  const different = others.filter((c) => c.continent !== country.continent);

  let wrongs: Country[];
  if (sameContinent.length >= 3) {
    wrongs = getRandomItems(sameContinent, 3);
  } else {
    const needed = 3 - sameContinent.length;
    wrongs = [...shuffle(sameContinent), ...getRandomItems(different, needed)];
  }

  const options = shuffle([country, ...wrongs.slice(0, 3)]);
  return {
    country,
    options,
    correctIndex: options.findIndex((o) => o.code === country.code),
  };
}

export function useGame(config: GameConfig) {
  const allCountries = countriesData as Country[];

  const pool =
    config.continent === 'Tous'
      ? allCountries
      : allCountries.filter((c) => c.continent === config.continent);

  const questionPool = pool.length >= 4 ? pool : allCountries;

  const [questions] = useState<Question[]>(() => {
    const selected = getRandomItems(pool, config.questionCount);
    return selected.map((country) => generateQuestion(country, questionPool));
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<GameResult[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const currentQuestion = questions[currentIndex];

  const answer = useCallback(
    (selectedIndex: number | null, timeSpent: number) => {
      if (!currentQuestion || feedback !== null) return;

      const isCorrect = selectedIndex !== null && selectedIndex === currentQuestion.correctIndex;
      const result: GameResult = { question: currentQuestion, selectedIndex, isCorrect, timeSpent };

      setFeedback(isCorrect ? 'correct' : 'wrong');

      setTimeout(() => {
        setFeedback(null);
        setResults((prev) => {
          const newResults = [...prev, result];
          if (newResults.length === questions.length) setIsFinished(true);
          return newResults;
        });
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex((i) => i + 1);
        }
      }, 800);
    },
    [currentQuestion, currentIndex, questions.length, feedback]
  );

  return {
    currentQuestion,
    currentIndex,
    total: questions.length,
    results,
    isFinished,
    progress: ((currentIndex) / questions.length) * 100,
    answer,
    feedback,
    totalTime: Math.round((Date.now() - startTime) / 1000),
  };
}
