import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { uploadFile } from '../services/api';
import { validateCSVFile } from '../utils/fileUtils';
import '../styles/fileuploader.css';

const FileUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef(null);

  const handleUpload = useCallback(async (selectedFile) => {
    setUploading(true);
    try {
      const result = await uploadFile(selectedFile);
      onUploadSuccess(result);
      setUploading(false);
    } catch (err) {
      setError('文件上传失败');
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
            <span>{uploading ? `上传中: ${file.name}` : `已选择: ${file.name}`}</span>
          </div>
        ) : (
          <div className="file-placeholder">
            {isDragging ? '松开以上传 CSV 文件' : '点击或拖拽上传 CSV 文件'}
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
          {uploading ? '上传中...' : '重新上传'}
        </motion.button>
      )}
      
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default FileUploader;
