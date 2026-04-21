import * as d3 from 'd3';
import globalChartConfig from '../../config/globalChartConfig.json';
import { formatNumber } from './chartUtils';

function requireRoundVoteValue(value, character, roundName) {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`角色 ${character} 在轮次 ${roundName} 的票数无效`);
  }

  return Math.round(value);
}

function requireCumulativeVoteValue(value, character, roundIndex) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`角色 ${character} 在第 ${roundIndex + 1} 轮的累计票数无效`);
  }

  return value;
}

export function processChartData(data, voteRounds) {
  if (!data || !data.length || !voteRounds || voteRounds.length === 0) {
    return [];
  }

  return data.map(characterData => {
    const roundVotes = [];
    const cumulativeVotes = [];
    let cumulativeVote = 0;

    voteRounds.forEach(roundName => {
      if (!Object.prototype.hasOwnProperty.call(characterData.rounds, roundName)) {
        throw new Error(`角色 ${characterData.character} 缺少轮次数据: ${roundName}`);
      }

      const roundVote = requireRoundVoteValue(characterData.rounds[roundName], characterData.character, roundName);
      if (roundVote !== null) {
        cumulativeVote += roundVote;
      }

      roundVotes.push(roundVote);
      cumulativeVotes.push(cumulativeVote);
    });

    return {
      id: characterData.id,
      character: characterData.character,
      ip: characterData.ip,
      roundVotes,
      cumulativeVotes
    };
  }).sort((a, b) => {
    const voteDiff = b.cumulativeVotes[b.cumulativeVotes.length - 1] - a.cumulativeVotes[a.cumulativeVotes.length - 1];
    if (voteDiff !== 0) return voteDiff;
    return a.character.localeCompare(b.character);
  });
}

export function buildRoundSnapshots({
  processedData,
  participatingCounts,
  voteRounds,
  currentSeason,
  currentSeasonConfig,
  roundConfigsByName,
  charactersInfo
}) {
  return voteRounds.map((_, currentRoundIndex) => buildRoundData({
    processedData,
    currentRoundIndex,
    participatingCounts,
    voteRounds,
    currentSeason,
    currentSeasonConfig,
    roundConfigsByName,
    charactersInfo
  }));
}

export function buildRoundData({
  processedData,
  currentRoundIndex,
  participatingCounts,
  voteRounds,
  currentSeason,
  currentSeasonConfig,
  roundConfigsByName,
  charactersInfo
}) {
  const processedDataById = new Map(processedData.map(item => [item.id, item]));
  const charactersInfoById = new Map(charactersInfo.map(info => [info.id, info]));

  const allRoundData = processedData.map(item => {
    const currentRoundActualVote = item.roundVotes[currentRoundIndex];
    const cumulativeVotes = requireCumulativeVoteValue(
      item.cumulativeVotes[currentRoundIndex],
      item.character,
      currentRoundIndex
    );
    const eliminated = currentRoundActualVote === null;

    return {
      id: item.id,
      character: item.character,
      ip: item.ip,
      currentRoundVote: cumulativeVotes,
      currentRoundActualVote: currentRoundActualVote === null ? 0 : currentRoundActualVote,
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

  const prevRoundVotes = currentRoundIndex > 0
    ? processedData.map(d => ({
      id: d.id,
      vote: requireCumulativeVoteValue(d.cumulativeVotes[currentRoundIndex - 1], d.character, currentRoundIndex - 1)
    })).sort((a, b) => b.vote - a.vote)
    : [];
  const prevRoundRanksById = new Map(prevRoundVotes.map((item, index) => [item.id, index]));

  const displayData = allRoundData
    .slice(0, globalChartConfig.limits.maxDisplay)
    .map((item, index) => {
      const prevRoundData = currentRoundIndex > 0
        ? processedDataById.get(item.id)
        : null;
      const prevRoundVote = currentRoundIndex > 0
        ? requireCumulativeVoteValue(
          prevRoundData?.cumulativeVotes[currentRoundIndex - 1],
          item.character,
          currentRoundIndex - 1
        )
        : 0;

      let prevRoundDiff = 0;
      if (currentRoundIndex > 0 && index > 0) {
        const prevRoundRank = prevRoundRanksById.get(item.id) ?? -1;
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

  const currentRoundConfig = roundConfigsByName.get(currentRound);
  if (!currentRoundConfig) {
    throw new Error(`缺少轮次配置: ${currentSeason} / ${currentRound}`);
  }

  const effectiveCount = topVotedChars.length;
  const topVotes = sortedByActualVotes
    .slice(0, effectiveCount)
    .reduce((sum, d) => sum + d.currentRoundActualVote, 0);
  const startTime = currentRoundConfig.startTime;
  const totalVoters = currentRoundConfig.totalVoters;
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
          const characterInfo = charactersInfoById.get(item.id);
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

    let text = stat.template.replace(/\{(\w+)\}/g, (match, key) => {
      if (!Object.prototype.hasOwnProperty.call(templateVars, key)) {
        throw new Error(`统计模板变量缺失: ${key}`);
      }

      const value = templateVars[key];
      return value === undefined || value === null ? match : value;
    });
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

