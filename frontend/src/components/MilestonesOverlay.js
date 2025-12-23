import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import '../styles/milestones-overlay.css';
import { milestoneAnimation } from '../config/animationConfig';

const MilestonesOverlay = ({ currentMilestone, currentSeasonConfig }) => {
  const milestones = currentMilestone || [];
  const [currentGroup, setCurrentGroup] = useState(0);
  const timerRef = useRef([]);
  const nodeRefs = useRef(new Map());
  const heightsRef = useRef(new Map());
  const isTransitioning = useRef(false);

  // 获取或创建 ref
  const getOrCreateRef = (id) => {
    if (!nodeRefs.current.has(id)) {
      nodeRefs.current.set(id, React.createRef());
    }
    return nodeRefs.current.get(id);
  };

  // 计算当前组的里程碑
  const currentMilestones = useMemo(() => {
    if (!milestones) return [];
    
    // 按组分割里程碑
    const groups = [];
    const maxVisiblePerGroup = currentSeasonConfig.layout.milestone.maxVisiblePerGroup;
    for (let i = 0; i < milestones.length; i += maxVisiblePerGroup) {
      groups.push(milestones.slice(i, i + maxVisiblePerGroup));
    }
    
    // 返回当前组的里程碑，并添加index
    return (groups[currentGroup] || []).map((milestone, index) => ({
      ...milestone,
      index
    }));
  }, [milestones, currentGroup, currentSeasonConfig]);

  // 清除所有定时器
  const clearAllTimers = () => {
    timerRef.current.forEach(timer => clearTimeout(timer));
    timerRef.current = [];
  };

  // 清理函数
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // 当收到新里程碑时，重置分组并设置定时器
  useEffect(() => {
    clearAllTimers();
    setCurrentGroup(0);
    isTransitioning.current = false;

    // 1. 计算总组数
    const maxVisiblePerGroup = currentSeasonConfig.layout.milestone.maxVisiblePerGroup;
    const totalGroups = Math.ceil(milestones.length / maxVisiblePerGroup);

    // 2. 如果有多个组，设置定时器依次切换
    if (totalGroups > 1 && milestones[0]?.totalAnimationTime) {
      const switchTime = milestones[0].totalAnimationTime / totalGroups;
      
      // 为每个组切换设置定时器
      for (let i = 1; i < totalGroups; i++) {
        const timer = setTimeout(() => {
          // 如果上一次切换还没完成，延迟这次切换
          if (isTransitioning.current) {
            return;
          }
          
          isTransitioning.current = true;
          // 等待所有退出动画完成后再切换组
          setTimeout(() => {
            setCurrentGroup(i);
            // 切换组时重置高度缓存
            heightsRef.current.clear();
            isTransitioning.current = false;
          }, milestoneAnimation.exitDuration);
        }, switchTime * i);
        timerRef.current.push(timer);
      }
    }
  }, [milestones, currentSeasonConfig]);

  // 更新高度缓存
  const updateHeight = useCallback((id, height) => {
    if (height && height !== heightsRef.current.get(id)) {
      heightsRef.current.set(id, height);
    }
  }, []);

  // 计算位置
  const calculatePosition = useCallback((index) => {
    const margin = currentSeasonConfig.layout.milestone.margin || 20;
    let totalHeight = 0;

    // 计算前面所有里程碑的累积高度
    for (let i = 0; i < index; i++) {
      const prevMilestone = currentMilestones[i];
      const prevHeight = heightsRef.current.get(prevMilestone.id) || 0;
      totalHeight += prevHeight + margin;
    }

    return totalHeight;
  }, [currentMilestones, currentSeasonConfig]);

  return (
    <div className="milestones-container">
      <TransitionGroup>
        {currentMilestones.map((milestone) => {
          const ref = getOrCreateRef(milestone.id);
          const position = calculatePosition(milestone.index);

          return (
            <CSSTransition
              key={milestone.id}
              nodeRef={ref}
              timeout={{
                enter: milestoneAnimation.enterDuration,
                exit: milestone.isLastRound ? 0 : milestoneAnimation.exitDuration
              }}
              classNames="milestone"
              appear={true}
              onEnter={() => {
                if (ref.current) {
                  updateHeight(milestone.id, ref.current.offsetHeight);
                }
              }}
            >
              <div 
                ref={ref}
                className="milestone-item"
                style={{
                  '--enter-duration': `${milestoneAnimation.enterDuration}ms`,
                  '--exit-duration': `${milestoneAnimation.exitDuration}ms`,
                  '--y-offset': `${position}px`,
                  '--delay': `${milestone.index * milestoneAnimation.delayBetween}ms`
                }}
              >
                <div className="milestone-title">{milestone.character}</div>
                <div className="milestone-description">{milestone.text}</div>
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>
    </div>
  );
};

export default MilestonesOverlay;
