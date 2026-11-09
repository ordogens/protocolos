import { useCallback } from 'react';

export const useMobile = () => {
  const isMobile = useCallback((): boolean => {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }, []);

  const isTouch = useCallback((): boolean => {
    return (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    );
  }, []);

  return { isMobile, isTouch };
};
