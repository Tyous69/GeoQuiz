import styles from './FlagIcon.module.scss';

interface FlagIconProps {
  code: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function FlagIcon({ code, size = 'md', className = '' }: FlagIconProps) {
  const lower = code.toLowerCase();

  return (
    <div className={`${styles.wrapper} ${styles[size]} ${className}`}>
      <img
        src={`https://flagcdn.com/w320/${lower}.png`}
        srcSet={`https://flagcdn.com/w160/${lower}.png 1x, https://flagcdn.com/w320/${lower}.png 2x`}
        alt={code}
        className={styles.flag}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}