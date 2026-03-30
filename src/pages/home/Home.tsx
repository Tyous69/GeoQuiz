import { useNavigate } from 'react-router-dom';
import { FiFlag, FiMap, FiType, FiArrowRight, FiClock, FiZap, FiCheck } from 'react-icons/fi';
import { BiWorld } from 'react-icons/bi';
import Button from '../../components/Button/Button';
import WorldGlobe from '../../components/WorldGlobe/WorldGlobe';
import styles from './Home.module.scss';

const MODES = [
  { icon: <FiFlag />, label: 'Drapeau → Pays', desc: 'Un drapeau s\'affiche, identifiez le pays parmi 4 propositions.' },
  { icon: <FiType />, label: 'Pays → Drapeau', desc: 'Le nom d\'un pays vous est donné, retrouvez son drapeau.' },
  { icon: <FiMap />,  label: 'Carte → Pays',   desc: 'Un pays est mis en surbrillance sur la carte, nommez-le.' },
];

const DIFFS = [
  { icon: <FiCheck />, label: 'Facile',    desc: 'Pas de limite de temps.',          color: 'success', time: '∞' },
  { icon: <FiClock />, label: 'Moyen',     desc: '20 secondes par question.',        color: 'warning', time: '20s' },
  { icon: <FiZap />,   label: 'Difficile', desc: '7 secondes — mode speedrun.',      color: 'error',   time: '7s' },
];

const STATS = [
  { value: '193', label: 'pays du monde' },
  { value: '3',   label: 'modes de jeu'  },
  { value: '5',   label: 'continents'    },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            <BiWorld /> Drapeaux &nbsp;·&nbsp; Cartes &nbsp;·&nbsp; Géographie
          </p>
          <h1 className={styles.heroTitle}>
            Testez vos<br />
            <span className={styles.heroAccent}>connaissances</span><br />
            du monde.
          </h1>
          <p className={styles.heroDescription}>
            Des drapeaux aux frontières, partez à la conquête de la géographie mondiale.
            Trois modes, trois difficultés, 193 pays.
          </p>
          <Button size="lg" onClick={() => navigate('/jouer')}>
            Commencer à jouer <FiArrowRight />
          </Button>
        </div>

        <div className={styles.heroDecor} aria-hidden>
          <WorldGlobe />
        </div>

        <div className={styles.heroBg} aria-hidden />
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statsGrid}>
            {STATS.map(s => (
              <div key={s.label} className={styles.statCard}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modes */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Comment ça marche</p>
            <h2 className={styles.sectionTitle}>Trois façons de jouer</h2>
          </div>
          <div className={styles.modesGrid}>
            {MODES.map(m => (
              <div key={m.label} className={styles.modeCard}>
                <div className={styles.modeIcon}>{m.icon}</div>
                <h3>{m.label}</h3>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Difficulties */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Difficulté</p>
            <h2 className={styles.sectionTitle}>Choisissez votre challenge</h2>
          </div>
          <div className={styles.diffGrid}>
            {DIFFS.map(d => (
              <div key={d.label} className={`${styles.diffCard} ${styles[d.color]}`}>
                <div className={styles.diffTop}>
                  <span className={styles.diffIcon}>{d.icon}</span>
                  <span className={styles.diffTime}>{d.time}</span>
                </div>
                <h3>{d.label}</h3>
                <p>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2>Prêt à tester vos connaissances ?</h2>
            <p>Choisissez un continent, un mode et lancez-vous.</p>
            <Button size="lg" onClick={() => navigate('/jouer')}>
              Jouer maintenant <FiArrowRight />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
