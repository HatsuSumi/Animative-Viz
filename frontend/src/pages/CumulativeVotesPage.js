import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import CumulativeVotesChart from '../components/CumulativeVotesChart';
import AppStatusCard from '../components/AppStatusCard';
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
    seasonContract,
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
    return (
      <div className="app-status-shell chart-status-shell">
        <AppStatusCard
          tone="loading"
          eyebrow="页面初始化中"
          title="正在加载累计票数数据"
          description="正在同步赛季配置、角色信息与票数数据，请稍候。"
          homeHref={null}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-status-shell chart-status-shell">
        <AppStatusCard
          tone="error"
          eyebrow="加载失败"
          title="累计票数页面暂时无法打开"
          description={error}
        />
      </div>
    );
  }

  if (!votesData || !voteRounds) {
    return (
      <div className="app-status-shell chart-status-shell">
        <AppStatusCard
          tone="error"
          eyebrow="数据不可用"
          title="缺少图表所需数据"
          description="当前上下文里的累计票数数据不完整，请返回首页重新导入文件。"
        />
      </div>
    );
  }

  return createPortal(
    <>
      <div style={{ position: 'absolute', width: '100%', zIndex: 1 }}>
        <div className="chart-page-header">
          <h1>世萌{currentSeason}赛季 恒星女子组累计得票统计</h1>
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
        seasonContract={seasonContract}
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
