import { useNavigate } from 'react-router-dom';
import { FiZap, FiPlay, FiAward, FiRotateCcw, FiHome, FiPlusCircle } from 'react-icons/fi';
import { useGameConfig } from '../../context/GameContext';
import { getAllStats } from '../../utils/storage';
import { calculateScore, formatTime, getScoreLabel } from '../../utils/score';
import Button from '../../components/Button/Button';
import FlagIcon from '../../components/FlagIcon/FlagIcon';
import { GameResult, GameConfig } from '../../types';
import styles from './Summary.module.scss';

export default function Summary() {
  const navigate = useNavigate();
  const { config, clearConfig } = useGameConfig();

  const raw = sessionStorage.getItem('geoquiz_last_results');
  const parsed: { results: GameResult[]; totalTime: number; config: GameConfig } | null =
    raw ? JSON.parse(raw) : null;

  // Use config from sessionStorage as fallback (in case context was lost)
  const activeConfig = config ?? parsed?.config;
  const results: GameResult[] = parsed?.results ?? [];
  const totalTime: number = parsed?.totalTime ?? 0;

  if (!activeConfig || results.length === 0) {
    navigate('/');
    return null;
  }

  const score = calculateScore(results);
  const { label: scoreLabel, color: scoreColor } = getScoreLabel(score);
  const correct = results.filter(r => r.isCorrect).length;
  const hasTimer = activeConfig.difficulty !== 'facile';
  const isPerfect = score === 100;

  const stats = getAllStats();
  const key = `${activeConfig.mode}__${activeConfig.difficulty}__${activeConfig.continent}`;
  const best = stats[key];
  const isNewBest = best?.bestScore === score && best?.gamesPlayed >= 1;

  const wrongAnswers = results.filter(r => !r.isCorrect);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Score hero */}
        <div className={styles.scoreHero}>
          {isNewBest && (
            <div className={styles.newBestBadge}>
              <FiAward size={14} /> Nouveau record !
            </div>
          )}
          {isPerfect && (
            <div className={styles.perfectBadge}>
              <FiAward size={14} /> Score parfait — 100% !
            </div>
          )}

          <div
            className={styles.scoreCircle}
            style={{ '--score-color': scoreColor } as React.CSSProperties}
          >
            <span className={styles.scoreValue}>{score}%</span>
            <span className={styles.scoreLabel}>{scoreLabel}</span>
          </div>

          <p className={styles.scoreDetail}>
            <strong style={{ color: 'var(--success)' }}>{correct}</strong>{' '}
            bonne{correct > 1 ? 's' : ''} réponse{correct > 1 ? 's' : ''} sur{' '}
            <strong>{results.length}</strong>
            {hasTimer && (
              <> &nbsp;·&nbsp; <strong>{formatTime(totalTime)}</strong></>
            )}
          </p>
        </div>

        {/* Personal bests */}
        {best && (
          <div className={styles.bests}>
            <div className={styles.bestCard}>
              <FiAward size={20} className={styles.bestIcon} />
              <div>
                <p className={styles.bestTitle}>Meilleur score</p>
                <p className={styles.bestValue} style={{ color: 'var(--primary)' }}>
                  {best.bestScore}%
                </p>
              </div>
            </div>
            {hasTimer && best.bestTime != null && (
              <div className={styles.bestCard}>
                <FiZap size={20} className={styles.bestIcon} />
                <div>
                  <p className={styles.bestTitle}>Meilleur temps</p>
                  <p className={styles.bestValue} style={{ color: 'var(--warning)' }}>
                    {formatTime(best.bestTime)}
                  </p>
                </div>
              </div>
            )}
            <div className={styles.bestCard}>
              <FiPlay size={20} className={styles.bestIcon} />
              <div>
                <p className={styles.bestTitle}>Parties jouées</p>
                <p className={styles.bestValue}>{best.gamesPlayed}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Button size="lg" onClick={() => { clearConfig(); navigate('/jouer'); }}>
            <FiRotateCcw size={16} /> Rejouer
          </Button>
          <Button size="lg" variant="secondary" onClick={() => { clearConfig(); navigate('/jouer'); }}>
            <FiPlusCircle size={16} /> Nouvelle partie
          </Button>
          <Button size="lg" variant="ghost" onClick={() => { clearConfig(); navigate('/'); }}>
            <FiHome size={16} /> Accueil
          </Button>
        </div>

        {/* Wrong answers */}
        {wrongAnswers.length > 0 && (
          <div className={styles.review}>
            <h2 className={styles.reviewTitle}>
              À réviser <span>({wrongAnswers.length})</span>
            </h2>
            <div className={styles.reviewGrid}>
              {wrongAnswers.map((r, i) => (
                <div key={i} className={styles.reviewCard}>
                  <FlagIcon code={r.question.country.code} size="md" />
                  <div className={styles.reviewInfo}>
                    <p className={styles.reviewCorrect}>{r.question.country.name}</p>
                    <p className={styles.reviewContinent}>{r.question.country.continent}</p>
                  </div>
                  {r.selectedIndex !== null ? (
                    <span className={styles.reviewWrong}>
                      {r.question.options[r.selectedIndex]?.name}
                    </span>
                  ) : (
                    <span className={styles.reviewTimeout}>Temps écoulé</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
