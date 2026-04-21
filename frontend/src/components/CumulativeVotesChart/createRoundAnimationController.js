import * as d3 from 'd3';
import globalChartConfig from '../../config/globalChartConfig.json';
import { chartAnimation } from '../../config/animationConfig';
import { buildRoundSnapshots } from './chartData';
import { getStageColor } from './chartUtils';
import { renderRoundFrame } from './chartRenderer';

export function createRoundAnimationController({
  processedData,
  svgRef,
  voteRounds,
  currentRoundIndex,
  participatingCounts,
  currentSeason,
  currentSeasonConfig,
  roundConfigsByName,
  charactersInfo,
  finalRanks,
  animationConfig,
  seasonMilestones,
  getCharacterColor,
  getChartTextY,
  handleAnimationComplete,
  setCurrentMilestone,
  animationTimeoutsRef,
  precomputedRounds
}) {
  const margin = globalChartConfig.layout.margin;
  const containerWidth = svgRef.current.parentElement.clientWidth;
  const containerHeight = svgRef.current.parentElement.clientHeight;
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  const svgSelection = d3.select(svgRef.current)
    .attr('width', containerWidth)
    .attr('height', containerHeight);

  let svg = svgSelection.select('g.chart-root');
  if (svg.empty()) {
    svg = svgSelection
      .append('g')
      .attr('class', 'chart-root');
  }

  svg.attr('transform', `translate(${margin.left},${margin.top})`);

  const rounds = precomputedRounds || buildRoundSnapshots({
    processedData,
    participatingCounts,
    voteRounds,
    currentSeason,
    currentSeasonConfig,
    roundConfigsByName,
    charactersInfo
  });

  return {
    processedData,
    svg,
    width,
    height,
    margin,
    animationConfig,
    voteRounds,
    currentRoundIndex,
    currentRound: voteRounds[currentRoundIndex],
    previousMaxVote: 0,

    nextRound() {
      const {
        displayData,
        statsWithKeys
      } = rounds[this.currentRoundIndex];

      const currentRoundName = this.voteRounds[this.currentRoundIndex];
      const currentColor = getStageColor(currentRoundName, currentSeasonConfig);
      const currentMaxVote = d3.max(displayData, d => d.currentRoundVote) * 1.1;

      renderRoundFrame({
        svg: this.svg,
        displayData,
        statsWithKeys,
        currentRoundName,
        currentRoundIndex: this.currentRoundIndex,
        width: this.width,
        height: this.height,
        margin: this.margin,
        animationConfig: this.animationConfig,
        currentSeasonConfig,
        currentColor,
        getCharacterColor,
        getChartTextY,
        finalRanks,
        finalRankConfig: globalChartConfig.finalRank,
        trendConfig: globalChartConfig.trend,
        previousMaxVote: this.previousMaxVote
      });

      this.previousMaxVote = currentMaxVote;

      if (this.currentRoundIndex >= this.voteRounds.length - 1) {
        return false;
      }

      this.currentRoundIndex++;
      this.currentRound = this.voteRounds[this.currentRoundIndex];
      return true;
    },

    start() {
      const animate = () => {
        const maxDelay = (this.processedData.length - 1) * this.animationConfig.delayFactor;
        const totalAnimationTime = this.animationConfig.duration + maxDelay + this.animationConfig.bufferTime + this.animationConfig.roundDelay;

        const currentRound = this.voteRounds[this.currentRoundIndex];
        const milestones = seasonMilestones[currentRound] || [];

        if (milestones.length > 0) {
          const newMilestones = milestones.map(milestone => ({
            ...milestone,
            id: `${currentRound}-${milestone.character}-${Date.now()}`,
            totalAnimationTime,
            isLastRound: chartAnimation.isLastRound(this.currentRoundIndex, this.voteRounds.length)
          }));

          setCurrentMilestone(newMilestones);

          if (!chartAnimation.isLastRound(this.currentRoundIndex, this.voteRounds.length)) {
            const milestoneTimeoutId = setTimeout(() => {
              setCurrentMilestone(null);
            }, totalAnimationTime);
            animationTimeoutsRef.current.push(milestoneTimeoutId);
          }
        }

        const hasNextRound = this.nextRound();
        if (hasNextRound) {
          handleAnimationComplete(this.currentRoundIndex);

          const animateTimeoutId = setTimeout(animate, totalAnimationTime);
          animationTimeoutsRef.current.push(animateTimeoutId);
        }
      };

      animate();
    }
  };
}

