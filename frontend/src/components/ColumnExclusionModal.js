import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { getVoteRounds } from '../services/api';
import '../styles/columnexclusionmodal.css';

const ColumnExclusionModal = ({ onConfirm, onClose, initialSelectedColumns = [], show }) => {
  const [selectedColumns, setSelectedColumns] = useState(initialSelectedColumns);
  const [voteColumns, setVoteColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!show) return;  

    const fetchVoteRounds = async () => {
      try {
        const data = await getVoteRounds();
        setVoteColumns(data || []);  
        setLoading(false);
      } catch (error) {
        console.error('获取投票轮次失败：', error);
        setError(error.message || '获取投票轮次失败，请重试');
        setLoading(false);
      }
    };

    fetchVoteRounds();
  }, [show]);  

  const handleColumnClick = (column) => {
    setSelectedColumns(prev => {
      const isSelected = prev.includes(column);
      if (isSelected) {
        return prev.filter(col => col !== column);
      } else {
        return [...prev, column];
      }
    });
    setShowWarning(false);
  };

  const handleConfirm = () => {
    if (selectedColumns.length === 0) {
      setShowWarning(true);
      return;
    }
    onConfirm({ selectedColumns });
  };

  if (error) return createPortal(<div className="error">{error}</div>, document.body);

  if (!show && !loading) return createPortal(
    <AnimatePresence />,
    document.body
  );

  return createPortal(
    <AnimatePresence>
      {(show || loading) && (
        <>
          {loading ? (
            <motion.div 
              className="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              加载中...
            </motion.div>
          ) : (
            <motion.div 
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            >
              <motion.div 
                className="modal-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.h3 
                  className="modal-title"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                >
                  选择要排除的投票轮次
                </motion.h3>
                
                <div className="column-selection-grid">
                  {voteColumns.map((column) => (
                    <motion.label 
                      key={column} 
                      className="column-label"
                      whileHover={{ 
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        scale: 1.02
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="checkbox"
                        value={column}
                        checked={selectedColumns.includes(column)}
                        onChange={() => handleColumnClick(column)}
                      />
                      <span className={selectedColumns.includes(column) ? 'selected' : ''}>
                        {column}
                      </span>
                    </motion.label>
                  ))}
                </div>
                
                <AnimatePresence>
                  {showWarning && (
                    <motion.div
                      className="warning-message"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      请至少选择一个要排除的轮次
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="modal-buttons">
                  <motion.button 
                    className="confirm-button"
                    onClick={handleConfirm}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    确认排除
                  </motion.button>
                  <motion.button 
                    className="cancel-button"
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    取消
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ColumnExclusionModal;
