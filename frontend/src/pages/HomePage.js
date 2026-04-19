import React, { useReducer, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FileUploader from '../components/FileUploader';
import ColumnExclusionModal from '../components/ColumnExclusionModal';
import ConfirmationModal from '../components/ConfirmationModal';
import ExcludeSpecialRoundsModal from '../components/ExcludeSpecialRoundsModal';
import RecordVideoModal from '../components/RecordVideoModal';
import '../styles/global.css';

const FLOW_STEP = {
  IDLE: 'idle',
  CONFIRM_EXCLUSION: 'confirm-exclusion',
  SELECT_COLUMNS: 'select-columns',
  SELECT_SPECIAL_ROUNDS: 'select-special-rounds',
  SELECT_RECORDING: 'select-recording'
};

const initialState = {
  step: FLOW_STEP.IDLE,
  contextId: null,
  selectedColumns: [],
  excludeWildcard: false,
  excludeRanking: false
};

function homeFlowReducer(state, action) {
  switch (action.type) {
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        contextId: action.contextId,
        step: FLOW_STEP.CONFIRM_EXCLUSION
      };

    case 'OPEN_COLUMN_SELECTION':
      return {
        ...state,
        step: FLOW_STEP.SELECT_COLUMNS
      };

    case 'CLOSE_COLUMN_SELECTION':
      return {
        ...state,
        step: FLOW_STEP.IDLE
      };

    case 'SELECT_COLUMNS':
      return {
        ...state,
        selectedColumns: action.selectedColumns,
        step: FLOW_STEP.SELECT_SPECIAL_ROUNDS
      };

    case 'BACK_TO_COLUMN_SELECTION':
      return {
        ...state,
        step: FLOW_STEP.SELECT_COLUMNS
      };

    case 'CLOSE_SPECIAL_ROUNDS':
      return {
        ...state,
        step: FLOW_STEP.IDLE
      };

    case 'SELECT_SPECIAL_ROUNDS':
      return {
        ...state,
        excludeWildcard: action.excludeWildcard,
        excludeRanking: action.excludeRanking,
        step: FLOW_STEP.SELECT_RECORDING
      };

    case 'SELECT_RECORDING_MODE':
      return {
        ...state,
        step: FLOW_STEP.IDLE
      };

    case 'RESET_FLOW':
      return {
        ...state,
        step: FLOW_STEP.IDLE
      };

    default:
      return state;
  }
}

const HomePage = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState(null);
  const [flowState, dispatch] = useReducer(homeFlowReducer, initialState);

  const {
    step,
    contextId,
    selectedColumns,
    excludeWildcard,
    excludeRanking
  } = flowState;

  const navigateToCumulativeVotesPage = useCallback((filterOptions, shouldRecordValue) => {
    const requestOptions = {
      contextId,
      ...filterOptions
    };

    navigate('/cumulative-votes', { 
      state: {
        contextId,
        filterOptions: requestOptions,
        shouldRecord: shouldRecordValue
      }
    });
  }, [contextId, navigate]);

  const handleUploadSuccess = async (uploadResult) => {
    dispatch({ type: 'UPLOAD_SUCCESS', contextId: uploadResult.context_id });
  };

  const handleColumnExclusionDecision = async (shouldExclude) => {
    dispatch({ type: 'RESET_FLOW' });

    if (shouldExclude) {
      dispatch({ type: 'OPEN_COLUMN_SELECTION' });
    } else {
      try {
        navigateToCumulativeVotesPage({}, false);
      } catch (error) {
        setError(error.message || '获取数据失败，请重试');
      }
    }
  };

  const handleColumnSelection = ({ selectedColumns }) => {
    dispatch({
      type: 'SELECT_COLUMNS',
      selectedColumns
    });
  };

  const handleColumnExclusionCancel = () => {
    dispatch({ type: 'CLOSE_COLUMN_SELECTION' });
  };

  const handleSpecialRoundsCancel = () => {
    dispatch({ type: 'BACK_TO_COLUMN_SELECTION' });
  };

  const handleSpecialRoundsHide = () => {
    dispatch({ type: 'CLOSE_SPECIAL_ROUNDS' });
  };

  const handleSpecialRoundsConfirm = ({ excludeWildcard, excludeRanking }) => {
    dispatch({
      type: 'SELECT_SPECIAL_ROUNDS',
      excludeWildcard,
      excludeRanking
    });
  };

  const handleRecordingSelection = async (shouldRecord) => {
    dispatch({
      type: 'SELECT_RECORDING_MODE',
      shouldRecord
    });

    try {
      const filterOptions = {
        excludedColumns: selectedColumns,
        excludeWildcard,
        excludeRanking
      };
      
      navigateToCumulativeVotesPage(filterOptions, shouldRecord);
    } catch (error) {
      console.error('Error navigating to chart:', error);
    }
  };

  const handleRecordConfirm = async () => {
    await handleRecordingSelection(true);
  };

  const handleRecordCancel = async () => {
    await handleRecordingSelection(false);
  };

  return (
    <div className="home-page">
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

          <FileUploader onUploadSuccess={handleUploadSuccess} />

          <ConfirmationModal
          isOpen={step === FLOW_STEP.CONFIRM_EXCLUSION}
            onConfirmAction={() => handleColumnExclusionDecision(true)}
            onCancelAction={() => handleColumnExclusionDecision(false)}
          />

          <ColumnExclusionModal
          show={step === FLOW_STEP.SELECT_COLUMNS}
            initialSelectedColumns={selectedColumns}
            onClose={handleColumnExclusionCancel}
            onConfirm={handleColumnSelection}
          />

          <ExcludeSpecialRoundsModal 
          show={step === FLOW_STEP.SELECT_SPECIAL_ROUNDS}
            onHide={handleSpecialRoundsHide}  
            onCancel={handleSpecialRoundsCancel}  
            onConfirm={handleSpecialRoundsConfirm}
          />

          <RecordVideoModal
          show={step === FLOW_STEP.SELECT_RECORDING}
            onCancel={handleRecordCancel}
            onConfirm={handleRecordConfirm}
          />
        </>
    </div>
  );
};

export default HomePage;