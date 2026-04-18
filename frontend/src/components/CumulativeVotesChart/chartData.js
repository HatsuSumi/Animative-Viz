import * as d3 from 'd3';
import globalChartConfig from '../../config/globalChartConfig.json';
import { formatNumber } from './chartUtils';

export function processChartData(data, voteRounds) {
  if (!data || !data.length || !voteRounds || voteRounds.length === 0) {
    return [];
  }

  const processedData = data.map(characterData => ({
    id: characterData.id,
    character: characterData.character,
    ip: characterData.ip,
    roundVotes: [],
    cumulativeVotes: []
  }));

  voteRounds.forEach(roundName => {
    data.forEach(characterData => {
      const processedItem = processedData.find(item => item.id === characterData.id);

      if (processedItem) {
        const currentRoundVotes = characterData.rounds[roundName];
        const prevCumulativeVote = processedItem.cumulativeVotes.length > 0
          ? processedItem.cumulativeVotes[processedItem.cumulativeVotes.length - 1]
          : 0;

        const roundVote = currentRoundVotes === null ? null : Math.round(currentRoundVotes);
        const newCumulativeVote = roundVote === null
          ? prevCumulativeVote
          : prevCumulativeVote + roundVote;

        processedItem.roundVotes.push(roundVote);
        processedItem.cumulativeVotes.push(newCumulativeVote);
      }
    });
  });

  return [...processedData].sort((a, b) => {
    const voteDiff = b.cumulativeVotes[b.cumulativeVotes.length - 1] - a.cumulativeVotes[a.cumulativeVotes.length - 1];
    if (voteDiff !== 0) return voteDiff;
    return a.character.localeCompare(b.character);
  });
}

