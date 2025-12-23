import React, { useEffect } from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CumulativeVotesPage from './pages/CumulativeVotesPage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const location = useLocation();
  const isChartPage = location.pathname === '/cumulative-votes';

  useEffect(() => {
    document.body.style.overflow = isChartPage ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isChartPage]);

  return (
    <ErrorBoundary>
      <div className={isChartPage ? 'App hidden' : 'App'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cumulative-votes" element={<CumulativeVotesPage />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
