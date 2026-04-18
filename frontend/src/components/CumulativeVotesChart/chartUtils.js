export function buildCharacterColors(data, currentSeasonConfig) {
  if (!data) return new Map();

  const colorMap = new Map();
  const safeColors = currentSeasonConfig.colors.safe;
  const defaultColor = currentSeasonConfig.colors.default;

  data.forEach(({ character }) => {
    if (!character) {
      colorMap.set(character, defaultColor);
      return;
    }

    const hash = character.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const index = Math.abs(hash) % safeColors.length;
    colorMap.set(character, safeColors[index]);
  });

  return colorMap;
}

export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function getStageColor(roundName, currentSeasonConfig) {
  if (!roundName) {
    return '#333';
  }

  const { stageColors } = currentSeasonConfig;
  const stage = stageColors.find(item => new RegExp(item.pattern).test(roundName));
  return stage ? stage.color : '#333';
}

export function getTextY(index, type, height, currentSeasonConfig) {
  const { text } = currentSeasonConfig.layout;
  const { lineHeight, baseY } = text;
  const basePosition = height - baseY;
  let totalOffset = index * lineHeight;

  if (type === 'title') return basePosition;

  totalOffset += text.spacing?.afterTitle ?? 0;
  totalOffset += type === 'top5-title' ? text.spacing?.beforeTop5 ?? 0 : 0;
  totalOffset += type === 'top5-item' ? text.spacing?.afterTop5Title ?? 0 : 0;
  totalOffset += type === 'remaining' ? text.spacing?.beforeRemaining ?? 0 : 0;
  totalOffset += type === 'dark-horse' ? text.spacing?.beforeDarkHorse ?? 0 : 0;

  return basePosition + totalOffset;
}

export function getFinalRankSuffix(finalRank) {
  if (finalRank === 1) return 'st';
  if (finalRank === 2) return 'nd';
  if (finalRank === 3) return 'rd';
  return 'th';
}

export function getVoteLabelText({ character, vote, finalRank }) {
  if (!character) {
    return '';
  }

  if (!finalRank || finalRank > 16) {
    return `${character}：${formatNumber(vote)}`;
  }

  return `${character}(${finalRank}${getFinalRankSuffix(finalRank)})：${formatNumber(vote)}`;
}

export function getVoteLabelColor(finalRank, finalRankConfig) {
  if (!finalRank || finalRank > 16) {
    return null;
  }

  if (finalRank <= 3) {
    return finalRankConfig[`top${finalRank}`];
  }

  return finalRankConfig.other;
}

export function getPrevRankVotes(displayData, rank) {
  return displayData.find(item => item.rank === rank - 1)?.currentRoundVote;
}

export function getTrendDiff(prevRankVotes, currentRoundVote) {
  return Math.round(prevRankVotes - currentRoundVote);
}

export function getTrendColor(diff, trendConfig) {
  return diff === 0 ? trendConfig.equal : trendConfig.down;
}

export function getTrendText(diff) {
  if (Math.round(diff) === 0) {
    return ' =0';
  }

  return ` ↓${formatNumber(Math.round(diff))}`;
}

