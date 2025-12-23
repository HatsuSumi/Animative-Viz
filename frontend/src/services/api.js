import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

// 创建 axios 实例，配置数组参数的序列化方式
const api = axios.create({
  baseURL: BASE_URL,
  paramsSerializer: {
    indexes: null 
  }
});

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

    const response = await api.post('/upload-data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('上传文件失败:', error);
    throw error;
  }
}

/**
 * 获取角色信息
 * @returns {Promise<Array>} 包含角色信息的数组
 */
export async function getCharactersInfo() {
  try {
    const response = await api.get('/characters-info');
    return response.data;
  } catch (error) {
    console.error('获取角色信息失败:', error);
    throw error;
  }
}

/**
 * 获取当前赛季
 * @returns {Promise<string>} 当前赛季
 */
export async function getCurrentSeason() {
  try {
    const response = await api.get('/current-season');
    return response.data;
  } catch (error) {
    console.error('获取当前赛季失败:', error);
    throw error;
  }
}

/**
 * 获取投票轮次列表
 * @returns {Promise<Array>} 投票轮次列表
 */
export async function getVoteRounds() {
  try {
    const response = await api.get('/vote-rounds');
    return response.data;
  } catch (error) {
    console.error('获取投票轮次失败:', error);
    throw error;
  }
}

/**
 * 获取完整的投票数据
 * @param {Object} options - 选项对象
 * @param {string[]} options.excludedColumns - 要排除的列
 * @param {boolean} options.excludeWildcard - 是否排除外卡赛
 * @param {boolean} options.excludeRanking - 是否排除排位赛
 * @returns {Promise<Object>} 包含投票数据的对象
 */
export async function getVotesByRounds({ excludedColumns = [], excludeWildcard = false, excludeRanking = false } = {}) {
  try {
    const response = await api.post('/votes-by-rounds', {
      excluded_columns: excludedColumns,
      exclude_wildcard: excludeWildcard,
      exclude_ranking: excludeRanking
    });


    // 如果没有数据，返回默认结构
    if (!response.data || !response.data.votes_data || response.data.votes_data.length === 0) {
      return { 
        votes_data: [],
        vote_rounds: [],
        participating_counts: {}
      };
    }

    // 数据已经是正确的格式，直接返回
    return response.data;
  } catch (error) {
    console.error('获取投票数据失败:', error);
    throw error;
  }
}
