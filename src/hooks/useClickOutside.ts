// src/hooks/useClickOutside.ts
import { useEffect, type RefObject } from 'react';

/**
 * Calls `handler` when a click/touch occurs outside the referenced element.
 * Also closes on Escape key.
 */
export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };

    const keyListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    document.addEventListener('keydown', keyListener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
      document.removeEventListener('keydown', keyListener);
    };
  }, [ref, handler]);
};