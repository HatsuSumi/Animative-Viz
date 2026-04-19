import { useState, useEffect, useRef, useMemo } from 'react';
import { getCharactersInfo, getCurrentSeason, getSeasonConfig, getVotesByRounds } from '../../services/api';

export function useCumulativeVotesPageData({
  location,
  setCurrentRoundIndex,
  setNextRoundProgress
}) {
  const state = location.state || {};
  const mountedRef = useRef(false);

  const [votesData, setVotesData] = useState(state.votesData);
  const [voteRounds, setVoteRounds] = useState(state.voteRounds);
  const [participatingCounts, setParticipatingCounts] = useState(state.participatingCounts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [charactersInfo, setCharactersInfo] = useState([]);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [seasonContract, setSeasonContract] = useState(null);
  const [finalRanks, setFinalRanks] = useState(null);

  const filterOptions = useMemo(() => ({
    contextId: location.state?.filterOptions?.contextId || location.state?.contextId || null,
    excludedColumns: location.state?.filterOptions?.excludedColumns || [],
    excludeWildcard: location.state?.filterOptions?.excludeWildcard || false,
    excludeRanking: location.state?.filterOptions?.excludeRanking || false
  }), [location.state]);

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

        let currentVotesData = location.state?.votesData;
        let currentVoteRounds = location.state?.voteRounds;
        let currentParticipatingCounts = location.state?.participatingCounts;

        if (!currentVotesData || !currentVoteRounds) {
          const votesResponse = await getVotesByRounds(filterOptions);
          currentVotesData = votesResponse.votes_data;
          currentVoteRounds = votesResponse.vote_rounds;
          currentParticipatingCounts = votesResponse.participating_counts;
        }

        const season = await getCurrentSeason(filterOptions.contextId);

        const [seasonConfigResponse, charactersResponse] = await Promise.all([
          getSeasonConfig(filterOptions.contextId),
          getCharactersInfo(filterOptions.contextId)
        ]);

        if (seasonConfigResponse.season !== season) {
          throw new Error(`赛季配置与当前赛季不一致: ${seasonConfigResponse.season} !== ${season}`);
        }

        const resolvedFinalRanks = {};
        charactersResponse.forEach(({ id, rank }) => {
          if (id && rank) {
            resolvedFinalRanks[id] = rank;
          }
        });

        setCurrentSeason(season);
        setSeasonContract(seasonConfigResponse);
        setFinalRanks(resolvedFinalRanks);
        setCharactersInfo(charactersResponse);
        setVotesData(currentVotesData);
        setVoteRounds(currentVoteRounds);
        setParticipatingCounts(currentParticipatingCounts || {});
        setNextRoundProgress(100);
        setCurrentRoundIndex(0);
        setLoading(false);
      } catch (fetchError) {
        setError(fetchError.message || '获取数据失败，请重试');
        setLoading(false);
      }
    };

    fetchAllData();
  }, [filterOptions, hasContextId, location.state, setCurrentRoundIndex, setNextRoundProgress]);

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

