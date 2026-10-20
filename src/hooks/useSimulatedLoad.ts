import { useCallback, useEffect, useState } from 'react';

export type LoadState = 'loading' | 'ready' | 'error';

/**
 * Simulates a first data request so loading and error states can be reviewed.
 * When failFirst is true, the first attempt errors and "Try Again" succeeds.
 * Replace with a real request when an API exists.
 */
export function useSimulatedLoad(failFirst = false, delay = 450) {
  const [state, setState] = useState<LoadState>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setState('loading');
    const timer = window.setTimeout(() => setState(failFirst && attempt === 0 ? 'error' : 'ready'), delay);
    return () => window.clearTimeout(timer);
  }, [attempt, failFirst, delay]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, retry };
}