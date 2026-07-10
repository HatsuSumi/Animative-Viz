import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { getSeasonConfig } from '../services/api';
import '../styles/specialroundsmodal.css';

const ExcludeSpecialRoundsModal = ({ show, contextId, onHide, onCancel, onConfirm }) => {
  const [excludeWildcard, setExcludeWildcard] = useState(false);
  const [excludeRanking, setExcludeRanking] = useState(false);
  const [seasonConfig, setSeasonConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show || !contextId) {
      return;
    }

    let isMounted = true;

    const fetchSeasonConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const config = await getSeasonConfig(contextId);
        if (!isMounted) {
          return;
        }
        setSeasonConfig(config);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        setError(fetchError.message || '获取赛季配置失败，请重试');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSeasonConfig();

    return () => {
      isMounted = false;
    };
  }, [contextId, show]);

  const handleConfirm = () => {
    onConfirm({
      excludeWildcard,
      excludeRanking
    });
    onHide();
  };

  const wildcardCount = seasonConfig?.special_vote_cell_counts?.wildcard || 0;
  const rankingCount = seasonConfig?.special_vote_cell_counts?.ranking || 0;
  const hasWildcardVotes = Boolean(seasonConfig?.has_wildcard_votes);
  const hasRankingVotes = Boolean(seasonConfig?.has_ranking_votes);

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
                type: 'spring',
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
              配置特殊票过滤
            </motion.h3>

            <p className="special-modal-description">
              特殊票过滤会按赛季配置自动处理对应角色在对应轮次的票数，不会默认整轮删除数据。
            </p>

            {loading ? (
              <div className="special-modal-state">正在加载赛季配置...</div>
            ) : error ? (
              <div className="special-modal-state special-modal-error">{error}</div>
            ) : (
              <div className="special-selection-grid">
                <motion.label 
                  className={`special-round-label ${!hasWildcardVotes ? 'disabled' : ''}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1,
                    transition: {
                      delay: 0.2,
                      duration: 0.3
                    }
                  }}
                  whileHover={hasWildcardVotes ? { 
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    scale: 1.02,
                    transition: {
                      duration: 0.2
                    }
                  } : undefined}
                  whileTap={hasWildcardVotes ? { scale: 0.98 } : undefined}
                >
                  <input
                    type="checkbox"
                    checked={excludeWildcard}
                    disabled={!hasWildcardVotes}
                    onChange={(e) => setExcludeWildcard(e.target.checked)}
                  />
                  <span className={excludeWildcard ? 'selected' : ''}>
                    排除外卡赛得票
                  </span>
                  <small>{hasWildcardVotes ? `当前赛季已配置 ${wildcardCount} 个外卡票单元格` : '当前赛季未配置外卡票'}</small>
                </motion.label>

                <motion.label 
                  className={`special-round-label ${!hasRankingVotes ? 'disabled' : ''}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1,
                    transition: {
                      delay: 0.3,
                      duration: 0.3
                    }
                  }}
                  whileHover={hasRankingVotes ? { 
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    scale: 1.02,
                    transition: {
                      duration: 0.2
                    }
                  } : undefined}
                  whileTap={hasRankingVotes ? { scale: 0.98 } : undefined}
                >
                  <input
                    type="checkbox"
                    checked={excludeRanking}
                    disabled={!hasRankingVotes}
                    onChange={(e) => setExcludeRanking(e.target.checked)}
                  />
                  <span className={excludeRanking ? 'selected' : ''}>
                    排除排位赛得票
                  </span>
                  <small>{hasRankingVotes ? `当前赛季已配置 ${rankingCount} 个排位票单元格` : '当前赛季未配置排位票'}</small>
                </motion.label>
              </div>
            )}
            
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
                disabled={loading || Boolean(error)}
                whileHover={{ 
                  scale: loading || error ? 1 : 1.05,
                  backgroundColor: loading || error ? '#4299e1' : '#3182ce'
                }}
                whileTap={{ scale: loading || error ? 1 : 0.95 }}
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
