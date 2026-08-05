import { useEffect } from 'react';

/**
 * Fires when a pointerdown lands outside the ref, or Escape is pressed.
 * Used by the search overlay, dropdowns and the quick-view modal.
 */
export const useClickOutside = (ref, handler, active = true) => {
  useEffect(() => {
    if (!active) return undefined;

    const onPointerDown = (event) => {
      const node = ref.current;
      if (!node || node.contains(event.target)) return;
      handler(event);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') handler(event);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, handler, active]);
};

export default useClickOutside;
