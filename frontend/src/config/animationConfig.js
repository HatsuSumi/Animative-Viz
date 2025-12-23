/**
 * 图表动画配置
 */

/**
 * 单个动画的持续时间（毫秒）
 */
export const ANIMATION_DURATION = 500;

/**
 * 每个条目开始动画的延迟时间（毫秒）
 */
export const DELAY_FACTOR = 50;

/**
 * 额外的缓冲时间（毫秒）
 */
export const BUFFER_TIME = 200;

/**
 * 每个投票轮次之间的间隔时间（毫秒）
 */
export const ROUND_DELAY = 5000;

/**
 * D3.js 缓动函数名称
 */
export const EASING = 'easeCubicOut';

/**
 * 判断当前是否是最后一轮
 * @param {number} currentRoundIndex - 当前轮次索引
 * @param {number} totalRounds - 总轮次数
 * @returns {boolean} 是否是最后一轮
 */
export const isLastRound = (currentRoundIndex, totalRounds) => 
  currentRoundIndex >= totalRounds - 1;

/**
 * 倒计时动画配置
 */
export const countdownAnimation = {
  fps: 120
};

/**
 * 柱状图动画配置
 */
export const chartAnimation = {
  duration: ANIMATION_DURATION,
  delayFactor: DELAY_FACTOR,
  bufferTime: BUFFER_TIME,
  roundDelay: ROUND_DELAY,
  easing: EASING,
  isLastRound
};

/**
 * 里程碑动画配置
 */
export const milestoneAnimation = {
  /**
   * 进入动画时间（毫秒）
   */
  enterDuration: 1600,

  /**
   * 退出动画时间（毫秒）
   */
  exitDuration: 1000,

  /**
   * 每个里程碑之间的垂直间距（像素）
   */
  verticalSpacing: 160,

  /**
   * 每个里程碑的延迟时间（毫秒）
   */
  delayBetween: 200
};
