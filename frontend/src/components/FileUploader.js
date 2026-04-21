import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { importVoteData } from '../services/api';
import { validateCSVFile } from '../utils/fileUtils';
import '../styles/fileuploader.css';

const FILE_UPLOAD_CHANGED_MESSAGE = '文件上传失败，源文件可能在上传过程中发生变化，请重新选择文件后再试';

const FileUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef(null);

  const handleUpload = useCallback(async (selectedFile) => {
    setUploading(true);
    setError(null);
    try {
      const result = await importVoteData(selectedFile);
      onUploadSuccess(result);
    } catch (err) {
      if (err.message === FILE_UPLOAD_CHANGED_MESSAGE) {
        setFile(null);
      }
      setError(err.message || '导入数据文件失败');
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const processFile = useCallback((selectedFile) => {
    try {
      validateCSVFile(selectedFile);
      setFile(selectedFile);
      setError(null);
      handleUpload(selectedFile);
    } catch (err) {
      setError(err.message);
      setFile(null);
    }
  }, [handleUpload]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      return;
    }

    processFile(selectedFile);
    e.target.value = '';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;

    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const selectedFile = e.dataTransfer.files[0];
    if (!selectedFile) {
      return;
    }

    processFile(selectedFile);
  };

  const triggerFileInput = () => {
    if (!uploading) {
    fileInputRef.current.click();
    }
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
        className={`file-upload-area${isDragging ? ' dragging' : ''}${uploading ? ' uploading' : ''}`}
        onClick={triggerFileInput}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={uploading ? undefined : { scale: 1.02 }}
        whileTap={uploading ? undefined : { scale: 0.98 }}
      >
        {file ? (
          <div className="file-selected">
            <span>{uploading ? `导入中: ${file.name}` : `已选择: ${file.name}`}</span>
          </div>
        ) : (
          <div className="file-placeholder">
            {isDragging ? '松开以导入 CSV 文件' : '点击或拖拽导入 CSV 文件'}
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
          {uploading ? '导入中...' : '重新导入'}
        </motion.button>
      )}
      
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default FileUploader;
