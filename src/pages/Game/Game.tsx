import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameConfig } from '../../context/GameContext';
import { useGame } from '../../hooks/useGame';
import { useTimer } from '../../hooks/useTimer';
import { saveStats } from '../../utils/storage';
import { calculateScore } from '../../utils/score';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Timer from '../../components/Timer/Timer';
import FlagToCountry from '../../game/FlagToCountry/FlagToCountry';
import CountryToFlag from '../../game/CountryToFlag/CountryToFlag';
import MapToCountry from '../../game/MapToCountry/MapToCountry';
import { FiX } from 'react-icons/fi';
import styles from './Game.module.scss';

const TIMER_MAP = { facile: 0, moyen: 20, difficile: 7 };

export default function Game() {
  const navigate = useNavigate();
  const { config, clearConfig } = useGameConfig();
  const questionStartRef = useRef(Date.now());
  const savedRef = useRef(false);

  const timerSeconds = TIMER_MAP[config?.difficulty ?? 'facile'];
  const hasTimer = timerSeconds > 0;

  const { currentQuestion, currentIndex, total, results, isFinished, progress, answer, feedback } =
    useGame(config!);

  const timer = useTimer({
    initialTime: timerSeconds,
    autoStart: hasTimer,
    onExpire: () => { if (currentQuestion) answer(null, timerSeconds); },
  });

  useEffect(() => { if (!config) navigate('/jouer'); }, [config, navigate]);

  useEffect(() => {
    questionStartRef.current = Date.now();
    if (hasTimer) { timer.reset(timerSeconds); setTimeout(() => timer.start(), 50); }
  }, [currentIndex]);

  useEffect(() => {
    if (!isFinished || results.length === 0 || savedRef.current || !config) return;
    savedRef.current = true;
    timer.stop();
    const score = calculateScore(results);
    const totalTime = results.reduce((a, r) => a + r.timeSpent, 0);
    saveStats(config.mode, config.difficulty, config.continent, score, hasTimer ? totalTime : null, config.questionCount);
    sessionStorage.setItem('geoquiz_last_results', JSON.stringify({ results, totalTime, config }));
    navigate('/résultats', { replace: true });
  }, [isFinished, results]);

  if (!config || !currentQuestion) return null;

  const sharedProps = {
    question: currentQuestion,
    onAnswer: answer,
    feedback,
    startTime: questionStartRef.current,
    inputMode: config.inputMode,
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.topInner}>
            <div className={styles.progressInfo}>
              <span className={styles.questionCount}>{currentIndex + 1} <span>/ {total}</span></span>
              <div className={styles.progressWrap}><ProgressBar value={progress} /></div>
            </div>

            {hasTimer && <Timer timeLeft={timer.timeLeft} percentage={timer.percentage} isLow={timer.isLow} isCritical={timer.isCritical} />}

            <div className={styles.topRight}>
              <span className={styles.scorePreview}>
                ✓ {results.filter(r => r.isCorrect).length}<span> / {results.length}</span>
              </span>
              <button className={styles.quitBtn} onClick={() => { clearConfig(); navigate('/'); }} title="Quitter">
                <FiX size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className="container">
          <div className={styles.card}>
            {feedback && (
              <div className={`${styles.feedbackBanner} ${styles[feedback]}`}>
                {feedback === 'correct' ? '✓ Bonne réponse !' : `✗ La bonne réponse était : ${currentQuestion.country.name}`}
              </div>
            )}

            {config.mode === 'flag-to-country' && <FlagToCountry {...sharedProps} />}
            {config.mode === 'country-to-flag' && <CountryToFlag {...sharedProps} />}
            {config.mode === 'map-to-country'  && <MapToCountry  {...sharedProps} continent={config.continent} />}
          </div>
        </div>
      </div>
    </div>
  );
}
