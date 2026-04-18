import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import CumulativeVotesChart from '../components/CumulativeVotesChart';
import '../styles/cumulative-votes-chart.css';
import { useCumulativeVotesPageData } from './hooks/useCumulativeVotesPageData';
import { useRoundProgress } from './hooks/useRoundProgress';

const CumulativeVotesPage = () => {
  const location = useLocation();
  const chartContainer = useRef(null);
  const [nextRoundProgress, setNextRoundProgress] = useState(0);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  const {
    votesData,
    voteRounds,
    participatingCounts,
    loading,
    error,
    charactersInfo,
    currentSeason,
    finalRanks
  } = useCumulativeVotesPageData({
    location,
    setCurrentRoundIndex,
    setNextRoundProgress
  });

  const { resetRoundProgress } = useRoundProgress({
    votesData,
    voteRounds,
    setNextRoundProgress
  });

  const handleRoundChange = useCallback((newIndex) => {
    setCurrentRoundIndex(newIndex);
    resetRoundProgress();
  }, [resetRoundProgress]);

  useEffect(() => {
    const container = document.createElement('div');
    container.className = 'cumulative-votes-chart-container';
    document.body.appendChild(container);
    chartContainer.current = container;

    return () => {
      document.body.removeChild(container);
    };
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">错误: {error}</div>;
  }

  if (!votesData || !voteRounds) {
    return <div className="error">数据无效，请返回首页重新加载</div>;
  }

  return createPortal(
    <>
      <div style={{ position: 'absolute', width: '100%', zIndex: 1 }}>
        <div className="chart-page-header">
          <h1>世萌{currentSeason}赛季 角色累计得票统计</h1>
        </div>
        <div className="progress-container">
          <div 
            className={`progress-bar ${
              nextRoundProgress >= 70 ? 'green' : 
              nextRoundProgress >= 30 ? 'yellow' : 
              'red'
            }`}
            style={{ width: `${nextRoundProgress}%` }}
          />
        </div>
      </div>
      <CumulativeVotesChart 
        data={votesData}
        voteRounds={voteRounds}
        participatingCounts={participatingCounts}
        currentSeason={currentSeason}
        charactersInfo={charactersInfo}
        finalRanks={finalRanks}
        currentRoundIndex={currentRoundIndex}
        onRoundChange={handleRoundChange}
      />
    </>,
    chartContainer.current
  );
};

export default CumulativeVotesPage;
