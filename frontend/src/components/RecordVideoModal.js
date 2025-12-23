import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import '../styles/recordvideomodal.css';

const RecordVideoModal = ({ show, onConfirm, onCancel }) => {
  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div 
          className="record-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div 
            className="record-modal-content"
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
            <motion.div 
              className="record-modal-header"
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
              <h3>🎥 录制视频</h3>
            </motion.div>
            
            <motion.div 
              className="record-modal-body"
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: {
                  delay: 0.2,
                  duration: 0.3
                }
              }}
            >
              <p>是否要录制动画过程？</p>
              <p>录制后可以保存为视频文件。</p>
            </motion.div>
            
            <motion.div 
              className="record-modal-footer"
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: {
                  delay: 0.3,
                  duration: 0.3
                }
              }}
            >
              <button 
                className="record-modal-button cancel"
                onClick={onCancel}
              >
                不录制
              </button>
              <button 
                className="record-modal-button confirm"
                onClick={onConfirm}
              >
                开始录制
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default RecordVideoModal;
