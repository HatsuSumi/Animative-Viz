import { useState, useEffect, useRef, useMemo } from 'react';
import { getCumulativeVotesPageData } from '../../services/api';

function requireLocationState(locationState) {
  if (!locationState || typeof locationState !== 'object') {
    throw new Error('缺少页面初始化参数，请返回首页重新导入文件');
  }

  return locationState;
}

function requireVotesByRoundsResponse(votesResponse) {
  if (!votesResponse || typeof votesResponse !== 'object') {
    throw new Error('累计票数数据缺失');
  }

  if (!Array.isArray(votesResponse.votes_data)) {
    throw new Error('累计票数数据缺少 votes_data');
  }

  if (!Array.isArray(votesResponse.vote_rounds)) {
    throw new Error('累计票数数据缺少 vote_rounds');
  }

  if (!votesResponse.participating_counts || typeof votesResponse.participating_counts !== 'object' || Array.isArray(votesResponse.participating_counts)) {
    throw new Error('累计票数数据缺少 participating_counts');
  }

  return votesResponse;
}

export function useCumulativeVotesPageData({
  location,
  setCurrentRoundIndex,
  setNextRoundProgress
}) {
  const locationState = useMemo(() => requireLocationState(location.state), [location.state]);
  const mountedRef = useRef(false);

  const [votesData, setVotesData] = useState(locationState.votesData);
  const [voteRounds, setVoteRounds] = useState(locationState.voteRounds);
  const [participatingCounts, setParticipatingCounts] = useState(locationState.participatingCounts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [charactersInfo, setCharactersInfo] = useState([]);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [seasonContract, setSeasonContract] = useState(null);
  const [finalRanks, setFinalRanks] = useState(null);

  const filterOptions = useMemo(() => ({
    contextId: locationState.filterOptions?.contextId || locationState.contextId || null,
    excludedColumns: locationState.filterOptions?.excludedColumns || [],
    excludeWildcard: locationState.filterOptions?.excludeWildcard || false,
    excludeRanking: locationState.filterOptions?.excludeRanking || false
  }), [locationState]);

  const hasContextId = Boolean(filterOptions.contextId);

  useEffect(() => {
    if (mountedRef.current) {
      return;
    }
    mountedRef.current = true;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!hasContextId) {
          throw new Error('缺少数据上下文，请返回首页重新上传文件');
        }

        const pageData = await getCumulativeVotesPageData(filterOptions);
        const votesResponse = requireVotesByRoundsResponse(pageData.votes_by_rounds);

        setCurrentSeason(pageData.season);
        setSeasonContract(pageData.season_config);
        setFinalRanks(pageData.final_ranks);
        setCharactersInfo(pageData.characters_info);
        setVotesData(votesResponse.votes_data);
        setVoteRounds(votesResponse.vote_rounds);
        setParticipatingCounts(votesResponse.participating_counts);
        setNextRoundProgress(100);
        setCurrentRoundIndex(0);
        setLoading(false);
      } catch (fetchError) {
        setError(fetchError.message || '获取数据失败，请重试');
        setLoading(false);
      }
    };

    fetchAllData();
  }, [filterOptions, hasContextId, setCurrentRoundIndex, setNextRoundProgress]);

  return {
    votesData,
    voteRounds,
    participatingCounts,
    loading,
    error,
    charactersInfo,
    currentSeason,
    seasonContract,
    finalRanks
  };
}

