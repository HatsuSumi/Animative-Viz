// 文件验证和处理工具函数

/**
 * 验证上传的 CSV 文件
 * @param {File} file - 要验证的文件对象
 * @throws {Error} 如果文件不符合要求
 * @returns {boolean} 验证通过返回 true
 */
export const validateCSVFile = (file) => {
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  if (!file) {
    throw new Error('请选择文件');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('请上传 CSV 文件');
  }

  if (file.size > maxFileSize) {
    throw new Error('文件大小不能超过 5MB');
  }

  return true;
};