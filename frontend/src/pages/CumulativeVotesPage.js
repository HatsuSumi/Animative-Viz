import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getCharactersInfo, getCurrentSeason, getVotesByRounds } from '../services/api';
import CumulativeVotesChart from '../components/CumulativeVotesChart';
import '../styles/cumulative-votes-chart.css';
import { chartAnimation, countdownAnimation } from '../config/animationConfig';

const CumulativeVotesPage = () => {
  const location = useLocation();
  const state = location.state || {};
  const mountedRef = useRef(false);
  
  // 从路由状态中获取数据
  const [votesData, setVotesData] = useState(state.votesData);
  const [voteRounds, setVoteRounds] = useState(state.voteRounds);
  const [participatingCounts, setParticipatingCounts] = useState(state.participatingCounts);
  
  // 过滤选项
  const filterOptions = useMemo(() => ({
    excludedColumns: location.state?.filterOptions?.excludedColumns || [],
    excludeWildcard: location.state?.filterOptions?.excludeWildcard || false,
    excludeRanking: location.state?.filterOptions?.excludeRanking || false
  }), [location.state?.filterOptions]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [charactersInfo, setCharactersInfo] = useState([]);  
  const [nextRoundProgress, setNextRoundProgress] = useState(0);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [finalRanks, setFinalRanks] = useState(null);
  const chartContainer = useRef(null);
  const startTimeRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const lastUpdateRef = useRef(0);

  // 计算总动画时间
  const totalAnimationTime = useMemo(() => {
    
    return chartAnimation.duration + 
           (chartAnimation.delayFactor * (votesData.length - 1)) + 
           chartAnimation.bufferTime + 
           chartAnimation.roundDelay;
  }, [votesData]);

  // 更新进度的回调函数
  const handleRoundChange = useCallback((newIndex) => {
    setCurrentRoundIndex(newIndex);
    // 重置进度条
    startTimeRef.current = Date.now();
    lastUpdateRef.current = startTimeRef.current;
    setNextRoundProgress(100);
  }, []);

  // 处理倒计时进度
  useEffect(() => {
    if (!votesData || !voteRounds || totalAnimationTime === 0) {
      return;
    }
    
    startTimeRef.current = Date.now();
    lastUpdateRef.current = startTimeRef.current;
    setNextRoundProgress(100);
    
    const updateProgress = () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;
      const minUpdateInterval = 1000 / countdownAnimation.fps;
      
      // 限制更新频率
      if (timeSinceLastUpdate >= minUpdateInterval) {
        const elapsed = now - startTimeRef.current;
        const remaining = Math.max(0, (totalAnimationTime - elapsed) / totalAnimationTime * 100);
        setNextRoundProgress(remaining);
        lastUpdateRef.current = now;
      }
      
      // 继续动画
      animationFrameIdRef.current = requestAnimationFrame(updateProgress);
    };
    
    animationFrameIdRef.current = requestAnimationFrame(updateProgress);
    
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [votesData, voteRounds, totalAnimationTime]);

  // 获取数据
  useEffect(() => {
    // 防止重复挂载
    if (mountedRef.current) {
      return;
    }
    mountedRef.current = true;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 如果路由状态中没有数据，就重新获取
        let currentVotesData = location.state?.votesData;
        let currentVoteRounds = location.state?.voteRounds;
        let currentParticipatingCounts = location.state?.participatingCounts;

        if (!currentVotesData || !currentVoteRounds) {
          const votesResponse = await getVotesByRounds(filterOptions);
          console.log('【fetchAllData】后端返回的数据:', votesResponse);
          currentVotesData = votesResponse.votes_data;
          currentVoteRounds = votesResponse.vote_rounds;
          currentParticipatingCounts = votesResponse.participating_counts;
        }

        // 获取其他必要数据
        const [season, charactersResponse] = await Promise.all([
          getCurrentSeason(),
          getCharactersInfo()
        ]);

        // 从角色信息中提取排名
        const finalRanks = {};
        charactersResponse.forEach(({ character, rank }) => {
          if (rank) {
            finalRanks[character] = rank;
          }
        });

        // 一次性更新所有状态，避免多次渲染
        setCurrentSeason(season);
        setFinalRanks(finalRanks);
        setCharactersInfo(charactersResponse);
        setVotesData(currentVotesData);
        setVoteRounds(currentVoteRounds);
        setParticipatingCounts(currentParticipatingCounts || {});
        
        // 重置动画状态
        setNextRoundProgress(100);
        setCurrentRoundIndex(0);
        
        setLoading(false);
      } catch (error) {
        setError(error.message || '获取数据失败，请重试');
        setLoading(false);
      }
    };

    fetchAllData();
  }, []); // 移除所有依赖，只在组件首次挂载时执行

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
