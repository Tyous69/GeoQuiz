import * as Flags from 'country-flag-icons/react/3x2';
import styles from './FlagIcon.module.scss';

interface FlagIconProps {
  code: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function FlagIcon({ code, size = 'md', className = '' }: FlagIconProps) {
  const FlagComponent = (Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[code];

  if (!FlagComponent) {
    return (
      <div className={`${styles.placeholder} ${styles[size]} ${className}`}>
        <span>🏳️</span>
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} ${styles[size]} ${className}`}>
      <FlagComponent className={styles.flag} />
    </div>
  );
}
