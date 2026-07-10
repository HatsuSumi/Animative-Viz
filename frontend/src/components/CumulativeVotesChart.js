import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';  
import '../styles/cumulative-votes-chart.css';
import MilestonesOverlay from './MilestonesOverlay';
import { processChartData, buildRoundSnapshots } from './CumulativeVotesChart/chartData';
import { useCumulativeVotesConfig } from './CumulativeVotesChart/useCumulativeVotesConfig';
import { createRoundAnimationController } from './CumulativeVotesChart/createRoundAnimationController';

const CumulativeVotesChart = ({
  data, 
  voteRounds,
  participatingCounts,
  currentSeason,
  seasonContract,
  charactersInfo,
  finalRanks,
  currentRoundIndex,
  onRoundChange
}) => {

  const svgRef = useRef(null);
  const animationTimeoutsRef = useRef([]);
  const animationStartRoundIndexRef = useRef(currentRoundIndex);
  const [currentMilestone, setCurrentMilestone] = useState(null);

  const {
    seasonMilestones,
    currentSeasonConfig,
    roundConfigsByName,
    animationConfig,
    getCharacterColor,
    getChartTextY
  } = useCumulativeVotesConfig({
    currentSeason,
    seasonContract,
    data
  });

  const processedData = useMemo(() => processChartData(data, voteRounds), [data, voteRounds]);
  const precomputedRounds = useMemo(() => buildRoundSnapshots({
    processedData,
    participatingCounts,
    voteRounds,
    currentSeason,
    currentSeasonConfig,
    roundConfigsByName,
    charactersInfo
  }), [
    charactersInfo,
    currentSeason,
    currentSeasonConfig,
    participatingCounts,
    processedData,
    roundConfigsByName,
    voteRounds
  ]);

  const handleAnimationComplete = useCallback((nextRoundIndex) => {
    onRoundChange(nextRoundIndex);
  }, [onRoundChange]);

  useEffect(() => {
    animationStartRoundIndexRef.current = currentRoundIndex;
  }, [currentRoundIndex]);

  const clearAnimationTimeouts = useCallback(() => {
    animationTimeoutsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    animationTimeoutsRef.current = [];
  }, []);

  const resetChartSvg = useCallback(() => {
    if (!svgRef.current) {
      return;
    }

    const svgSelection = d3.select(svgRef.current);
    svgSelection.interrupt();
    svgSelection.selectAll('*').interrupt();
    svgSelection.selectAll('*').remove();
  }, []);

  const drawChart = useCallback(() => {
    if (!svgRef.current || processedData.length === 0) return;

    const animationController = createRoundAnimationController({
      processedData,
      svgRef,
      voteRounds,
      currentRoundIndex: animationStartRoundIndexRef.current,
      participatingCounts,
      currentSeason,
      currentSeasonConfig,
      roundConfigsByName,
      charactersInfo,
      finalRanks,
      animationConfig,
      seasonMilestones,
      getCharacterColor,
      getChartTextY,
      handleAnimationComplete,
      setCurrentMilestone,
      animationTimeoutsRef,
      precomputedRounds
    });

    animationController.start();
  }, [
    animationConfig,
    charactersInfo,
    currentSeason,
    currentSeasonConfig,
    roundConfigsByName,
    finalRanks,
    getCharacterColor,
    getChartTextY,
    handleAnimationComplete,
    participatingCounts,
    precomputedRounds,
    processedData,
    seasonMilestones,
    voteRounds
  ]);

  useEffect(() => {
    if (processedData && processedData.length > 0) {
      clearAnimationTimeouts();
      resetChartSvg();
      setCurrentMilestone(null);
      drawChart();
    }

    return () => {
      clearAnimationTimeouts();
      resetChartSvg();
    };
  }, [processedData, clearAnimationTimeouts, drawChart, resetChartSvg]);

  return (
    <>
      <svg ref={svgRef}></svg>
      {createPortal(
        <MilestonesOverlay 
          currentMilestone={currentMilestone} 
          currentSeasonConfig={currentSeasonConfig}
        />,
        document.body
      )}
    </>
  );
};

CumulativeVotesChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  voteRounds: PropTypes.arrayOf(PropTypes.string).isRequired,
  participatingCounts: PropTypes.objectOf(PropTypes.number).isRequired,
  currentSeason: PropTypes.string.isRequired,
  seasonContract: PropTypes.shape({
    season: PropTypes.string.isRequired,
    vote_rounds: PropTypes.arrayOf(PropTypes.string).isRequired,
    special_vote_cell_counts: PropTypes.object.isRequired,
    has_wildcard_votes: PropTypes.bool.isRequired,
    has_ranking_votes: PropTypes.bool.isRequired
  }).isRequired,
  charactersInfo: PropTypes.arrayOf(PropTypes.shape({
    character: PropTypes.string.isRequired,
    avatar: PropTypes.string
  })).isRequired,
  finalRanks: PropTypes.object,
  currentRoundIndex: PropTypes.number.isRequired,
  onRoundChange: PropTypes.func.isRequired
};

export default CumulativeVotesChart;
