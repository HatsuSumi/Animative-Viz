import axios from 'axios';

const FILE_UPLOAD_CHANGED_MESSAGE = '文件上传失败，源文件可能在上传过程中发生变化，请重新选择文件后再试';

const API_HOST = window.location.hostname || '127.0.0.1';
const BASE_URL = `http://${API_HOST}:8000/api/v1`;

const api = axios.create({
  baseURL: BASE_URL,
  paramsSerializer: {
    indexes: null 
  }
});

function getErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data;

  if (typeof responseData?.message === 'string' && responseData.message) {
    return responseData.message;
  }

  if (typeof responseData?.detail?.message === 'string' && responseData.detail.message) {
    return responseData.detail.message;
  }

  if (typeof responseData?.detail === 'string' && responseData.detail) {
    return responseData.detail;
  }

  return error?.message || fallbackMessage;
}

function isUploadFileChangedError(error) {
  return error?.code === 'ERR_NETWORK'
    && error?.message === 'Network Error'
    && !error?.response
    && error?.request instanceof XMLHttpRequest;
}

function getImportVoteDataErrorMessage(error) {
  if (isUploadFileChangedError(error)) {
    return FILE_UPLOAD_CHANGED_MESSAGE;
  }

  return getErrorMessage(error, '导入投票数据文件失败');
}

function requireObjectResponse(data, endpoint) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${endpoint} 返回的数据结构无效`);
  }

  return data;
}

function requireArrayField(data, fieldName, endpoint) {
  if (!Array.isArray(data[fieldName])) {
    throw new Error(`${endpoint} 缺少数组字段: ${fieldName}`);
  }

  return data[fieldName];
}

function requireObjectField(data, fieldName, endpoint) {
  const fieldValue = data[fieldName];

  if (!fieldValue || typeof fieldValue !== 'object' || Array.isArray(fieldValue)) {
    throw new Error(`${endpoint} 缺少对象字段: ${fieldName}`);
  }

  return fieldValue;
}

function requireStringField(data, fieldName, endpoint) {
  if (typeof data[fieldName] !== 'string' || data[fieldName].length === 0) {
    throw new Error(`${endpoint} 缺少字符串字段: ${fieldName}`);
  }

  return data[fieldName];
}

function requireBooleanField(data, fieldName, endpoint) {
  if (typeof data[fieldName] !== 'boolean') {
    throw new Error(`${endpoint} 缺少布尔字段: ${fieldName}`);
  }

  return data[fieldName];
}

function requireContextId(contextId) {
  if (!contextId) {
    throw new Error('缺少数据上下文，请重新导入文件');
  }

  return contextId;
}

/**
 * 导入投票数据文件并初始化上下文
 * @param {File} file - 要导入的文件
 * @returns {Promise} 导入结果
 */
export async function importVoteData(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('original_path', file.name);

    const response = await api.post('/import-vote-data', formData);

    return response.data;
  } catch (error) {
    console.error('导入投票数据文件失败:', error);
    throw new Error(getImportVoteDataErrorMessage(error));
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
    const responseData = requireObjectResponse(response.data, '/current-season');
    return requireStringField(responseData, 'season', '/current-season');
  } catch (error) {
    console.error('获取当前赛季失败:', error);
    throw new Error(getErrorMessage(error, '获取当前赛季失败'));
  }
}

/**
 * 获取当前赛季配置契约
 * @returns {Promise<{season: string, vote_rounds: string[], special_vote_cell_counts: Object, has_wildcard_votes: boolean, has_ranking_votes: boolean}>} 当前赛季契约
 */
export async function getSeasonConfig(contextId) {
  try {
    const requiredContextId = requireContextId(contextId);
    const response = await api.get('/season-config', {
      params: { context_id: requiredContextId }
    });
    const responseData = requireObjectResponse(response.data, '/season-config');
    requireStringField(responseData, 'season', '/season-config');
    requireArrayField(responseData, 'vote_rounds', '/season-config');
    requireObjectField(responseData, 'special_vote_cell_counts', '/season-config');
    requireBooleanField(responseData, 'has_wildcard_votes', '/season-config');
    requireBooleanField(responseData, 'has_ranking_votes', '/season-config');
    return responseData;
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
    const responseData = requireObjectResponse(response.data, '/vote-rounds');
    return requireArrayField(responseData, 'vote_rounds', '/vote-rounds');
  } catch (error) {
    console.error('获取投票轮次失败:', error);
    throw new Error(getErrorMessage(error, '获取投票轮次失败'));
  }
}

/**
 * 获取累计票数页面初始化数据
 * @param {Object} options - 选项对象
 * @param {string} options.contextId - 数据上下文 ID
 * @param {string[]} options.excludedColumns - 要排除的列
 * @param {boolean} options.excludeWildcard - 是否排除外卡赛
 * @param {boolean} options.excludeRanking - 是否排除排位赛
 * @returns {Promise<Object>} 页面初始化数据
 */
export async function getCumulativeVotesPageData({ contextId, excludedColumns = [], excludeWildcard = false, excludeRanking = false } = {}) {
  try {
    const requiredContextId = requireContextId(contextId);
    const response = await api.post('/pages/cumulative-votes', {
      context_id: requiredContextId,
      excluded_columns: excludedColumns,
      exclude_wildcard: excludeWildcard,
      exclude_ranking: excludeRanking
    });

    const responseData = requireObjectResponse(response.data, '/pages/cumulative-votes');
    requireStringField(responseData, 'season', '/pages/cumulative-votes');
    const seasonConfig = requireObjectField(responseData, 'season_config', '/pages/cumulative-votes');
    requireStringField(seasonConfig, 'season', '/pages/cumulative-votes.season_config');
    requireArrayField(seasonConfig, 'vote_rounds', '/pages/cumulative-votes.season_config');
    requireObjectField(seasonConfig, 'special_vote_cell_counts', '/pages/cumulative-votes.season_config');
    requireBooleanField(seasonConfig, 'has_wildcard_votes', '/pages/cumulative-votes.season_config');
    requireBooleanField(seasonConfig, 'has_ranking_votes', '/pages/cumulative-votes.season_config');
    requireArrayField(responseData, 'characters_info', '/pages/cumulative-votes');
    requireObjectField(responseData, 'votes_by_rounds', '/pages/cumulative-votes');
    requireObjectField(responseData, 'final_ranks', '/pages/cumulative-votes');

    return responseData;
  } catch (error) {
    console.error('获取累计票数页面初始化数据失败:', error);
    throw new Error(getErrorMessage(error, '获取累计票数页面初始化数据失败'));
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

    const responseData = requireObjectResponse(response.data, '/votes-by-rounds');
    requireArrayField(responseData, 'votes_data', '/votes-by-rounds');
    requireArrayField(responseData, 'vote_rounds', '/votes-by-rounds');
    requireObjectField(responseData, 'participating_counts', '/votes-by-rounds');

    return responseData;
  } catch (error) {
    console.error('获取投票数据失败:', error);
    throw new Error(getErrorMessage(error, '获取投票数据失败'));
  }
}
