import * as d3 from 'd3';
import globalChartConfig from '../../config/globalChartConfig.json';
import { getPrevRankVotes, getTrendColor, getTrendDiff, getTrendText, getVoteLabelColor, getVoteLabelText } from './chartUtils';

export function renderAxes({
  svg,
  displayData,
  width,
  height,
  margin,
  currentSeasonConfig
}) {
  svg.selectAll('.y-axis-label').remove();
  svg.append('text')
    .attr('class', 'y-axis-label axis-label')
    .attr('y', currentSeasonConfig.layout.axis.label.offsetY)
    .attr('x', 0 - margin.left + currentSeasonConfig.layout.axis.label.offsetX)
    .style('text-anchor', 'middle')
    .style('font-size', globalChartConfig.style.axis.fontSize)
    .style('font-weight', globalChartConfig.style.axis.fontWeight)
    .style('fill', globalChartConfig.style.axis.color)
    .text(globalChartConfig.labels.yAxis);

  svg.selectAll('.x-axis-label').remove();
  svg.append('text')
    .attr('class', 'x-axis-label axis-label')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom)
    .style('text-anchor', 'middle')
    .style('font-size', globalChartConfig.style.axis.fontSize)
    .style('font-weight', globalChartConfig.style.axis.fontWeight)
    .style('fill', globalChartConfig.style.axis.color)
    .text(globalChartConfig.labels.xAxis);

  const x = d3.scaleLinear()
    .domain([0, d3.max(displayData, d => d.currentRoundVote) * 1.1])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(displayData.map(d => d.rank.toString()))
    .range([0, height])
    .padding(0.5);

  svg.selectAll('.y-axis').remove();
  svg.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y).tickSize(0));

  svg.selectAll('.x-axis').remove();
  const xAxis = svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`);

  let prevMaxVote = 0;
  const prevAxisElement = svg.select('.x-axis');
  if (!prevAxisElement.empty()) {
    const prevTicks = prevAxisElement.selectAll('.tick text');
    if (!prevTicks.empty()) {
      const lastTickText = prevTicks.nodes()[prevTicks.size() - 1];
      prevMaxVote = parseFloat(lastTickText.textContent) || 0;
    }
  }

  const currentMaxVote = d3.max(displayData, d => d.currentRoundVote) * 1.1;

  xAxis.call(
    d3.axisBottom(x)
      .tickFormat(d3.format('.0f'))
  )
  .call(g => {
    g.transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .tween('axis', () => {
        const interpolateMax = d3.interpolateNumber(prevMaxVote, currentMaxVote);
        return t => {
          const currentMax = interpolateMax(t);
          const currentX = d3.scaleLinear()
            .domain([0, currentMax])
            .range([0, width]);
          g.call(
            d3.axisBottom(currentX)
              .tickFormat(d3.format('.0f'))
          );
        };
      });
  });

  return { x, y };
}

export function renderBars({
  svg,
  displayData,
  x,
  y,
  animationConfig,
  getCharacterColor
}) {
  const bars = svg.selectAll('.bar')
    .data(displayData, d => d.character);

  const updateBars = selection => {
    selection
      .transition()
      .duration(animationConfig.duration)
      .ease(animationConfig.easing)
      .delay(d => (displayData.length - d.rank) * animationConfig.delayFactor)
      .attr('y', d => y(d.rank.toString()))
      .attr('width', d => x(d.currentRoundVote))
      .style('opacity', 1);
  };

  bars.exit()
    .transition()
    .duration(animationConfig.duration)
    .ease(animationConfig.easing)
    .attr('width', 0)
    .style('opacity', 0)
    .on('end', function() {
      d3.select(this).remove();
    });

  const barEnter = bars.enter()
    .append('rect')
    .attr('class', 'bar gpu-accelerated')
    .attr('x', 0)
    .attr('y', d => y(d.rank.toString()))
    .attr('height', y.bandwidth())
    .attr('width', 0)
    .style('opacity', 0)
    .attr('fill', d => {
      const colors = getCharacterColor(d.character);
      return colors.light;
    });

  bars.merge(barEnter).call(updateBars);
}

export function renderLabels({
  svg,
  displayData,
  x,
  y,
  animationConfig,
  finalRanks,
  finalRankConfig,
  trendConfig
}) {
  const labels = svg.selectAll('.bar-label')
    .data(displayData, d => d.character);

  const updateLabels = selection => {
    const duration = animationConfig.duration;
    const easing = animationConfig.easing;
    const delayFactor = animationConfig.delayFactor;

    selection
      .transition()
      .duration(duration)
      .ease(easing)
      .delay((d, i) => (displayData.length - d.rank) * delayFactor)
      .attr('y', d => y(d.rank.toString()) + y.bandwidth() / 2)
      .attr('x', d => x(d.currentRoundVote) + 5)
      .style('opacity', 1);

    selection.each(function(d) {
      const label = d3.select(this);

      let voteTspan = label.select('.vote-tspan');
      let trendTspan = label.select('.trend-tspan');

      if (voteTspan.empty()) {
        voteTspan = label.append('tspan')
          .attr('class', 'vote-tspan');
      }

      const finalRank = finalRanks?.[d.id] ?? finalRanks?.[d.character];
      const currentVote = d.currentRoundVote;
      const startVote = d.prevRoundVote || 0;

      voteTspan
        .text(() => getVoteLabelText({
          character: d.character,
          vote: startVote,
          finalRank
        }))
        .style('fill', getVoteLabelColor(finalRank, finalRankConfig))
        .transition()
        .duration(duration)
        .ease(easing)
        .delay((d, i) => (displayData.length - d.rank) * delayFactor)
        .tween('text', function(d) {
          const interpolate = d3.interpolateNumber(startVote, currentVote);
          return function(t) {
            this.textContent = getVoteLabelText({
              character: d.character,
              vote: Math.round(interpolate(t)),
              finalRank
            });
          };
        });

      const prevRankVotes = getPrevRankVotes(displayData, d.rank);
      if (prevRankVotes && d.rank > 1) {
        const diff = getTrendDiff(prevRankVotes, d.currentRoundVote);

        if (trendTspan.empty()) {
          trendTspan = label.append('tspan')
            .attr('class', 'trend-tspan');
        }

        trendTspan
          .style('fill', getTrendColor(diff, trendConfig))
          .text(d => getTrendText(d.prevRoundDiff || 0))
          .transition()
          .duration(duration)
          .ease(easing)
          .delay((_, i) => (displayData.length - d.rank) * delayFactor)
          .tween('text', function(d) {
            const startDiff = d.prevRoundDiff || 0;
            const endDiff = diff;
            const interpolate = d3.interpolateNumber(startDiff, endDiff);
            return function(t) {
              this.textContent = getTrendText(interpolate(t));
            };
          });
      } else if (!trendTspan.empty()) {
        trendTspan.remove();
      }
    });
  };

  labels.exit()
    .transition()
    .duration(animationConfig.duration)
    .ease(animationConfig.easing)
    .style('opacity', 0)
    .on('end', function() {
      d3.select(this).remove();
    });

  const labelEnter = labels.enter()
    .append('text')
    .attr('class', 'bar-label')
    .attr('x', 0)
    .attr('y', d => y(d.rank.toString()) + y.bandwidth() / 2)
    .attr('dy', '.35em')
    .style('opacity', 0);

  labels.merge(labelEnter).call(updateLabels);
}

export function renderStatsText({
  svg,
  statsWithKeys,
  width,
  height,
  animationConfig,
  currentSeasonConfig,
  currentColor,
  getChartTextY
}) {
  const keyFunction = d => `${d.id}-${d.round}`;
  const textLines = svg.selectAll('.stats-text')
    .data(statsWithKeys, keyFunction);

  const exitTransition = textLines.exit()
    .selectAll('text, image')
    .transition()
    .duration(animationConfig.duration)
    .attr('x', d => ['top5-title', 'title'].includes(d.type)
      ? width + currentSeasonConfig.layout.text.baseX.text
      : -currentSeasonConfig.layout.text.baseX.text)
    .style('opacity', 0);

  exitTransition.end().then(() => {
    try {
      textLines.exit().remove();

      const textEnter = textLines.enter()
        .append('g')
        .attr('class', 'stats-text');

      textEnter.filter(d => d.type === 'top5-item' && d.avatar)
        .append('image')
        .attr('x', d => ['top5-title', 'title'].includes(d.type)
          ? -currentSeasonConfig.layout.text.baseX.text
          : width + currentSeasonConfig.layout.text.baseX.text)
        .attr('y', d => getChartTextY(d.id.split('-')[1], d.type, height) + currentSeasonConfig.layout.text.avatar.offsetY)
        .attr('width', currentSeasonConfig.layout.text.avatar.width)
        .attr('height', currentSeasonConfig.layout.text.avatar.height)
        .attr('xlink:href', d => d.avatar)
        .style('opacity', 0);

      textEnter
        .append('text')
        .attr('x', d => ['top5-title', 'title'].includes(d.type)
          ? -currentSeasonConfig.layout.text.baseX.text
          : width + currentSeasonConfig.layout.text.baseX.text)
        .attr('y', (d, i) => getChartTextY(i, d.type, height))
        .attr('text-anchor', 'start')
        .style('font-size', globalChartConfig.style.fontSize)
        .style('font-weight', globalChartConfig.style.fontWeight)
        .style('fill', currentColor)
        .style('opacity', 0)
        .text(d => d.text);

      textEnter.selectAll('text')
        .transition()
        .duration(animationConfig.duration)
        .attr('x', width - currentSeasonConfig.layout.text.baseX.text)
        .style('opacity', 1);

      textEnter.selectAll('image')
        .transition()
        .duration(animationConfig.duration)
        .attr('x', width - currentSeasonConfig.layout.text.baseX.icon)
        .style('opacity', 1);

      textLines.select('text')
        .transition()
        .duration(animationConfig.duration)
        .attr('x', d => ['top5-title', 'title'].includes(d.type)
          ? width + currentSeasonConfig.layout.text.baseX.text
          : -currentSeasonConfig.layout.text.baseX.text)
        .style('opacity', 0)
        .text(d => d.text);

      textLines.select('image')
        .transition()
        .duration(animationConfig.duration)
        .attr('x', d => ['top5-title', 'title'].includes(d.type)
          ? width + currentSeasonConfig.layout.text.baseX.text
          : -currentSeasonConfig.layout.text.baseX.text)
        .style('opacity', 0);
    } catch (error) {
      console.error('处理文本动画时发生错误:', error);
    }
  }).catch(error => {
    console.error('退出动画过渡时发生错误:', error);
  });
}

export function renderRoundTitle({
  svg,
  currentRoundName,
  currentRoundIndex,
  width,
  height,
  animationConfig,
  currentSeasonConfig,
  currentColor,
  getChartTextY
}) {
  const roundNameText = svg.selectAll('.round-name-text')
    .data([{
      text: currentRoundName,
      round: currentRoundIndex
    }], d => `title-${d.round}`);

  const titleExitTransition = roundNameText.exit()
    .transition()
    .duration(animationConfig.duration)
    .attr('x', width + currentSeasonConfig.layout.text.baseX.text)
    .style('opacity', 0);

  titleExitTransition.end().then(() => {
    try {
      roundNameText.exit().remove();

      const roundNameEnter = roundNameText.enter()
        .append('text')
        .attr('class', 'round-name-text round-detail-text')
        .attr('x', -currentSeasonConfig.layout.text.baseX.text)
        .attr('y', getChartTextY(0, 'title', height))
        .attr('text-anchor', 'start')
        .style('font-size', globalChartConfig.style.fontSize)
        .style('font-weight', globalChartConfig.style.fontWeight)
        .style('fill', currentColor)
        .style('opacity', 0)
        .text(d => d.text);

      roundNameEnter
        .transition()
        .duration(animationConfig.duration)
        .attr('x', width - currentSeasonConfig.layout.text.baseX.text)
        .style('opacity', 1);

      roundNameText
        .transition()
        .duration(animationConfig.duration)
        .attr('x', width - currentSeasonConfig.layout.text.baseX.text)
        .style('opacity', 1)
        .text(d => d.text);
    } catch (error) {
      console.error('处理轮次名称动画时发生错误:', error);
    }
  }).catch(error => {
    console.error('退出轮次名称动画时发生错误:', error);
  });
}

export function renderRoundFrame({
  svg,
  displayData,
  statsWithKeys,
  currentRoundName,
  currentRoundIndex,
  width,
  height,
  margin,
  animationConfig,
  currentSeasonConfig,
  currentColor,
  getCharacterColor,
  getChartTextY,
  finalRanks,
  finalRankConfig,
  trendConfig
}) {
  renderStatsText({
    svg,
    statsWithKeys,
    width,
    height,
    animationConfig,
    currentSeasonConfig,
    currentColor,
    getChartTextY
  });

  renderRoundTitle({
    svg,
    currentRoundName,
    currentRoundIndex,
    width,
    height,
    animationConfig,
    currentSeasonConfig,
    currentColor,
    getChartTextY
  });

  const { x, y } = renderAxes({
    svg,
    displayData,
    width,
    height,
    margin,
    currentSeasonConfig
  });

  renderBars({
    svg,
    displayData,
    x,
    y,
    animationConfig,
    getCharacterColor
  });

  renderLabels({
    svg,
    displayData,
    x,
    y,
    animationConfig,
    finalRanks,
    finalRankConfig,
    trendConfig
  });
}

