import { useState, useEffect } from 'react';
import TrainButton from './components/TrainButton';
import ViewExecutive from './components/ViewExecutive';
import ViewTechnical from './components/ViewTechnical';
import { checkHealth } from './api/backend';

const TABS = [
  { id: 'executive', label: '◈ Vista Ejecutiva', desc: 'KPIs y resumen de negocio' },
  { id: 'technical', label: '⬡ Vista Técnica', desc: 'Métricas, matrices y análisis ML' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('executive');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'ok' | 'error' | 'checking'
  const [lastTrained, setLastTrained] = useState(null);

  useEffect(() => {
    checkHealth()
      .then(() => setBackendStatus('ok'))
      .catch(() => setBackendStatus('error'));
  }, []);

  function handleResult(data) {
    setMetrics(data.metrics);
    setLastTrained(new Date().toLocaleTimeString('es-CL'));
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__left">
          <div className="app-logo">
            <span className="app-logo__icon">⬡</span>
            <div>
              <h1 className="app-logo__title">DryBeans ML</h1>
              <p className="app-logo__sub">SVM Classification Dashboard</p>
            </div>
          </div>
        </div>

        <div className="app-header__center">
          <nav className="tab-nav">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-btn__label">{tab.label}</span>
                <span className="tab-btn__desc">{tab.desc}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="app-header__right">
          <div className={`status-badge status-badge--${backendStatus}`}>
            <span className="status-badge__dot" />
            {backendStatus === 'ok' && 'Backend online'}
            {backendStatus === 'error' && 'Backend offline'}
            {backendStatus === 'checking' && 'Verificando...'}
          </div>
        </div>
      </header>

      {/* Control bar */}
      <div className="control-bar">
        <div className="control-bar__left">
          {lastTrained && (
            <span className="last-trained">
              Último entrenamiento: <strong>{lastTrained}</strong>
              {metrics && (
                <span className="last-trained__acc">
                  {' '}· Accuracy {(metrics.accuracy * 100).toFixed(2)}%
                </span>
              )}
            </span>
          )}
        </div>
        <div className="control-bar__right">
          <TrainButton
            onResult={handleResult}
            onError={setError}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="loading-bar">
          <div className="loading-bar__fill" />
        </div>
      )}

      {/* Main content */}
      <main className="app-main">
        {activeTab === 'executive' && <ViewExecutive metrics={metrics} />}
        {activeTab === 'technical' && <ViewTechnical metrics={metrics} />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <span>Dry Beans Dataset · UCI ML Repository · SVM kernel rbf · GridSearchCV</span>
        <span>SCY1101 · Javier Sagredo · Cristian Romero</span>
      </footer>
    </div>
  );
}
