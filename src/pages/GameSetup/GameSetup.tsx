import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGlobe, FiFlag, FiMap, FiType, FiCheck, FiClock, FiZap, FiArrowRight, FiList, FiEdit3 } from 'react-icons/fi';
import { useGameConfig } from '../../context/GameContext';
import Button from '../../components/Button/Button';
import { Continent, GameMode, Difficulty, InputMode } from '../../types';
import countriesData from '../../data/countries.json';
import styles from './GameSetup.module.scss';

const INPUT_MODES: { value: InputMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'qcm',   label: 'QCM',         desc: 'Choisissez parmi 4 propositions',       icon: <FiList />  },
  { value: 'libre', label: 'Saisie libre', desc: 'Tapez le nom vous-même (une chance)',   icon: <FiEdit3 /> },
];

const CONTINENTS: { value: Continent; label: string; count: number }[] = [
  { value: 'Tous',      label: 'Monde entier', count: 193 },
  { value: 'Europe',    label: 'Europe',        count: 44  },
  { value: 'Afrique',   label: 'Afrique',       count: 54  },
  { value: 'Asie',      label: 'Asie',          count: 46  },
  { value: 'Amériques', label: 'Amériques',     count: 35  },
  { value: 'Océanie',   label: 'Océanie',       count: 14  },
];

const MODES: { value: GameMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'flag-to-country', label: 'Drapeau → Pays', desc: 'Identifiez le pays à partir de son drapeau', icon: <FiFlag /> },
  { value: 'country-to-flag', label: 'Pays → Drapeau', desc: 'Retrouvez le drapeau du pays affiché',       icon: <FiType /> },
  { value: 'map-to-country',  label: 'Carte → Pays',   desc: 'Nommez le pays mis en surbrillance',         icon: <FiMap />  },
];

const DIFFICULTIES: { value: Difficulty; label: string; desc: string; color: string; time: string; icon: React.ReactNode }[] = [
  { value: 'facile',    label: 'Facile',    desc: 'Sans limite de temps',     color: 'success', time: '∞',   icon: <FiCheck /> },
  { value: 'moyen',     label: 'Moyen',     desc: '20 secondes par question', color: 'warning', time: '20s', icon: <FiClock /> },
  { value: 'difficile', label: 'Difficile', desc: '7 secondes par question',  color: 'error',   time: '7s',  icon: <FiZap />   },
];

const QUESTION_COUNTS = [5, 10, 15, 20, 'Tout'] as const;

