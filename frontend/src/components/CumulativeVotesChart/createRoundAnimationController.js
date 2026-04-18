import * as d3 from 'd3';
import globalChartConfig from '../../config/globalChartConfig.json';
import { chartAnimation } from '../../config/animationConfig';
import { buildRoundData } from './chartData';
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
  charactersInfo,
  finalRanks,
  animationConfig,
  seasonMilestones,
  getCharacterColor,
  getChartTextY,
  handleAnimationComplete,
  setCurrentMilestone,
  animationTimeoutsRef
}) {
  const margin = globalChartConfig.layout.margin;
  const containerWidth = svgRef.current.parentElement.clientWidth;
  const containerHeight = svgRef.current.parentElement.clientHeight;
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  d3.select(svgRef.current).selectAll('*').remove();

  const svg = d3.select(svgRef.current)
    .attr('width', containerWidth)
    .attr('height', containerHeight)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

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

    nextRound() {
      const {
        displayData,
        statsWithKeys
      } = buildRoundData({
        processedData: this.processedData,
        currentRoundIndex: this.currentRoundIndex,
        participatingCounts,
        voteRounds: this.voteRounds,
        currentSeason,
        currentSeasonConfig,
        charactersInfo
      });

      const currentRoundName = this.voteRounds[this.currentRoundIndex];
      const currentColor = getStageColor(currentRoundName, currentSeasonConfig);

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
        trendConfig: globalChartConfig.trend
      });

      if (this.currentRoundIndex >= this.voteRounds.length - 1) {
        return false;
      }

      this.currentRoundIndex++;
      this.currentRound = this.voteRounds[this.currentRoundIndex];
      return true;
    },

    start() {
      const animate = () => {
        try {
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
        } catch (error) {
          console.error('动画执行时发生错误:', error);
        }
      };

      animate();
    }
  };
}

