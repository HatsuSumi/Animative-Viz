import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import * as d3 from 'd3';
import PropTypes from 'prop-types';  
import '../styles/cumulative-votes-chart.css';
import globalChartConfig from '../config/globalChartConfig.json';
import seasonsConfig from '../config/seasonsConfig.json';
import { chartAnimation, milestoneAnimation } from '../config/animationConfig';
import MilestonesOverlay from './MilestonesOverlay';

const CumulativeVotesChart = ({
  data, 
  voteRounds,
  participatingCounts,
  currentSeason,
  charactersInfo,
  finalRanks,
  currentRoundIndex,
  onRoundChange
}) => {

  const svgRef = useRef(null);
  const [processedData, setProcessedData] = useState([]);
  const [animationKey, setAnimationKey] = useState(0);
  const [prevRanks, setPrevRanks] = useState(new Map());
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [isChartDrawn, setIsChartDrawn] = useState(false);

  // 获取当前赛季的里程碑数据
  const seasonMilestones = useMemo(() => {
    return seasonsConfig.seasons[currentSeason]?.milestones || {};
  }, [currentSeason]);

  // 处理图表数据并计算累积票数
  const processChartData = (data, voteRounds) => {
    // 如果数据或轮次为空，返回空数组
    if (!data || !data.length || !voteRounds || voteRounds.length === 0) {
      return [];
    }

    // 初始化累积票数，使用全部角色
    const processedData = data.map(characterData => ({
      character: characterData.character,  
      ip: characterData.series,  
      roundVotes: [],
      cumulativeVotes: []
    }));

    // 处理每一轮
    voteRounds.forEach((roundName, roundIndex) => {
      data.forEach(characterData => {
        // 找到对应角色的数据项
        const processedItem = processedData.find(
          item => item.character === characterData.character
        );
        

        if (processedItem) {
          // 获取该轮的票数
          const currentRoundVotes = characterData.rounds[roundName];

          // 获取上一轮的累积票数
          const prevCumulativeVote = processedItem.cumulativeVotes.length > 0 
            ? processedItem.cumulativeVotes[processedItem.cumulativeVotes.length - 1] 
            : 0;

          // 当前轮次的票数和新的累计票数
          const roundVote = currentRoundVotes === null ? null : Math.round(currentRoundVotes);
          const newCumulativeVote = roundVote === null 
            ? prevCumulativeVote 
            : prevCumulativeVote + roundVote;

          // 更新数据
          processedItem.roundVotes.push(roundVote);
          processedItem.cumulativeVotes.push(newCumulativeVote);
        }
      });
    });

    // 对数据按票数降序排序，相同票数按角色名称排序
    const sortedData = [...processedData].sort((a, b) => {
      // 首先按票数降序
      const voteDiff = b.cumulativeVotes[b.cumulativeVotes.length - 1] - a.cumulativeVotes[a.cumulativeVotes.length - 1];
      if (voteDiff !== 0) return voteDiff;
      // 票数相同时按角色名称字母顺序
      return a.character.localeCompare(b.character);
    });

    return sortedData;
  };

  // 缓存当前赛季的配置
  const currentSeasonConfig = useMemo(() => 
    seasonsConfig.seasons[currentSeason] || {},
    [currentSeason]
  );

  // 生成角色的颜色映射
  const characterColors = useMemo(() => {
    if (!data) return new Map();
    
    const colorMap = new Map();
    const safeColors = currentSeasonConfig.colors.safe;
    const defaultColor = currentSeasonConfig.colors.default;
    
    data.forEach(({ character }) => {
      if (!character) {
        colorMap.set(character, defaultColor);
        return;
      }
      
      // 使用字符串的 hashCode 来确定颜色索引
      const hash = character.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      
      const index = Math.abs(hash) % safeColors.length;
      colorMap.set(character, safeColors[index]);
    });
    
    return colorMap;
  }, [data, currentSeasonConfig.colors]);

  // 获取角色颜色的函数
  const getCharacterColor = (character) => {
    return characterColors.get(character) || currentSeasonConfig.colors.default;
  };

  // 缓存动画配置
  const animationConfig = useMemo(() => ({
    duration: chartAnimation.duration,
    delayFactor: chartAnimation.delayFactor,
    easing: d3[chartAnimation.easing],
    bufferTime: chartAnimation.bufferTime,
    roundDelay: chartAnimation.roundDelay
  }), []);

  // 计算每行的垂直位置
  const getTextY = (index, type, height) => {
    const { text } = currentSeasonConfig.layout;
    const { lineHeight, baseY } = text;
    const basePosition = height - baseY;  
    let totalOffset = index * lineHeight; 

    // 计算需要添加的额外间距
    if (type === 'title') return basePosition;  

    // 其他文本的额外间距
    totalOffset += text.spacing?.afterTitle ?? 0;
    totalOffset += type === 'top5-title' ? text.spacing?.beforeTop5 ?? 0 : 0;
    totalOffset += type === 'top5-item' ? text.spacing?.afterTop5Title ?? 0 : 0;
    totalOffset += type === 'remaining' ? text.spacing?.beforeRemaining ?? 0 : 0;
    totalOffset += type === 'dark-horse' ? text.spacing?.beforeDarkHorse ?? 0 : 0;

    return basePosition + totalOffset;
  };

  // 处理动画完成
  const handleAnimationComplete = useCallback(() => {
    if (!chartAnimation.isLastRound(currentRoundIndex, voteRounds?.length || 0)) {
      onRoundChange(currentRoundIndex + 1);
    }
  }, [currentRoundIndex, voteRounds, onRoundChange]);

  // 在数据变化时处理数据
  useEffect(() => {
    const processed = processChartData(data, voteRounds);
    setProcessedData(processed);
    // 触发动画重新渲染
    setAnimationKey(prev => prev + 1);
  }, [data, voteRounds]);

  // 绘制图表的主函数
  const drawChart = useCallback(() => {
    // 防止重复绘制
    if (isChartDrawn) return;
    setIsChartDrawn(true);

    if (!svgRef.current || processedData.length === 0) return;

    const margin = globalChartConfig.layout.margin;
    const containerWidth = svgRef.current.parentElement.clientWidth;
    const containerHeight = svgRef.current.parentElement.clientHeight;

    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // 清空之前的SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 动画控制器
    const animationController = {
      processedData: processedData,
      svg: svg,
      width: width,
      height: height,
      margin: margin,
      animationConfig: animationConfig,
      voteRounds: voteRounds,
      currentRoundIndex: currentRoundIndex,
      currentRound: voteRounds[currentRoundIndex],

      nextRound() {
      
        // 准备完整数据用于统计
        const allRoundData = this.processedData.map(item => {
          // 获取当前轮次的实际票数和累计票数
          const currentRoundActualVote = item.roundVotes[this.currentRoundIndex];
          const cumulativeVotes = item.cumulativeVotes[this.currentRoundIndex];

          // 判断是否被淘汰：如果当前轮次票数为null，但累计票数存在，说明是被淘汰了
          const eliminated = currentRoundActualVote === null && cumulativeVotes !== null;

          return {
            character: item.character,
            ip: item.ip, 
            currentRoundVote: cumulativeVotes,  // 累计票数
            currentRoundActualVote: currentRoundActualVote || 0,  // 当前轮次实际票数
            cumulativeVotes: cumulativeVotes,  // 添加累计票数字段用于日志
            eliminated  // 添加淘汰状态
          };
        })
        .sort((a, b) => {
          // 柱状图按累计票数排序
          const voteDiff = b.currentRoundVote - a.currentRoundVote;
          if (voteDiff !== 0) return voteDiff;
          return a.character.localeCompare(b.character);
        });

        // 获取有效票数的角色（用于Top5显示）
        const uniqueVotes = new Set();
        const topVotedChars = [];
        let i = 0;
        
        // 首先按当轮实际票数重新排序用于Top5显示，并过滤掉得票数为0的角色
        const sortedByActualVotes = [...allRoundData]
          .filter(d => d.currentRoundActualVote > 0) 
          .sort((a, b) => {
            const voteDiff = b.currentRoundActualVote - a.currentRoundActualVote;
            if (voteDiff !== 0) return voteDiff;
            return a.character.localeCompare(b.character);
          });

        // 添加所有有效票数的角色，直到达到5个不同票数或没有更多角色
        while (uniqueVotes.size < 5 && i < sortedByActualVotes.length) {
          const currentVotes = sortedByActualVotes[i].currentRoundActualVote;
          if (!uniqueVotes.has(currentVotes)) {
            uniqueVotes.add(currentVotes);
          }
          topVotedChars.push(sortedByActualVotes[i]);
          i++;
        }
        
        // 继续添加所有与已选角色票数相同的角色
        while (i < sortedByActualVotes.length && uniqueVotes.has(sortedByActualVotes[i].currentRoundActualVote)) {
          topVotedChars.push(sortedByActualVotes[i]);
          i++;
        }

        // 准备用于显示的前50名数据（用于柱状图，使用累计票数排序的数据）
        const displayData = allRoundData
          .slice(0, globalChartConfig.limits.maxDisplay)  
          .map((item, index) => {
            // 找到上一轮的排名和差距
            const prevRoundData = this.currentRoundIndex > 0 ? 
              this.processedData.find(d => d.character === item.character) : null;
            const prevRoundVote = prevRoundData?.cumulativeVotes[this.currentRoundIndex - 1] || 0;
            
            // 计算上一轮与前一名的差距
            let prevRoundDiff = 0;
            if (this.currentRoundIndex > 0 && index > 0) {
              // 获取上一轮所有角色的票数
              const prevRoundVotes = this.processedData.map(d => ({
                character: d.character,
                vote: d.cumulativeVotes[this.currentRoundIndex - 1] || 0
              })).sort((a, b) => b.vote - a.vote);

              // 找到当前角色在上一轮的排名
              const prevRoundRank = prevRoundVotes.findIndex(d => d.character === item.character);
              
              // 如果找到了排名，且不是第一名，就计算与前一名的差距
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

        // 使用所有数据计算统计信息
        const totalVotes = d3.sum(allRoundData.map(d => d.currentRoundActualVote));
        
        // 使用 participatingCounts 来获取当前轮次的参赛人数
        const currentRound = this.voteRounds[this.currentRoundIndex];
        const participatingCount = participatingCounts[currentRound];
        
        // 计算中位数票数
        const votes = allRoundData
          .filter(d => d.currentRoundActualVote > 0)  
          .map(d => ({
            character: d.character,
            votes: d.currentRoundActualVote
          }));

        const sortedVotes = votes.map(d => d.votes).sort((a, b) => a - b);
        
        const midIndex = Math.floor(sortedVotes.length / 2);
        const medianVotes = sortedVotes.length % 2 === 0
          ? (sortedVotes[midIndex - 1] + sortedVotes[midIndex]) / 2
          : sortedVotes[midIndex];

        const total = sortedVotes.reduce((a, b) => a + b, 0);
        const average = (total / sortedVotes.length).toFixed(2);

        // 格式化数字，添加千位分隔符
        const formatNumber = (num) => {
          return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };

        // 根据轮次确定颜色
        const getStageColor = (roundName) => {
          if (!roundName) {
            return '#333'; 
          }
          
          const { stageColors } = currentSeasonConfig;
          
          // 找到匹配的阶段
          const stage = stageColors.find(stage => new RegExp(stage.pattern).test(roundName));
          return stage ? stage.color : '#333';
        };

        // 获取当前轮次的配置信息
        const currentRoundConfig = currentSeasonConfig.rounds.find(round => round.name === currentRound);
        
        // 准备模板变量
        const effectiveCount = topVotedChars.length;

        const templateVars = {
          startTime: currentRoundConfig.startTime,
          totalVotes: formatNumber(totalVotes),
          totalVoters: formatNumber(currentRoundConfig.totalVoters),
          averageVotes: formatNumber(parseFloat(average)),
          medianVotes: formatNumber(parseFloat(medianVotes.toFixed(2))),
          percentage: ((sortedByActualVotes.slice(0, effectiveCount).reduce((sum, d) => sum + d.currentRoundActualVote, 0) / totalVotes) * 100).toFixed(2),
          actualParticipatingCount: participatingCount 
        };

        // 使用配置的统计信息模板
        const statsWithKeys = currentSeasonConfig.stats
          .flatMap(stat => {
            if (stat.type === 'top5-title') {
              // 检查是否有相同票数
              const hasDuplicateVotes = uniqueVotes.size < topVotedChars.length;
              // 如果总参与人数小于5，就显示实际人数，否则显示5
              const displayNumber = Math.min(5, sortedByActualVotes.length);
              const suffix = hasDuplicateVotes ? '(含并列)' : '';
              const topNTitle = topVotedChars.length > 0 ? `得票数 Top${displayNumber}${suffix}：` : '';
              
              // Top5 标题后面跟着具体的数据
              return [
                { ...stat, text: topNTitle, round: this.currentRoundIndex },
                ...topVotedChars.map((item, idx) => {
                  const characterInfo = charactersInfo.find(info => info.character === item.character);
                  const avatar = characterInfo?.avatar || '';
                  return {
                    id: `top5-${idx}`,
                    type: 'top5-item',
                    text: `${item.character}：${formatNumber(item.currentRoundActualVote)}`,
                    avatar,
                    round: this.currentRoundIndex
                  };
                })
              ];
            }
            
            // 替换模板中的变量，同时调整文本
            let text = stat.template.replace(/\{(\w+)\}/g, (match, key) => templateVars[key] || match);
            if (stat.id === 'top5-percentage') {
              // 如果总参与人数小于5，就显示实际人数，否则显示5
              const displayNumber = Math.min(5, sortedByActualVotes.length);
              text = text.replace(/前\d+名/, `前${displayNumber}名`);
            }
            return [{
              ...stat,
              text,
              round: this.currentRoundIndex
            }];
          });

        // 然后处理常规统计信息
        const keyFunction = d => `${d.id}-${d.round}`;  
        const textLines = this.svg.selectAll('.stats-text')
          .data(statsWithKeys, keyFunction);

        // 处理退出的文本
        const exitTransition = textLines.exit()
          .selectAll('text, image') 
          .transition()
          .duration(this.animationConfig.duration)
          .attr('x', d => ['top5-title', 'title'].includes(d.type) ? 
            this.width + currentSeasonConfig.layout.text.baseX.text : 
            -currentSeasonConfig.layout.text.baseX.text) 
          .style('opacity', 0);

        exitTransition.end().then(() => {
          try {
            // 移除旧元素
            textLines.exit().remove();

            // 处理新增的文本
            const textEnter = textLines.enter()
              .append('g') 
              .attr('class', 'stats-text');  

            // 添加头像
            textEnter.filter(d => d.type === 'top5-item' && d.avatar)
              .append('image')
              .attr('x', d => ['top5-title', 'title'].includes(d.type) ? 
                -currentSeasonConfig.layout.text.baseX.text : 
                this.width + currentSeasonConfig.layout.text.baseX.text)  
              .attr('y', d => getTextY(d.id.split('-')[1], d.type, this.height) + currentSeasonConfig.layout.text.avatar.offsetY) 
              .attr('width', currentSeasonConfig.layout.text.avatar.width)
              .attr('height', currentSeasonConfig.layout.text.avatar.height)
              .attr('xlink:href', d => d.avatar)
              .style('opacity', 0);

            // 添加文本
            textEnter
              .append('text')
              .attr('x', d => ['top5-title', 'title'].includes(d.type) ? 
                -currentSeasonConfig.layout.text.baseX.text : 
                this.width + currentSeasonConfig.layout.text.baseX.text) 
              .attr('y', (d, i) => getTextY(i, d.type, this.height))
              .attr('text-anchor', 'start')
              .style('font-size', globalChartConfig.style.fontSize)
              .style('font-weight', globalChartConfig.style.fontWeight)
              .style('fill', currentColor)
              .style('opacity', 0)
              .text(d => d.text);

            // 新元素的进入动画
            textEnter.selectAll('text')
              .transition()
              .duration(this.animationConfig.duration)
              .attr('x', this.width - currentSeasonConfig.layout.text.baseX.text)
              .style('opacity', 1);

            textEnter.selectAll('image')
              .transition()
              .duration(this.animationConfig.duration)
              .attr('x', this.width - currentSeasonConfig.layout.text.baseX.icon)
              .style('opacity', 1);

            // 更新现有元素
            textLines.select('text') 
              .transition()
              .duration(this.animationConfig.duration)
              .attr('x', d => ['top5-title', 'title'].includes(d.type) ? 
                this.width + currentSeasonConfig.layout.text.baseX.text : 
                -currentSeasonConfig.layout.text.baseX.text) 
              .style('opacity', 0)
              .text(d => d.text);

            textLines.select('image')  
              .transition()
              .duration(this.animationConfig.duration)
              .attr('x', d => ['top5-title', 'title'].includes(d.type) ? 
                this.width + currentSeasonConfig.layout.text.baseX.text : 
                -currentSeasonConfig.layout.text.baseX.text)  
              .style('opacity', 0);
          } catch (error) {
            console.error('处理文本动画时发生错误:', error);
          }
        }).catch(error => {
          console.error('退出动画过渡时发生错误:', error);
        });

        const currentRoundName = this.voteRounds[this.currentRoundIndex];
        
        // 获取当前轮次的颜色
        const currentColor = getStageColor(currentRoundName);
        
        const roundNameText = this.svg.selectAll('.round-name-text')
          .data([{
            text: currentRoundName,
            round: this.currentRoundIndex
          }], d => `title-${d.round}`);  

        // 处理退出的轮次名称
        const titleExitTransition = roundNameText.exit()
          .transition()
          .duration(this.animationConfig.duration)
          .attr('x', this.width + currentSeasonConfig.layout.text.baseX.text) 
          .style('opacity', 0);

        titleExitTransition.end().then(() => {
          try {
            roundNameText.exit().remove();

            // 处理新增的轮次名称
            const roundNameEnter = roundNameText.enter()
              .append('text')
              .attr('class', 'round-name-text round-detail-text')
              .attr('x', -currentSeasonConfig.layout.text.baseX.text)
              .attr('y', getTextY(0, 'title', this.height))
              .attr('text-anchor', 'start')
              .style('font-size', globalChartConfig.style.fontSize)
              .style('font-weight', globalChartConfig.style.fontWeight)
              .style('fill', currentColor)
              .style('opacity', 0)
              .text(d => d.text);

            // 新标题的进入动画
            roundNameEnter
              .transition()
              .duration(this.animationConfig.duration)
              .attr('x', this.width - currentSeasonConfig.layout.text.baseX.text)
              .style('opacity', 1);

            // 更新现有标题
            roundNameText
              .transition()
              .duration(this.animationConfig.duration)
              .attr('x', this.width - currentSeasonConfig.layout.text.baseX.text)
              .style('opacity', 1)
              .text(d => d.text);
          } catch (error) {
            console.error('处理轮次名称动画时发生错误:', error);
          }
        }).catch(error => {
          console.error('退出轮次名称动画时发生错误:', error);
        });

        // Y轴标签（名次）
        this.svg.selectAll('.y-axis-label').remove();
        this.svg.append("text")
          .attr("class", "y-axis-label axis-label")
          .attr("y", currentSeasonConfig.layout.axis.label.offsetY)
          .attr("x", 0 - this.margin.left + currentSeasonConfig.layout.axis.label.offsetX)
          .style("text-anchor", "middle")
          .style('font-size', globalChartConfig.style.axis.fontSize)
          .style('font-weight', globalChartConfig.style.axis.fontWeight)
          .style('fill', globalChartConfig.style.axis.color)
          .text(globalChartConfig.labels.yAxis);

        // X轴标签
        this.svg.selectAll('.x-axis-label').remove();
        this.svg.append("text")
          .attr("class", "x-axis-label axis-label")
          .attr("x", this.width / 2)
          .attr("y", this.height + this.margin.bottom)
          .style("text-anchor", "middle")
          .style('font-size', globalChartConfig.style.axis.fontSize)
          .style('font-weight', globalChartConfig.style.axis.fontWeight)
          .style('fill', globalChartConfig.style.axis.color)
          .text(globalChartConfig.labels.xAxis);

        // X 轴比例尺
        const x = d3.scaleLinear()
          .domain([0, d3.max(displayData, d => d.currentRoundVote) * 1.1])
          .range([0, this.width]);

        // Y 轴比例尺
        const y = d3.scaleBand()
          .domain(displayData.map(d => d.rank.toString()))
          .range([0, this.height])
          .padding(0.5);

        // 更新 Y 轴
        this.svg.selectAll('.y-axis').remove();
        this.svg.append("g")
          .attr("class", "y-axis")
          .call(d3.axisLeft(y).tickSize(0));

        // 更新 X 轴
        this.svg.selectAll('.x-axis').remove();
        const xAxis = this.svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${this.height})`);

        // 获取上一个 X 轴的最大值（如果存在）
        let prevMaxVote = 0;
        const prevAxisElement = this.svg.select('.x-axis');
        if (!prevAxisElement.empty()) {
          const prevTicks = prevAxisElement.selectAll('.tick text');
          if (!prevTicks.empty()) {
            const lastTickText = prevTicks.nodes()[prevTicks.size() - 1];
            prevMaxVote = parseFloat(lastTickText.textContent) || 0;
          }
        }

        // 当前最大值
        const currentMaxVote = d3.max(displayData, d => d.currentRoundVote) * 1.1;

        // 动画更新 X 轴
        xAxis.call(
          d3.axisBottom(x)
            .tickFormat(d3.format(".0f"))
        )
        .call(g => {
          g.transition()
            .duration(500)
            .ease(d3.easeCubicOut)
            .tween('axis', () => {
              const interpolateMax = d3.interpolateNumber(prevMaxVote, currentMaxVote);
              return (t) => {
                const currentMax = interpolateMax(t);
                const currentX = d3.scaleLinear()
                  .domain([0, currentMax])
                  .range([0, this.width]);
                g.call(
                  d3.axisBottom(currentX)
                    .tickFormat(d3.format(".0f"))
                );
              };
            });
        });

        const bars = this.svg.selectAll('.bar')
          .data(displayData, d => d.character);

        // 创建动画组
        const updateBars = (selection) => {
          selection
            .transition()
            .duration(this.animationConfig.duration)
            .ease(this.animationConfig.easing)
            .delay((d, i) => (displayData.length - d.rank) * this.animationConfig.delayFactor)  
            .attr('y', d => y(d.rank.toString()))
            .attr('width', d => x(d.currentRoundVote))
            .style('opacity', 1);
        };

        // 同时处理退出、进入和更新的柱子
        bars.exit()
          .transition()
          .duration(this.animationConfig.duration)
          .ease(this.animationConfig.easing)
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

        // 同时更新所有柱子
        bars.merge(barEnter).call(updateBars);

        const labels = this.svg.selectAll('.bar-label')
          .data(displayData, d => d.character);

        // 创建标签动画组
        const updateLabels = (selection) => {
          // 更新位置和内容
          const duration = this.animationConfig.duration;
          const easing = this.animationConfig.easing;
          const delayFactor = this.animationConfig.delayFactor;
          
          selection
            .transition()
            .duration(duration)
            .ease(easing)
            .delay((d, i) => (displayData.length - d.rank) * delayFactor) 
            .attr('y', d => y(d.rank.toString()) + y.bandwidth() / 2)
            .attr('x', d => x(d.currentRoundVote) + 5)
            .style('opacity', 1);

          // 添加新的文本内容
          selection.each(function(d) {
            const label = d3.select(this);
            
            // 确保每个标签只有一个投票数和一个趋势
            let voteTspan = label.select('.vote-tspan');
            let trendTspan = label.select('.trend-tspan');
            
            // 如果不存在则创建
            if (voteTspan.empty()) {
              voteTspan = label.append('tspan')
                .attr('class', 'vote-tspan');
            }
            
            const finalRank = finalRanks?.[d.character];
            const currentVote = d.currentRoundVote;
            const startVote = d.prevRoundVote || 0;
            
            if (!finalRank || finalRank > 16) {
              voteTspan
                .text(d => d.character ? `${d.character}：${formatNumber(startVote)}` : '')
                .style('fill', null)
                .transition()
                .duration(duration)
                .ease(easing)
                .delay((d, i) => (displayData.length - d.rank) * delayFactor)
                .tween('text', function(d) {
                  const interpolate = d3.interpolateNumber(startVote, currentVote);
                  return function(t) {
                    this.textContent = `${d.character}：${formatNumber(Math.round(interpolate(t)))}`;
                  };
                });
            } else {
              // 使用序数后缀
              const suffix = finalRank === 1 ? 'st' : 
                            finalRank === 2 ? 'nd' : 
                            finalRank === 3 ? 'rd' : 
                            'th';
              voteTspan
                .text(d => d.character ? `${d.character}(${finalRank}${suffix})：${formatNumber(startVote)}` : '')
                .style('fill', d => finalRank <= 3 
                  ? globalChartConfig.finalRank[`top${finalRank}`] 
                  : globalChartConfig.finalRank.other
                )
                .transition()
                .duration(duration)
                .ease(easing)
                .delay((d, i) => (displayData.length - d.rank) * delayFactor)
                .tween('text', function(d) {
                  const interpolate = d3.interpolateNumber(startVote, currentVote);
                  return function(t) {
                    this.textContent = `${d.character}(${finalRank}${suffix})：${formatNumber(Math.round(interpolate(t)))}`;
                  };
                });
            }
            
            // 找到前一名的票数并添加趋势
            const prevRankVotes = displayData.find(item => item.rank === d.rank - 1)?.currentRoundVote; 
            if (prevRankVotes && d.rank > 1) {
              const diff = Math.round(prevRankVotes - d.currentRoundVote);
              
              // 如果不存在则创建趋势标签
              if (trendTspan.empty()) {
                trendTspan = label.append('tspan')
                  .attr('class', 'trend-tspan');
              }
              
              // 根据排名变化设置颜色（diff === 0 表示并列）
              trendTspan
                .style('fill', diff === 0 ? globalChartConfig.trend.equal : globalChartConfig.trend.down)
                .text(function(d) {
                  const prevDiff = Math.round(d.prevRoundDiff || 0);
                  if (prevDiff === 0) {
                    return ' =0';
                  } else {
                    return ` ↓${formatNumber(prevDiff)}`;
                  }
                })
                .transition()
                .duration(duration)
                .ease(easing)
                .delay((_, i) => (displayData.length - d.rank) * delayFactor)
                .tween('text', function(d) {
                  const startDiff = Math.round(d.prevRoundDiff || 0);
                  const endDiff = Math.round(diff);
                  const interpolate = d3.interpolateNumber(startDiff, endDiff);
                  return function(t) {
                    const currentDiff = Math.round(interpolate(t));
                    if (currentDiff === 0) {
                      this.textContent = ' =0';
                    } else {
                      this.textContent = ` ↓${formatNumber(Math.round(currentDiff))}`;
                    }
                  };
                });
            } else if (!trendTspan.empty()) {
              // 如果不需要趋势标签，移除它
              trendTspan.remove();
            }
          });
        };

        // 同时处理退出、进入和更新的标签
        labels.exit()
          .transition()
          .duration(this.animationConfig.duration)
          .ease(this.animationConfig.easing)
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

        // 同时更新所有标签
        labels.merge(labelEnter).call(updateLabels);

        // 更新排名记录
        setPrevRanks(new Map(displayData.map(d => [d.character, d.rank])));

        // 先检查是否已经是最后一轮
        if (this.currentRoundIndex >= this.voteRounds.length - 1) {
          return false;
        }

        // 推进到下一轮
        this.currentRoundIndex++;
        this.currentRound = this.voteRounds[this.currentRoundIndex];
        return true;
      },

      start() {
        const animate = () => {
          try {
            // 计算最大延迟时间
            const maxDelay = (this.processedData.length - 1) * this.animationConfig.delayFactor;
            
            // 总动画时间 = 单个动画持续时间 + 最大延迟 + 额外缓冲 + 轮次间隔
            const totalAnimationTime = this.animationConfig.duration + maxDelay + this.animationConfig.bufferTime + this.animationConfig.roundDelay;
            
            // 先更新里程碑，再进入下一轮
            const currentRound = this.voteRounds[this.currentRoundIndex];
            const milestones = seasonMilestones[currentRound] || [];
            
            if (milestones.length > 0) {
              const totalAnimationTime = this.animationConfig.duration + maxDelay + this.animationConfig.bufferTime + this.animationConfig.roundDelay;
              
              // 给所有里程碑添加动画相关的属性
              const newMilestones = milestones.map(milestone => ({
                ...milestone,
                id: `${currentRound}-${milestone.character}-${Date.now()}`,
                totalAnimationTime,
                isLastRound: chartAnimation.isLastRound(this.currentRoundIndex, this.voteRounds.length)
              }));

              // 直接设置新的里程碑，不要设置 null
              setCurrentMilestone(newMilestones);

              // 只在不是最后一轮时清除里程碑
              if (!chartAnimation.isLastRound(this.currentRoundIndex, this.voteRounds.length)) {
                setTimeout(() => {
                  setCurrentMilestone(null);
                }, totalAnimationTime);
              }
            }

            const hasNextRound = this.nextRound();
            if (hasNextRound) {
              // 通知父组件这一轮结束了
              handleAnimationComplete();

              // 在动画完全结束后触发下一轮
              setTimeout(animate, totalAnimationTime);
            }
          } catch (error) {
            console.error('动画执行时发生错误:', error);
          }
        };
        animate();
      }
    };

    // 启动动画
    animationController.start();
  }, [processedData, animationKey]);

  // 使用 useEffect 管理动画生命周期
  useEffect(() => {
    if (processedData && processedData.length > 0) {
      // 清除之前的标记
      setIsChartDrawn(false);
      // 重新绘制图表
      drawChart();
    }
  }, [processedData, animationKey, drawChart]);

  return (
    <>
      <svg ref={svgRef}></svg>
      {createPortal(
        <MilestonesOverlay 
          currentMilestone={currentMilestone} 
          currentSeasonConfig={currentSeasonConfig}
        />,
        document.body
      )}
    </>
  );
};

CumulativeVotesChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  voteRounds: PropTypes.arrayOf(PropTypes.string).isRequired,
  participatingCounts: PropTypes.objectOf(PropTypes.number).isRequired,
  currentSeason: PropTypes.string.isRequired,
  charactersInfo: PropTypes.arrayOf(PropTypes.shape({
    character: PropTypes.string.isRequired,
    avatar: PropTypes.string
  })).isRequired,
  finalRanks: PropTypes.object,
  currentRoundIndex: PropTypes.number.isRequired,
  onRoundChange: PropTypes.func.isRequired
};

export default CumulativeVotesChart;
