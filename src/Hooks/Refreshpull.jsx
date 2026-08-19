import { useState, useEffect, useCallback } from 'react';

export default function usePullToRefresh(onRefresh) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const THRESHOLD = 80; // pixels to trigger refresh

  const handleTouchStart = useCallback((e) => {
    if (refreshing) return;
    // Only activate if scrolled to top
    if (window.scrollY === 0) {
      setPullDistance(e.touches[0].clientY);
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (refreshing) return;
    if (window.scrollY !== 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - pullDistance;

    if (distance > 0) {
      e.preventDefault(); // prevent native scroll
      setPulling(distance > 20); // show arrow after 20px
      setPullDistance(prev => prev); // keep reference
    }
  }, [pullDistance, refreshing]);

  const handleTouchEnd = useCallback(() => {
    if (pulling && !refreshing) {
      setRefreshing(true);
      // Call the actual data fetch
      Promise.resolve(onRefresh()).finally(() => {
        setRefreshing(false);
        setPulling(false);
        setPullDistance(0);
      });
    } else {
      setPulling(false);
      setPullDistance(0);
    }
  }, [pulling, refreshing, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pulling, refreshing };
}