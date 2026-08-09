/* eslint-disable react-hooks/set-state-in-effect */
// src/hooks/useMediaQuery.ts
import { useEffect, useState } from "react";

/**
 * Returns true if the media query matches.
 * SSR-safe (defaults to `false` on server).
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
};
