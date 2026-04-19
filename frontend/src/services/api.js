import axios from 'axios';

const API_HOST = window.location.hostname || '127.0.0.1';
const BASE_URL = `http://${API_HOST}:8000/api/v1`;

const api = axios.create({
  baseURL: BASE_URL,
  paramsSerializer: {
    indexes: null
  }
});

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

function requireContextId(contextId) {
  if (!contextId) {
    throw new Error('缺少数据上下文，请重新上传文件');
  }

  return contextId;
}

/**
 * 上传文件
 * @param {File} file - 要上传的文件
 * @returns {Promise} 上传结果
 */
export async function uploadFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('original_path', file.name);

    const response = await api.post('/upload-data', formData);

    return response.data;
  } catch (error) {
    console.error('上传文件失败:', error);
    throw new Error(getErrorMessage(error, '文件上传失败'));
  }
}

/**
 * 获取角色信息
 * @returns {Promise<Array>} 包含角色信息的数组
 */
export async function getCharactersInfo(contextId) {
  try {
    const requiredContextId = requireContextId(contextId);
    const response = await api.get('/characters-info', {
      params: { context_id: requiredContextId }
    });
    return response.data;
  } catch (error) {
    console.error('获取角色信息失败:', error);
    throw new Error(getErrorMessage(error, '获取角色信息失败'));
  }
}

/**
 * 获取当前赛季
 * @returns {Promise<string>} 当前赛季
 */
export async function getCurrentSeason(contextId) {
  try {
    const requiredContextId = requireContextId(contextId);
    const response = await api.get('/current-season', {
      params: { context_id: requiredContextId }
    });
    return response.data.season;
  } catch (error) {
    console.error('获取当前赛季失败:', error);
    throw new Error(getErrorMessage(error, '获取当前赛季失败'));
  }
}

/**
 * 获取当前赛季配置契约
 * @returns {Promise<{season: string, vote_rounds: string[], wildcard_rounds: string[]}>} 当前赛季契约
 */
export async function getSeasonConfig(contextId) {
  try {
    const requiredContextId = requireContextId(contextId);
    const response = await api.get('/season-config', {
      params: { context_id: requiredContextId }
    });
    return response.data;
  } catch (error) {
    console.error('获取赛季配置失败:', error);
    throw new Error(getErrorMessage(error, '获取赛季配置失败'));
  }
}

/**
 * 获取投票轮次列表
 * @returns {Promise<Array>} 投票轮次列表
 */
export async function getVoteRounds(contextId) {
  try {
    const requiredContextId = requireContextId(contextId);
    const response = await api.get('/vote-rounds', {
      params: { context_id: requiredContextId }
    });
    return response.data.vote_rounds || [];
  } catch (error) {
    console.error('获取投票轮次失败:', error);
    throw new Error(getErrorMessage(error, '获取投票轮次失败'));
  }
}

/**
 * 获取完整的投票数据
 * @param {Object} options - 选项对象
 * @param {string} options.contextId - 数据上下文 ID
 * @param {string[]} options.excludedColumns - 要排除的列
 * @param {boolean} options.excludeWildcard - 是否排除外卡赛
 * @param {boolean} options.excludeRanking - 是否排除排位赛
 * @returns {Promise<Object>} 包含投票数据的对象
 */
export async function getVotesByRounds({ contextId, excludedColumns = [], excludeWildcard = false, excludeRanking = false } = {}) {
  try {
    const requiredContextId = requireContextId(contextId);
    const response = await api.post('/votes-by-rounds', {
      context_id: requiredContextId,
      excluded_columns: excludedColumns,
      exclude_wildcard: excludeWildcard,
      exclude_ranking: excludeRanking
    });

    if (!response.data || !response.data.votes_data || response.data.votes_data.length === 0) {
      return {
        votes_data: [],
        vote_rounds: [],
        participating_counts: {}
      };
    }

    return response.data;
  } catch (error) {
    console.error('获取投票数据失败:', error);
    throw new Error(getErrorMessage(error, '获取投票数据失败'));
  }
}
