import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  initialTime: number;
  onExpire?: () => void;
  autoStart?: boolean;
}

export function useTimer({ initialTime, onExpire, autoStart = false }: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stop = useCallback(() => {
    setIsRunning(false);
    clear();
  }, []);

  const start = useCallback(() => setIsRunning(true), []);

  const reset = useCallback(
    (newTime?: number) => {
      stop();
      setTimeLeft(newTime ?? initialTime);
    },
    [stop, initialTime]
  );

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stop();
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clear;
  }, [isRunning, stop]);

  const percentage = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;

  return {
    timeLeft,
    isRunning,
    start,
    stop,
    reset,
    percentage,
    isLow: percentage <= 30,
    isCritical: percentage <= 15,
  };
}
