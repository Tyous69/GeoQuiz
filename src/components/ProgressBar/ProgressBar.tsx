import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  animated?: boolean;
}

export default function ProgressBar({ value, color, animated = true }: ProgressBarProps) {
  return (
    <div className={styles.track}>
      <div
        className={`${styles.fill} ${animated ? styles.animated : ''}`}
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          ...(color ? { background: color } : {}),
        }}
      />
    </div>
  );
}
