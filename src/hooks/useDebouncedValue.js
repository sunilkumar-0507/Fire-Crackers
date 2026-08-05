import { useEffect, useState } from 'react';

/** Trailing-edge debounce. Used to keep search rendering off the keystroke path. */
export const useDebouncedValue = (value, delay = 180) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (value === debounced) return undefined;
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
    // `debounced` is intentionally read but not tracked — including it would
    // restart the timer on every settle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return debounced;
};

export default useDebouncedValue;
