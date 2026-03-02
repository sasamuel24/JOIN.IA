'use client';

import { useEffect, useState } from 'react';

interface WindowSize {
  width: number;
  isMobile: boolean; // < 768px → card view
}

export function useWindowSize(): WindowSize {
  // Default to desktop to avoid SSR/hydration mismatch
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { width, isMobile: width < 768 };
}
