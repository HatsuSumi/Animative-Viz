import { useEffect, useMemo, useRef, useCallback } from 'react';
import { chartAnimation, countdownAnimation } from '../../config/animationConfig';

export function useRoundProgress({
  votesData,
  voteRounds,
  setNextRoundProgress
}) {
  const startTimeRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const lastUpdateRef = useRef(0);

  const totalAnimationTime = useMemo(() => {
    if (!votesData?.length) {
      return 0;
    }

    return chartAnimation.duration +
      (chartAnimation.delayFactor * (votesData.length - 1)) +
      chartAnimation.bufferTime +
      chartAnimation.roundDelay;
  }, [votesData]);

  const resetRoundProgress = useCallback(() => {
    startTimeRef.current = Date.now();
    lastUpdateRef.current = startTimeRef.current;
    setNextRoundProgress(100);
  }, [setNextRoundProgress]);

  useEffect(() => {
    if (!votesData || !voteRounds || totalAnimationTime === 0) {
      return undefined;
    }

    resetRoundProgress();

    const updateProgress = () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;
      const minUpdateInterval = 1000 / countdownAnimation.fps;

      if (timeSinceLastUpdate >= minUpdateInterval) {
        const elapsed = now - startTimeRef.current;
        const remaining = Math.max(0, (totalAnimationTime - elapsed) / totalAnimationTime * 100);
        setNextRoundProgress(remaining);
        lastUpdateRef.current = now;
      }

      animationFrameIdRef.current = requestAnimationFrame(updateProgress);
    };

    animationFrameIdRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [resetRoundProgress, setNextRoundProgress, totalAnimationTime, voteRounds, votesData]);

  return {
    resetRoundProgress
  };
}

