import { useEffect, useState } from 'react';
import { splitDuration } from '@/utils/format';

/**
 * One-second countdown to a timestamp.
 *
 * The interval is cleared as soon as the deadline passes, so an expired offer
 * card stops costing a timer for the rest of the session.
 */
export const useCountdown = (deadline) => {
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()));

  useEffect(() => {
    setRemaining(Math.max(0, deadline - Date.now()));
    if (deadline <= Date.now()) return undefined;

    const id = setInterval(() => {
      const next = Math.max(0, deadline - Date.now());
      setRemaining(next);
      if (next === 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [deadline]);

  return splitDuration(remaining);
};

export default useCountdown;
