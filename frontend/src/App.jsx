import { useState, useEffect } from 'react';
import { checkHealth, trainModel } from './api/backend';
import PageExecutive from './components/PageExecutive';
import PageTechnical from './components/PageTechnical';

export default function App() {
  const [page, setPage] = useState('executive');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [lastTrained, setLastTrained] = useState(null);
  const [trainDots, setTrainDots] = useState('');

  useEffect(() => {
    checkHealth()
      .then(() => setBackendStatus('ok'))
      .catch(() => setBackendStatus('error'));
  }, []);

  async function handleTrain() {
    setLoading(true);
    setError(null);
    const interval = setInterval(() =>
      setTrainDots(d => d.length >= 3 ? '' : d + '.'), 500
    );
    try {
      const data = await trainModel();
      setMetrics(data.metrics);
      setLastTrained(new Date().toLocaleTimeString('es-CL'));
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(interval);
      setTrainDots('');
      setLoading(false);
    }
  }

  const sharedProps = {
    metrics,
    loading,
    error,
    backendStatus,
    lastTrained,
    trainDots,
    onTrain: handleTrain,
    onDismissError: () => setError(null),
  };

  return (
    <div className="app-root">
      {/* Switcher fijo entre páginas */}
      <nav className="page-switcher">
        <div className="switcher-inner">
          <span className="switcher-label">Vista</span>
          <button
            className={`switcher-btn ${page === 'executive' ? 'active' : ''}`}
            onClick={() => setPage('executive')}
          >
            Ejecutiva
          </button>
          <button
            className={`switcher-btn ${page === 'technical' ? 'active' : ''}`}
            onClick={() => setPage('technical')}
          >
            Técnica
          </button>
        </div>
        <div className={`status-pill status-pill--${backendStatus}`}>
          <span className="status-dot" />
          {backendStatus === 'ok' && 'API online'}
          {backendStatus === 'error' && 'API offline'}
          {backendStatus === 'checking' && 'conectando…'}
        </div>
      </nav>

      {page === 'executive' && <PageExecutive {...sharedProps} />}
      {page === 'technical' && <PageTechnical {...sharedProps} />}
    </div>
  );
}
