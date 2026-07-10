import { useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import seasonsConfig from '../../config/seasonsConfig.json';
import { chartAnimation } from '../../config/animationConfig';
import { buildCharacterColors, getTextY } from './chartUtils';

function getValidatedSeasonConfig(currentSeason, seasonContract) {
  if (!currentSeason) {
    throw new Error('当前赛季不能为空');
  }

  if (!seasonContract) {
    throw new Error(`缺少后端赛季契约: ${currentSeason}`);
  }

  const currentSeasonConfig = seasonsConfig.seasons[currentSeason];

  if (!currentSeasonConfig) {
    throw new Error(`缺少赛季配置: ${currentSeason}`);
  }

  if (!currentSeasonConfig.colors) {
    throw new Error(`赛季配置缺少 colors: ${currentSeason}`);
  }

  if (!currentSeasonConfig.layout) {
    throw new Error(`赛季配置缺少 layout: ${currentSeason}`);
  }

  if (!currentSeasonConfig.roundDetailsByName || typeof currentSeasonConfig.roundDetailsByName !== 'object') {
    throw new Error(`赛季配置缺少 roundDetailsByName: ${currentSeason}`);
  }

  if (!Array.isArray(currentSeasonConfig.stats)) {
    throw new Error(`赛季配置缺少 stats: ${currentSeason}`);
  }

  if (!Array.isArray(currentSeasonConfig.stageColors)) {
    throw new Error(`赛季配置缺少 stageColors: ${currentSeason}`);
  }

  if (seasonContract.season !== currentSeason) {
    throw new Error(`后端赛季契约与当前赛季不一致: ${seasonContract.season} !== ${currentSeason}`);
  }

  if (!Array.isArray(seasonContract.vote_rounds)) {
    throw new Error(`后端赛季契约缺少 vote_rounds: ${currentSeason}`);
  }

  if (!seasonContract.special_vote_cell_counts || typeof seasonContract.special_vote_cell_counts !== 'object') {
    throw new Error(`后端赛季契约缺少 special_vote_cell_counts: ${currentSeason}`);
  }

  seasonContract.vote_rounds.forEach((roundName) => {
    const roundConfig = currentSeasonConfig.roundDetailsByName[roundName];

    if (!roundConfig) {
      throw new Error(`赛季轮次展示配置缺失: ${currentSeason} / ${roundName}`);
    }

    if (!Object.prototype.hasOwnProperty.call(roundConfig, 'startTime')) {
      throw new Error(`赛季轮次展示配置缺少 startTime: ${currentSeason} / ${roundName}`);
    }

    if (!Object.prototype.hasOwnProperty.call(roundConfig, 'totalVoters')) {
      throw new Error(`赛季轮次展示配置缺少 totalVoters: ${currentSeason} / ${roundName}`);
    }
  });

  Object.keys(currentSeasonConfig.roundDetailsByName).forEach((roundName) => {
    if (!seasonContract.vote_rounds.includes(roundName)) {
      throw new Error(`前端存在后端未声明的轮次展示配置: ${currentSeason} / ${roundName}`);
    }
  });

  return currentSeasonConfig;
}

export function useCumulativeVotesConfig({
  currentSeason,
  seasonContract,
  data
}) {
  const seasonMilestones = useMemo(() => {
    return seasonsConfig.seasons[currentSeason]?.milestones || {};
  }, [currentSeason]);

  const currentSeasonConfig = useMemo(() => {
    return getValidatedSeasonConfig(currentSeason, seasonContract);
  }, [currentSeason, seasonContract]);

  const roundConfigsByName = useMemo(() => {
    return new Map(
      seasonContract.vote_rounds.map(roundName => [
        roundName,
        currentSeasonConfig.roundDetailsByName[roundName]
      ])
    );
  }, [currentSeasonConfig, seasonContract]);

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
    roundConfigsByName,
    animationConfig,
    getCharacterColor,
    getChartTextY
  };
}
