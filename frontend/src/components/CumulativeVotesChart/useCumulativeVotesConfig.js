import { useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import seasonsConfig from '../../config/seasonsConfig.json';
import { chartAnimation } from '../../config/animationConfig';
import { buildCharacterColors, getTextY } from './chartUtils';

export function useCumulativeVotesConfig({
  currentSeason,
  data
}) {
  const seasonMilestones = useMemo(() => {
    return seasonsConfig.seasons[currentSeason]?.milestones || {};
  }, [currentSeason]);

  const currentSeasonConfig = useMemo(() => {
    return seasonsConfig.seasons[currentSeason] || {};
  }, [currentSeason]);

  const animationConfig = useMemo(() => ({
    duration: chartAnimation.duration,
    delayFactor: chartAnimation.delayFactor,
    easing: d3[chartAnimation.easing],
    bufferTime: chartAnimation.bufferTime,
    roundDelay: chartAnimation.roundDelay
  }), []);

  const characterColors = useMemo(() => {
    return buildCharacterColors(data, currentSeasonConfig);
  }, [data, currentSeasonConfig]);

  const getCharacterColor = useCallback((character) => {
    return characterColors.get(character) || currentSeasonConfig.colors.default;
  }, [characterColors, currentSeasonConfig.colors.default]);

  const getChartTextY = useCallback((index, type, height) => {
    return getTextY(index, type, height, currentSeasonConfig);
  }, [currentSeasonConfig]);

  return {
    seasonMilestones,
    currentSeasonConfig,
    animationConfig,
    getCharacterColor,
    getChartTextY
  };
}

