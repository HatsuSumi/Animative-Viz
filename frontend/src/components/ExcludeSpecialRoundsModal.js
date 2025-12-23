import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import '../styles/specialroundsmodal.css';

const ExcludeSpecialRoundsModal = ({ show, onHide, onCancel, onConfirm }) => {
  const [excludeWildcard, setExcludeWildcard] = useState(false);
  const [excludeRanking, setExcludeRanking] = useState(false);

  const handleConfirm = () => {
    onConfirm({
      excludeWildcard,
      excludeRanking
    });
    onHide();
  };

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div 
          className="special-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onHide}
        >
          <motion.div 
            className="special-modal-content"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 25
              }
            }}
            exit={{ 
              scale: 0.8, 
              opacity: 0, 
              y: 20,
              transition: {
                duration: 0.2
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.h3 
              className="special-modal-title"
              initial={{ y: -20, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: {
                  delay: 0.1,
                  duration: 0.3
                }
              }}
            >
              排除特殊轮次得票数
            </motion.h3>
            
            <div className="special-selection-grid">
              <motion.label 
                className="special-round-label"
                initial={{ x: -20, opacity: 0 }}
                animate={{ 
                  x: 0, 
                  opacity: 1,
                  transition: {
                    delay: 0.2,
                    duration: 0.3
                  }
                }}
                whileHover={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  scale: 1.02,
                  transition: {
                    duration: 0.2
                  }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="checkbox"
                  checked={excludeWildcard}
                  onChange={(e) => setExcludeWildcard(e.target.checked)}
                />
                <span className={excludeWildcard ? 'selected' : ''}>
                  排除外卡赛得票数
                </span>
              </motion.label>

              <motion.label 
                className="special-round-label"
                initial={{ x: -20, opacity: 0 }}
                animate={{ 
                  x: 0, 
                  opacity: 1,
                  transition: {
                    delay: 0.3,
                    duration: 0.3
                  }
                }}
                whileHover={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  scale: 1.02,
                  transition: {
                    duration: 0.2
                  }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="checkbox"
                  checked={excludeRanking}
                  onChange={(e) => setExcludeRanking(e.target.checked)}
                />
                <span className={excludeRanking ? 'selected' : ''}>
                  排除排位赛得票数
                </span>
              </motion.label>
            </div>
            
            <motion.div 
              className="special-modal-buttons"
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: {
                  delay: 0.4,
                  duration: 0.3
                }
              }}
            >
              <motion.button 
                className="special-cancel-button"
                onClick={onCancel}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: '#f7fafc'
                }}
                whileTap={{ scale: 0.95 }}
              >
                取消
              </motion.button>
              <motion.button 
                className="special-confirm-button"
                onClick={handleConfirm}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: '#4299e1'
                }}
                whileTap={{ scale: 0.95 }}
              >
                确认
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ExcludeSpecialRoundsModal;
