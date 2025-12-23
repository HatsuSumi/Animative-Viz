import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { uploadFile } from '../services/api';
import { validateCSVFile } from '../utils/fileUtils';
import '../styles/fileuploader.css';

const FileUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    try {
      validateCSVFile(selectedFile);
      setFile(selectedFile);
      setError(null);
      
      // 立即触发上传
      handleUpload(selectedFile);
    } catch (err) {
      setError(err.message);
      setFile(null);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const result = await uploadFile(file);
      onUploadSuccess(result);
      setUploading(false);
    } catch (err) {
      setError('文件上传失败');
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="file-uploader">
      <input 
        type="file" 
        ref={fileInputRef}
        accept=".csv" 
        onChange={handleFileChange} 
        disabled={uploading}
      />
      <motion.div 
        className="file-upload-area"
        onClick={triggerFileInput}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {file ? (
          <div className="file-selected">
            <span>已选择: {file.name}</span>
          </div>
        ) : (
          <div className="file-placeholder">
            点击上传 CSV 文件
          </div>
        )}
      </motion.div>
      
      {file && (
        <motion.button 
          onClick={() => handleUpload(file)}
          disabled={uploading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="upload-button"
        >
          {uploading ? '上传中...' : '开始上传'}
        </motion.button>
      )}
      
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default FileUploader;
