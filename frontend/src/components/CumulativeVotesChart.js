import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import '../styles/cumulative-votes-chart.css';
import MilestonesOverlay from './MilestonesOverlay';
import { processChartData } from './CumulativeVotesChart/chartData';
import { useCumulativeVotesConfig } from './CumulativeVotesChart/useCumulativeVotesConfig';
import { createRoundAnimationController } from './CumulativeVotesChart/createRoundAnimationController';

const CumulativeVotesChart = ({
  data, 
  voteRounds,
  participatingCounts,
  currentSeason,
  charactersInfo,
  finalRanks,
  currentRoundIndex,
  onRoundChange
}) => {

  const svgRef = useRef(null);
  const animationTimeoutsRef = useRef([]);
  const [processedData, setProcessedData] = useState([]);
  const [animationKey, setAnimationKey] = useState(0);
  const [currentMilestone, setCurrentMilestone] = useState(null);

  const {
    seasonMilestones,
    currentSeasonConfig,
    animationConfig,
    getCharacterColor,
    getChartTextY
  } = useCumulativeVotesConfig({
    currentSeason,
    data
  });

  // 处理动画完成
  const handleAnimationComplete = useCallback((nextRoundIndex) => {
    onRoundChange(nextRoundIndex);
  }, [onRoundChange]);

  // 在数据变化时处理数据
  useEffect(() => {
    const processed = processChartData(data, voteRounds);
    setProcessedData(processed);
    // 触发动画重新渲染
    setAnimationKey(prev => prev + 1);
  }, [data, voteRounds]);

  const clearAnimationTimeouts = useCallback(() => {
    animationTimeoutsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    animationTimeoutsRef.current = [];
  }, []);

  // 绘制图表的主函数
  const drawChart = useCallback(() => {
    if (!svgRef.current || processedData.length === 0) return;

    const animationController = createRoundAnimationController({
      processedData,
      svgRef,
      voteRounds,
      currentRoundIndex,
      participatingCounts,
      currentSeason,
      currentSeasonConfig,
      charactersInfo,
      finalRanks,
      animationConfig,
      seasonMilestones,
      getCharacterColor,
      getChartTextY,
      handleAnimationComplete,
      setCurrentMilestone,
      animationTimeoutsRef
    });

    animationController.start();
  }, [
    animationConfig,
    charactersInfo,
    currentSeason,
    currentSeasonConfig,
    finalRanks,
    getCharacterColor,
    getChartTextY,
    handleAnimationComplete,
    participatingCounts,
    processedData,
    seasonMilestones,
    voteRounds
  ]);

  // 使用 useEffect 管理动画生命周期
  useEffect(() => {
    if (processedData && processedData.length > 0) {
      clearAnimationTimeouts();
      setCurrentMilestone(null);
      drawChart();
    }

    return () => {
      clearAnimationTimeouts();
    };
  }, [processedData, animationKey, clearAnimationTimeouts, drawChart]);

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
  charactersInfo: PropTypes.arrayOf(PropTypes.shape({
    character: PropTypes.string.isRequired,
    avatar: PropTypes.string
  })).isRequired,
  finalRanks: PropTypes.object,
  currentRoundIndex: PropTypes.number.isRequired,
  onRoundChange: PropTypes.func.isRequired
};

export default CumulativeVotesChart;