export default function GameSetup() {
  const navigate = useNavigate();
  const { setConfig } = useGameConfig();

  const [inputMode,     setInputMode]     = useState<InputMode>('qcm');
  const [continent,     setContinent]     = useState<Continent>('Tous');
  const [mode,          setMode]          = useState<GameMode>('flag-to-country');
  const [difficulty,    setDifficulty]    = useState<Difficulty>('facile');
  const [questionCount, setQuestionCount] = useState<number | 'Tout'>(10);

  // Saisie libre incompatible avec Pays → Drapeau : reset auto
  useEffect(() => {
    if (mode === 'country-to-flag' && inputMode === 'libre') {
      setInputMode('qcm');
    }
  }, [mode, inputMode]);

  const countries = countriesData as { code: string; name: string; continent: Continent }[];
  const availableCount = continent === 'Tous'
    ? countries.length
    : countries.filter(c => c.continent === continent).length;

  const resolvedCount = questionCount === 'Tout'
    ? availableCount
    : Math.min(questionCount, availableCount);

  const handleStart = () => {
    setConfig({ mode, difficulty, continent, questionCount: resolvedCount, inputMode });
    navigate('/partie');
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Configuration</p>
          <h1 className={styles.title}>Préparez votre partie</h1>
        </div>

        <div className={styles.sections}>

          {/* Type de réponse */}
          <section className={styles.section}>
            <h2 className={styles.sectionLabel}><span>01</span> Type de réponse</h2>
            <div className={styles.inputModeGrid}>
              {INPUT_MODES.map(m => {
                const isDisabled = m.value === 'libre' && mode === 'country-to-flag';
                return (
                  <button
                    key={m.value}
                    className={`${styles.modeCard} ${inputMode === m.value ? styles.selected : ''} ${isDisabled ? styles.disabledCard : ''}`}
                    onClick={() => !isDisabled && setInputMode(m.value)}
                    disabled={isDisabled}
                    title={isDisabled ? 'Non disponible avec le mode Pays → Drapeau' : undefined}
                  >
                    <span className={styles.modeIcon}>{m.icon}</span>
                    <div>
                      <p className={styles.modeName}>{m.label}</p>
                      <p className={styles.modeDesc}>
                        {isDisabled ? 'Non disponible dans ce mode' : m.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Zone géographique */}
          <section className={styles.section}>
            <h2 className={styles.sectionLabel}><span>02</span> Zone géographique</h2>
            <div className={styles.continentGrid}>
              {CONTINENTS.map(c => (
                <button
                  key={c.value}
                  className={`${styles.continentCard} ${continent === c.value ? styles.selected : ''}`}
                  onClick={() => setContinent(c.value)}
                >
                  <FiGlobe size={18} className={styles.continentIcon} />
                  <span className={styles.continentName}>{c.label}</span>
                  <span className={styles.continentCount}>{c.count} pays</span>
                </button>
              ))}
            </div>
          </section>

          {/* Mode de jeu */}
          <section className={styles.section}>
            <h2 className={styles.sectionLabel}><span>03</span> Mode de jeu</h2>
            <div className={styles.modeGrid}>
              {MODES.map(m => (
                <button
                  key={m.value}
                  className={`${styles.modeCard} ${mode === m.value ? styles.selected : ''}`}
                  onClick={() => setMode(m.value)}
                >
                  <span className={styles.modeIcon}>{m.icon}</span>
                  <div>
                    <p className={styles.modeName}>{m.label}</p>
                    <p className={styles.modeDesc}>{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Difficulté */}
          <section className={styles.section}>
            <h2 className={styles.sectionLabel}><span>04</span> Difficulté</h2>
            <div className={styles.diffGrid}>
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  className={`${styles.diffCard} ${styles[d.color]} ${difficulty === d.value ? styles.selected : ''}`}
                  onClick={() => setDifficulty(d.value)}
                >
                  <div className={styles.diffTop}>
                    <span className={styles.diffName}>
                      <span className={styles.diffIconWrap}>{d.icon}</span>
                      {d.label}
                    </span>
                    <span className={styles.diffTime}>{d.time}</span>
                  </div>
                  <p className={styles.diffDesc}>{d.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Nombre de questions */}
          <section className={styles.section}>
            <h2 className={styles.sectionLabel}>
              <span>05</span> Nombre de questions
              <span className={styles.available}>({availableCount} disponibles)</span>
            </h2>
            <div className={styles.countRow}>
              {QUESTION_COUNTS.map(n => {
                const isDisabled = typeof n === 'number' && n > availableCount;
                return (
                  <button
                    key={n}
                    disabled={isDisabled}
                    className={`${styles.countBtn} ${questionCount === n ? styles.selected : ''}`}
                    onClick={() => setQuestionCount(n as number | 'Tout')}
                  >
                    {n === 'Tout' ? `Tout (${availableCount})` : n}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer résumé + lancer */}
        <div className={styles.footer}>
          <div className={styles.summary}>
            <span>{inputMode === 'qcm' ? 'QCM' : 'Saisie libre'}</span>
            <span className={styles.dot}>·</span>
            <span>{MODES.find(m => m.value === mode)?.label}</span>
            <span className={styles.dot}>·</span>
            <span>{CONTINENTS.find(c => c.value === continent)?.label}</span>
            <span className={styles.dot}>·</span>
            <span className={styles[DIFFICULTIES.find(d => d.value === difficulty)!.color]}>
              {DIFFICULTIES.find(d => d.value === difficulty)?.label}
            </span>
            <span className={styles.dot}>·</span>
            <span>{resolvedCount} questions</span>
          </div>
          <Button size="lg" onClick={handleStart}>
            Lancer la partie <FiArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}