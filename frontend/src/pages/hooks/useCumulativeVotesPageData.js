import { useState, useEffect, useRef, useMemo } from 'react';
import { getCharactersInfo, getCurrentSeason, getVotesByRounds } from '../../services/api';

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
  const [finalRanks, setFinalRanks] = useState(null);

  const filterOptions = useMemo(() => ({
    excludedColumns: location.state?.filterOptions?.excludedColumns || [],
    excludeWildcard: location.state?.filterOptions?.excludeWildcard || false,
    excludeRanking: location.state?.filterOptions?.excludeRanking || false
  }), [location.state?.filterOptions]);

  useEffect(() => {
    if (mountedRef.current) {
      return;
    }
    mountedRef.current = true;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        let currentVotesData = location.state?.votesData;
        let currentVoteRounds = location.state?.voteRounds;
        let currentParticipatingCounts = location.state?.participatingCounts;

        if (!currentVotesData || !currentVoteRounds) {
          const votesResponse = await getVotesByRounds(filterOptions);
          currentVotesData = votesResponse.votes_data;
          currentVoteRounds = votesResponse.vote_rounds;
          currentParticipatingCounts = votesResponse.participating_counts;
        }

        const [season, charactersResponse] = await Promise.all([
          getCurrentSeason(),
          getCharactersInfo()
        ]);

        const resolvedFinalRanks = {};
        charactersResponse.forEach(({ id, character, rank }) => {
          const rankKey = id || character;
          if (rank && rankKey) {
            resolvedFinalRanks[rankKey] = rank;
          }
        });

        setCurrentSeason(season);
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
  }, [filterOptions, location.state, setCurrentRoundIndex, setNextRoundProgress]);

  return {
    votesData,
    voteRounds,
    participatingCounts,
    loading,
    error,
    charactersInfo,
    currentSeason,
    finalRanks
  };
}

