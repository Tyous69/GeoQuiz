import { useState } from 'react';
import { FiAward, FiZap, FiPlay, FiStar, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { getAllStats } from '../../utils/storage';
import { formatTime } from '../../utils/score';
import styles from './Scores.module.scss';

const MODE_LABELS: Record<string, string> = {
  'flag-to-country': 'Drapeau → Pays',
  'country-to-flag': 'Pays → Drapeau',
  'map-to-country':  'Carte → Pays',
};
const DIFF_LABELS: Record<string, string> = {
  facile: 'Facile', moyen: 'Moyen', difficile: 'Difficile',
};
const DIFF_COLOR: Record<string, string> = {
  facile: 'success', moyen: 'warning', difficile: 'error',
};

export default function Scores() {
  const [stats, setStats]       = useState(() => getAllStats());
  const [confirm, setConfirm]   = useState(false);

  const handleReset = () => {
    localStorage.removeItem('geoquiz_stats');
    setStats({});
    setConfirm(false);
  };

  const entries = Object.entries(stats);

  return (
    <div className={styles.page}>
      <div className="container">

        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Historique</p>
            <h1 className={styles.title}>Mes meilleurs scores</h1>
          </div>

          {entries.length > 0 && (
            <button
              className={styles.resetBtn}
              onClick={() => setConfirm(true)}
              title="Réinitialiser tous les scores"
            >
              <FiTrash2 size={15} />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Confirm dialog */}
        {confirm && (
          <div className={styles.confirmBox}>
            <FiAlertTriangle size={20} className={styles.confirmIcon} />
            <div className={styles.confirmText}>
              <p className={styles.confirmTitle}>Supprimer tous les scores ?</p>
              <p className={styles.confirmSub}>Cette action est irréversible.</p>
            </div>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirm(false)}>
                Annuler
              </button>
              <button className={styles.deleteBtn} onClick={handleReset}>
                Supprimer
              </button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className={styles.empty}>
            <FiAward size={48} />
            <p>Aucune partie jouée pour l'instant.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {entries.map(([key, s]) => {
              const [mode, diff, continent] = key.split('__');
              const isPerfect = s.bestScore === 100;
              return (
                <div key={key} className={`${styles.card} ${isPerfect ? styles.perfect : ''}`}>
                  <div className={styles.cardTop}>
                    <span className={styles.modeName}>{MODE_LABELS[mode] ?? mode}</span>
                    <span className={`${styles.diffBadge} ${styles[DIFF_COLOR[diff]]}`}>
                      {DIFF_LABELS[diff] ?? diff}
                    </span>
                  </div>

                  <p className={styles.continent}>{continent}</p>

                  {isPerfect && (
                    <div className={styles.perfectBadge}>
                      <FiStar size={12} /> Score parfait !
                    </div>
                  )}

                  <div className={styles.cardStats}>
                    <div className={styles.stat}>
                      <FiAward size={14} className={styles.statIcon} />
                      <span className={styles.statVal} style={{ color: 'var(--primary)' }}>
                        {s.bestScore}%
                      </span>
                      <span className={styles.statLbl}>Meilleur score</span>
                    </div>

                    {s.bestTime != null && (
                      <div className={styles.stat}>
                        <FiZap size={14} className={styles.statIcon} />
                        <span className={styles.statVal} style={{ color: 'var(--warning)' }}>
                          {formatTime(s.bestTime)}
                        </span>
                        <span className={styles.statLbl}>Meilleur temps</span>
                      </div>
                    )}

                    <div className={styles.stat}>
                      <FiPlay size={14} className={styles.statIcon} />
                      <span className={styles.statVal}>{s.gamesPlayed}</span>
                      <span className={styles.statLbl}>Parties</span>
                    </div>

                    {s.lastQuestionCount != null && s.lastQuestionCount > 0 && (
                      <div className={styles.stat}>
                        <span className={styles.statVal} style={{ color: 'var(--text-muted)' }}>
                          {s.lastQuestionCount}
                        </span>
                        <span className={styles.statLbl}>Questions</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}