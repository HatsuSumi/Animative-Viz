import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import '../styles/confirmationmodal.css';

const ConfirmationModal = ({ 
  title = '是否要排除某些投票轮次？', 
  onConfirmAction = () => {},
  onCancelAction = () => {},
  isOpen = true
}) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="confirmation-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancelAction}
        >
          <motion.div 
            className="confirmation-modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirmation-modal-header">
              <motion.h3 
                className="confirmation-modal-title"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {title}
              </motion.h3>
            </div>
            <div className="confirmation-modal-body">
              <div className="confirmation-modal-buttons">
                <motion.button 
                  className="confirmation-modal-button confirmation-modal-confirm"
                  onClick={onConfirmAction}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  是
                </motion.button>
                <motion.button 
                  className="confirmation-modal-button confirmation-modal-cancel"
                  onClick={onCancelAction}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  否
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmationModal;
