import { useState, useRef, useCallback, useEffect } from 'react';

type Options = {
  defaultSpeed?: number;
};

/**
 * Shared hook for all algorithm visualizers.
 * Pre-computes all steps from a generator, then provides scrubbing,
 * play/pause, step forward/back, and speed control.
 */
export function useAlgorithmPlayer<T>(options?: Options) {
  const { defaultSpeed = 50 } = options ?? {};

  const [steps, setSteps] = useState<T[]>([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(defaultSpeed);

  const timerRef = useRef<number>(0);
  const playingRef = useRef(false);
  const stepsRef = useRef<T[]>([]);
  stepsRef.current = steps;

  const step = index >= 0 && index < steps.length ? steps[index] : null;
  const isReady = steps.length > 0;
  const isDone = index >= steps.length - 1 && steps.length > 0;
  const total = steps.length;

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    playingRef.current = false;
    setIsPlaying(false);
  }, []);

  /** Load steps from a generator (pre-computes all of them) */
  const load = useCallback((generator: Generator<T>) => {
    stopTimer();
    const allSteps: T[] = [];
    let next = generator.next();
    while (!next.done) {
      allSteps.push(next.value);
      next = generator.next();
    }
    setSteps(allSteps);
    setIndex(-1);
  }, [stopTimer]);

  /** Reset to beginning */
  const reset = useCallback(() => {
    stopTimer();
    setIndex(-1);
  }, [stopTimer]);

  /** Clear everything (new array/input) */
  const clear = useCallback(() => {
    stopTimer();
    setSteps([]);
    setIndex(-1);
  }, [stopTimer]);

  /** Step forward */
  const stepForward = useCallback(() => {
    setIndex((prev) => {
      const next = prev + 1;
      return next < stepsRef.current.length ? next : prev;
    });
  }, []);

  /** Step backward */
  const stepBack = useCallback(() => {
    setIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  /** Jump to specific step */
  const scrubTo = useCallback((i: number) => {
    stopTimer();
    setIndex(Math.max(-1, Math.min(i, stepsRef.current.length - 1)));
  }, [stopTimer]);

  /** Play from current position */
  const play = useCallback(() => {
    if (stepsRef.current.length === 0) return;
    playingRef.current = true;
    setIsPlaying(true);

    const delay = Math.max(5, 200 - speed * 2);
    timerRef.current = window.setInterval(() => {
      if (!playingRef.current) return;
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= stepsRef.current.length) {
          playingRef.current = false;
          setIsPlaying(false);
          clearInterval(timerRef.current);
          return prev;
        }
        return next;
      });
    }, delay);
  }, [speed]);

  const pause = useCallback(() => {
    stopTimer();
  }, [stopTimer]);

  // Restart timer when speed changes during playback
  useEffect(() => {
    if (isPlaying) {
      clearInterval(timerRef.current);
      const delay = Math.max(5, 200 - speed * 2);
      timerRef.current = window.setInterval(() => {
        if (!playingRef.current) return;
        setIndex((prev) => {
          const next = prev + 1;
          if (next >= stepsRef.current.length) {
            playingRef.current = false;
            setIsPlaying(false);
            clearInterval(timerRef.current);
            return prev;
          }
          return next;
        });
      }, delay);
    }
  }, [speed, isPlaying]);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  return {
    // State
    step,
    steps,
    index,
    total,
    isPlaying,
    isReady,
    isDone,
    speed,
    // Actions
    load,
    reset,
    clear,
    play,
    pause,
    stepForward,
    stepBack,
    scrubTo,
    setSpeed,
  };
}