export function buildRoundData({
  processedData,
  currentRoundIndex,
  participatingCounts,
  voteRounds,
  currentSeason,
  currentSeasonConfig,
  charactersInfo
}) {
  const allRoundData = processedData.map(item => {
    const currentRoundActualVote = item.roundVotes[currentRoundIndex];
    const cumulativeVotes = item.cumulativeVotes[currentRoundIndex];
    const eliminated = currentRoundActualVote === null && cumulativeVotes !== null;

    return {
      id: item.id,
      character: item.character,
      ip: item.ip,
      currentRoundVote: cumulativeVotes,
      currentRoundActualVote: currentRoundActualVote || 0,
      cumulativeVotes,
      eliminated
    };
  }).sort((a, b) => {
    const voteDiff = b.currentRoundVote - a.currentRoundVote;
    if (voteDiff !== 0) return voteDiff;
    return a.character.localeCompare(b.character);
  });

  const uniqueVotes = new Set();
  const topVotedChars = [];
  let i = 0;

  const sortedByActualVotes = [...allRoundData]
    .filter(d => d.currentRoundActualVote > 0)
    .sort((a, b) => {
      const voteDiff = b.currentRoundActualVote - a.currentRoundActualVote;
      if (voteDiff !== 0) return voteDiff;
      return a.character.localeCompare(b.character);
    });

  while (uniqueVotes.size < 5 && i < sortedByActualVotes.length) {
    const currentVotes = sortedByActualVotes[i].currentRoundActualVote;
    if (!uniqueVotes.has(currentVotes)) {
      uniqueVotes.add(currentVotes);
    }
    topVotedChars.push(sortedByActualVotes[i]);
    i++;
  }

  while (i < sortedByActualVotes.length && uniqueVotes.has(sortedByActualVotes[i].currentRoundActualVote)) {
    topVotedChars.push(sortedByActualVotes[i]);
    i++;
  }

  const displayData = allRoundData
    .slice(0, globalChartConfig.limits.maxDisplay)
    .map((item, index) => {
      const prevRoundData = currentRoundIndex > 0
        ? processedData.find(d => d.character === item.character)
        : null;
      const prevRoundVote = prevRoundData?.cumulativeVotes[currentRoundIndex - 1] || 0;

      let prevRoundDiff = 0;
      if (currentRoundIndex > 0 && index > 0) {
        const prevRoundVotes = processedData.map(d => ({
          character: d.character,
          vote: d.cumulativeVotes[currentRoundIndex - 1] || 0
        })).sort((a, b) => b.vote - a.vote);

        const prevRoundRank = prevRoundVotes.findIndex(d => d.character === item.character);
        if (prevRoundRank > 0) {
          const prevRoundLeaderVote = prevRoundVotes[prevRoundRank - 1].vote;
          prevRoundDiff = prevRoundLeaderVote - prevRoundVote;
        }
      }

      return {
        ...item,
        rank: index + 1,
        prevRoundVote,
        prevRoundDiff
      };
    });

  const totalVotes = d3.sum(allRoundData.map(d => d.currentRoundActualVote));
  const currentRound = voteRounds[currentRoundIndex];
  const participatingCount = participatingCounts[currentRound];

  const votes = allRoundData
    .filter(d => d.currentRoundActualVote > 0)
    .map(d => ({
      character: d.character,
      votes: d.currentRoundActualVote
    }));

  const sortedVotes = votes.map(d => d.votes).sort((a, b) => a - b);
  const hasEffectiveVotes = sortedVotes.length > 0;
  const midIndex = Math.floor(sortedVotes.length / 2);
  const medianVotes = hasEffectiveVotes
    ? (sortedVotes.length % 2 === 0
      ? (sortedVotes[midIndex - 1] + sortedVotes[midIndex]) / 2
      : sortedVotes[midIndex])
    : 0;
  const total = sortedVotes.reduce((a, b) => a + b, 0);
  const average = hasEffectiveVotes ? (total / sortedVotes.length).toFixed(2) : '0.00';

  const currentRoundConfig = currentSeasonConfig.rounds.find(round => round.name === currentRound);
  if (!currentRoundConfig) {
    console.error('缺少轮次配置:', {
      season: currentSeason,
      round: currentRound
    });
  }

  const effectiveCount = topVotedChars.length;
  const topVotes = sortedByActualVotes
    .slice(0, effectiveCount)
    .reduce((sum, d) => sum + d.currentRoundActualVote, 0);
  const startTime = currentRoundConfig?.startTime ?? '未知';
  const totalVoters = currentRoundConfig?.totalVoters ?? '未知';
  const percentage = totalVotes > 0
    ? ((topVotes / totalVotes) * 100).toFixed(2)
    : '0.00';

  const templateVars = {
    startTime,
    totalVotes: formatNumber(totalVotes),
    totalVoters: typeof totalVoters === 'number' ? formatNumber(totalVoters) : totalVoters,
    averageVotes: formatNumber(parseFloat(average)),
    medianVotes: formatNumber(parseFloat(medianVotes.toFixed(2))),
    percentage,
    actualParticipatingCount: participatingCount
  };

  const statsWithKeys = currentSeasonConfig.stats.flatMap(stat => {
    if (stat.type === 'top5-title') {
      const hasDuplicateVotes = uniqueVotes.size < topVotedChars.length;
      const displayNumber = Math.min(5, sortedByActualVotes.length);
      const suffix = hasDuplicateVotes ? '(含并列)' : '';
      const topNTitle = topVotedChars.length > 0 ? `得票数 Top${displayNumber}${suffix}：` : '';

      return [
        { ...stat, text: topNTitle, round: currentRoundIndex },
        ...topVotedChars.map((item, idx) => {
          const characterInfo = charactersInfo.find(info => info.id === item.id);
          const avatar = characterInfo?.avatar || '';
          return {
            id: `top5-${idx}`,
            type: 'top5-item',
            text: `${item.character}：${formatNumber(item.currentRoundActualVote)}`,
            avatar,
            round: currentRoundIndex
          };
        })
      ];
    }

    let text = stat.template.replace(/\{(\w+)\}/g, (match, key) => templateVars[key] || match);
    if (stat.id === 'top5-percentage') {
      const displayNumber = Math.min(5, sortedByActualVotes.length);
      text = text.replace(/前\d+名/, `前${displayNumber}名`);
    }

    return [{
      ...stat,
      text,
      round: currentRoundIndex
    }];
  });

  return {
    allRoundData,
    currentRound,
    displayData,
    sortedByActualVotes,
    statsWithKeys,
    topVotedChars
  };
}

