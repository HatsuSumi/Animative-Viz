import { useState, useEffect, useRef, useMemo } from 'react';
import { getCumulativeVotesPageData } from '../../services/api';

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

        const pageData = await getCumulativeVotesPageData(filterOptions);
        const votesResponse = pageData.votes_by_rounds;

        setCurrentSeason(pageData.season);
        setSeasonContract(pageData.season_config);
        setFinalRanks(pageData.final_ranks);
        setCharactersInfo(pageData.characters_info);
        setVotesData(votesResponse.votes_data);
        setVoteRounds(votesResponse.vote_rounds);
        setParticipatingCounts(votesResponse.participating_counts || {});
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

