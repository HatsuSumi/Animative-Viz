import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FileUploader from '../components/FileUploader';
import ColumnExclusionModal from '../components/ColumnExclusionModal';
import ConfirmationModal from '../components/ConfirmationModal';
import ExcludeSpecialRoundsModal from '../components/ExcludeSpecialRoundsModal';
import CumulativeVotesChart from '../components/CumulativeVotesChart';
import RecordVideoModal from '../components/RecordVideoModal';
import { getVotesByRounds } from '../services/api';
import '../styles/global.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [excludedColumns, setExcludedColumns] = useState([]);
  const [showColumnExclusionModal, setShowColumnExclusionModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSpecialRoundsModal, setShowSpecialRoundsModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartContainer, setChartContainer] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [excludeWildcard, setExcludeWildcard] = useState(false);
  const [excludeRanking, setExcludeRanking] = useState(false);
  const [shouldRecord, setShouldRecord] = useState(false);

  const navigateToChart = useCallback((navigationState) => {
    navigate('/cumulative-votes', { 
      state: {
        ...navigationState,
        shouldRecord
      }
    });
  }, [navigate, shouldRecord]);

  const handleUploadSuccess = async () => {
    setShowConfirmationModal(true);
  };

  const handleColumnExclusionDecision = async (shouldExclude) => {
    setShowConfirmationModal(false);
    if (shouldExclude) {
      setShowColumnExclusionModal(true);
    } else {
      try {
        const data = await getVotesByRounds({});
        
        if (!data.votes_data || !data.vote_rounds) {
          throw new Error('获取的数据不完整');
        }
        const navigationState = {
          votesData: data.votes_data,
          voteRounds: data.vote_rounds,
          participatingCounts: data.participating_counts || {}, 
        };
        navigateToChart(navigationState);
      } catch (error) {
        setError(error.message || '获取数据失败，请重试');
      }
    }
  };

  const handleColumnSelection = ({ selectedColumns }) => {
    setSelectedColumns(selectedColumns);
    setShowColumnExclusionModal(false);  
    setShowSpecialRoundsModal(true);  
  };

  const handleColumnExclusionCancel = () => {
    setShowColumnExclusionModal(false);
  };

  const handleSpecialRoundsCancel = () => {
    setShowSpecialRoundsModal(false);  
    setShowColumnExclusionModal(true);  
  };

  const handleSpecialRoundsHide = () => {
    setShowSpecialRoundsModal(false);
  };

  const handleSpecialRoundsConfirm = ({ excludeWildcard, excludeRanking }) => {
    setExcludeWildcard(excludeWildcard);
    setExcludeRanking(excludeRanking);
    setShowSpecialRoundsModal(false);
    setShowRecordModal(true);
  };

  const handleRecordConfirm = async () => {
    setShouldRecord(true);
    setShowRecordModal(false);
    try {
      const filterOptions = {
        excludedColumns: selectedColumns,
        excludeWildcard,
        excludeRanking
      };
      
      // 获取投票数据
      const data = await getVotesByRounds(filterOptions);
      
      if (!data.votes_data || !data.vote_rounds) {
        throw new Error('获取的数据不完整');
      }
      
      // 传递完整的数据到图表页面
      const navigationState = {
        votesData: data.votes_data,
        voteRounds: data.vote_rounds,
        participatingCounts: data.participating_counts || {},
        filterOptions
      };
      
      navigateToChart(navigationState);
    } catch (error) {
      console.error('Error navigating to chart:', error);
    }
  };

  const handleRecordCancel = async () => {
    setShouldRecord(false);
    setShowRecordModal(false);
    try {
      const filterOptions = {
        excludedColumns: selectedColumns,
        excludeWildcard,
        excludeRanking
      };
      
      // 获取投票数据
      const data = await getVotesByRounds(filterOptions);
      
      if (!data.votes_data || !data.vote_rounds) {
        throw new Error('获取的数据不完整');
      }
      
      // 传递完整的数据到图表页面
      const navigationState = {
        votesData: data.votes_data,
        voteRounds: data.vote_rounds,
        participatingCounts: data.participating_counts || {},
        filterOptions
      };
      
      navigateToChart(navigationState);
    } catch (error) {
      console.error('Error navigating to chart:', error);
    }
  };

  return (
    <div className="home-page">
      {chartContainer || (
        <>
          <motion.h1 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          >
            动态数据可视化工具
          </motion.h1>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <FileUploader onUploadSuccess={handleUploadSuccess} onDataProcessed={setProcessedData} />

          <ConfirmationModal
            isOpen={showConfirmationModal}
            onConfirmAction={() => handleColumnExclusionDecision(true)}
            onCancelAction={() => handleColumnExclusionDecision(false)}
          />

          <ColumnExclusionModal
            show={showColumnExclusionModal}
            initialSelectedColumns={selectedColumns}
            onClose={handleColumnExclusionCancel}
            onConfirm={handleColumnSelection}
          />

          <ExcludeSpecialRoundsModal 
            show={showSpecialRoundsModal}
            onHide={handleSpecialRoundsHide}  
            onCancel={handleSpecialRoundsCancel}  
            onConfirm={handleSpecialRoundsConfirm}
          />

          <RecordVideoModal
            show={showRecordModal}
            onCancel={handleRecordCancel}
            onConfirm={handleRecordConfirm}
          />

          {processedData && (
            <div className="cumulative-votes-container">
              <CumulativeVotesChart 
                data={processedData} 
                excludedColumns={excludedColumns}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
