  import { NavLink } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import styles from './Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          <img src="/favicon.svg" alt="GeoQuiz logo" className={styles.logoImg} />
          <span className={styles.logoText}>GeoQuiz</span>
        </NavLink>

        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Accueil
          </NavLink>
          <NavLink to="/jouer" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Jouer
          </NavLink>
          <NavLink to="/scores" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Scores
          </NavLink>
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}