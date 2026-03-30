import styles from './Timer.module.scss';

interface TimerProps {
  timeLeft: number;
  percentage: number;
  isLow: boolean;
  isCritical: boolean;
}

export default function Timer({ timeLeft, percentage, isLow, isCritical }: TimerProps) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClass = isCritical
    ? styles.critical
    : isLow
    ? styles.low
    : styles.normal;

  return (
    <div className={`${styles.timer} ${colorClass}`}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="3"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 28 28)"
          className={styles.arc}
        />
      </svg>
      <span className={styles.label}>{timeLeft}</span>
    </div>
  );
}
