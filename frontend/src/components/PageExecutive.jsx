import TrainButton from './TrainButton';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';

const VARIETY_COLORS = {
  DERMASON: '#a3e635', SIRA: '#38bdf8', SEKER: '#f472b6',
  HOROZ: '#fb923c',   CALI: '#a78bfa', BARBUNYA: '#34d399', BOMBAY: '#fbbf24',
};

const CLASS_DIST = [
  { name: 'DERMASON', count: 3546, pct: 26.05 },
  { name: 'SIRA',     count: 2636, pct: 19.37 },
  { name: 'SEKER',    count: 2027, pct: 14.89 },
  { name: 'HOROZ',    count: 1928, pct: 14.17 },
  { name: 'CALI',     count: 1630, pct: 11.98 },
  { name: 'BARBUNYA', count: 1322, pct: 9.71  },
  { name: 'BOMBAY',   count: 522,  pct: 3.84  },
];

const MODEL_COMPARISON = [
  { name: 'SVM (rbf)', acc: 92.69, f1: 92.68, winner: true },
  { name: 'Reg. Logística', acc: 92.14, f1: 92.16, winner: false },
  { name: 'Árbol Decisión', acc: 90.56, f1: 90.57, winner: false },
];

export default function PageExecutive({ metrics, loading, error, backendStatus, lastTrained, trainDots, onTrain, onDismissError }) {

  const radarData = metrics
    ? metrics.class_names.map(name => ({
        clase: name,
        Precision: +(metrics.classification_report[name].precision * 100).toFixed(1),
        Recall: +(metrics.classification_report[name].recall * 100).toFixed(1),
        'F1-Score': +(metrics.classification_report[name]['f1-score'] * 100).toFixed(1),
      }))
    : null;

  return (
    <div className="page exec-page">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-eyebrow">SCY1101 · Programación para la Ciencia de Datos</div>
        <h1 className="hero-title">
          Clasificación de<br />
          <span className="hero-accent">Variedades de Frijol Seco</span>
        </h1>
        <p className="hero-sub">
          Solución end-to-end de machine learning aplicada al dataset Dry Bean — UCI Machine Learning Repository.
          7 variedades · 13.611 muestras · 16 características morfológicas.
        </p>
        <div className="hero-authors">
          <span className="author-chip">Javier Sagredo</span>
          <span className="author-sep">·</span>
          <span className="author-chip">Cristian Romero</span>
        </div>
      </section>

      {/* ── DATASET ── */}
      <section className="story-section">
        <div className="section-tag">01 · Dataset</div>
        <h2 className="section-title">¿Qué datos usamos?</h2>
        <div className="two-col">
          <div className="col-text">
            <p>
              El <strong>Dry Bean Dataset</strong> fue publicado en 2020 por Koklu & Ozkan y proviene de un
              sistema de visión computacional aplicado a la industria agrícola turca. Cada fila representa
              un grano individual fotografiado y medido automáticamente: área, perímetro, longitud de ejes,
              compacidad, redondez y otros atributos de forma.
            </p>
            <p>
              El dataset tiene <strong>cero valores nulos</strong> y variables numéricas listas para modelado,
              lo que permitió enfocarse completamente en el diseño del pipeline y la selección del modelo.
              El único desafío fue el <strong>desbalance moderado</strong> entre clases: DERMASON representa
              el 26% del total mientras BOMBAY solo el 3.8%.
            </p>
            <div className="highlight-row">
              <div className="highlight-item">
                <span className="hi-num">13.611</span>
                <span className="hi-label">muestras</span>
              </div>
              <div className="highlight-item">
                <span className="hi-num">16</span>
                <span className="hi-label">características</span>
              </div>
              <div className="highlight-item">
                <span className="hi-num">7</span>
                <span className="hi-label">variedades</span>
              </div>
              <div className="highlight-item">
                <span className="hi-num">0</span>
                <span className="hi-label">valores nulos</span>
              </div>
            </div>
          </div>
          <div className="col-chart">
            <p className="chart-label">Distribución de variedades</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={CLASS_DIST} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#4b5563', fontSize: 10 }} unit="%" domain={[0, 30]} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }} width={80} />
                <Tooltip
                  contentStyle={{ background: '#111827', color:'#e8edf2', border: '1px solid #1f2937', borderRadius: 8, fontFamily: 'monospace', fontSize: 12 }}
                  formatter={(v, _, props) => [`${props.payload.count.toLocaleString()} granos (${v}%)`, '']}
                  labelStyle={{ color: '#a3e635' }}
                />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                  {CLASS_DIST.map((d) => (
                    <Cell key={d.name} fill={VARIETY_COLORS[d.name]} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── MODELO ── */}
      <section className="story-section">
        <div className="section-tag">02 · Modelo Seleccionado</div>
        <h2 className="section-title">¿Por qué SVM con kernel RBF?</h2>
        <div className="two-col">
          <div className="col-text">
            <p>
              Se evaluaron tres modelos supervisados clásicos: Árbol de Decisión, Regresión Logística y
              Máquina de Soporte Vectorial. El <strong>SVM con kernel lineal</strong> lideró desde el inicio
              con 92.21% de accuracy y sin overfitting, frente al Árbol que memorizaba el entrenamiento
              (diferencia train-test de 0.058).
            </p>
            <p>
              La optimización mediante <strong>GridSearchCV con 5-fold cross-validation</strong> confirmó que
              cambiar el kernel de lineal a <strong>RBF (Radial Basis Function)</strong> con C=30 y
              gamma='scale' era la clave. El kernel RBF proyecta los datos a un espacio de mayor dimensión
              donde las clases son linealmente separables, capturando relaciones no lineales entre las
              características morfológicas del grano.
            </p>
            <p>
              Para verificar que el SVM era realmente el mejor, se comparó contra modelos ensemble:
              XGBoost (92.40%) y Random Forest (92.32%) quedaron por debajo. Las clases del Dry Bean
              presentan geometría suave y separable, escenario donde el kernel RBF domina.
            </p>
          </div>
          <div className="col-chart">
            <p className="chart-label">Comparación de modelos (Accuracy %)</p>
            <div className="model-bars">
              {MODEL_COMPARISON.map((m) => (
                <div key={m.name} className={`model-bar-row ${m.winner ? 'winner' : ''}`}>
                  <span className="mbar-name">{m.name}</span>
                  <div className="mbar-track">
                    <div
                      className="mbar-fill"
                      style={{ width: `${((m.acc - 89) / 5) * 100}%`, background: m.winner ? '#a3e635' : '#374151' }}
                    />
                  </div>
                  <span className="mbar-val">{m.acc}%</span>
                  {m.winner && <span className="mbar-badge">✓ elegido</span>}
                </div>
              ))}
              <div className="model-bar-row">
                <span className="mbar-name">XGBoost</span>
                <div className="mbar-track">
                  <div className="mbar-fill" style={{ width: `${((92.40 - 89) / 5) * 100}%`, background: '#374151' }} />
                </div>
                <span className="mbar-val">92.40%</span>
              </div>
              <div className="model-bar-row">
                <span className="mbar-name">Random Forest</span>
                <div className="mbar-track">
                  <div className="mbar-fill" style={{ width: `${((92.32 - 89) / 5) * 100}%`, background: '#374151' }} />
                </div>
                <span className="mbar-val">92.32%</span>
              </div>
            </div>
            <p className="chart-note">Rango: 89–94%. Techo práctico del dataset: ~92.7%</p>
          </div>
        </div>
      </section>

      {/* ── RESULTADOS EN VIVO ── */}
      <section className="story-section live-section">
        <div className="section-tag">03 · Resultados en vivo</div>
        <h2 className="section-title">Entrena el modelo ahora</h2>
        <p className="section-desc">
          El backend en Render ejecuta el pipeline completo: descarga el CSV desde GitHub, aplica
          StandardScaler, entrena el SVM optimizado y devuelve las métricas en tiempo real.
          El proceso toma entre 15 y 30 segundos.
        </p>

        <div className="train-zone">
          <TrainButton loading={loading} trainDots={trainDots} onTrain={onTrain} />
          {lastTrained && (
            <span className="last-trained-note">
              Último resultado: <strong>{lastTrained}</strong>
              {metrics && <span className="ltn-acc"> · Accuracy {(metrics.accuracy * 100).toFixed(2)}%</span>}
            </span>
          )}
        </div>

        {error && (
          <div className="error-bar">
            <span>⚠ {error}</span>
            <button onClick={onDismissError}>✕</button>
          </div>
        )}

        {metrics && (
          <>
            <div className="kpi-row">
              <div className="kpi-card" style={{ '--kpi-accent': '#a3e635' }}>
                <span className="kpi-label">Accuracy global</span>
                <span className="kpi-value">{(metrics.accuracy * 100).toFixed(2)}%</span>
                <span className="kpi-sub">de {metrics.n_test?.toLocaleString()} muestras de prueba</span>
              </div>
              <div className="kpi-card" style={{ '--kpi-accent': '#38bdf8' }}>
                <span className="kpi-label">F1 Macro</span>
                <span className="kpi-value">{(metrics.f1_macro * 100).toFixed(2)}%</span>
                <span className="kpi-sub">promedio entre 7 clases</span>
              </div>
              <div className="kpi-card" style={{ '--kpi-accent': '#f472b6' }}>
                <span className="kpi-label">F1 Weighted</span>
                <span className="kpi-value">{(metrics.f1_weighted * 100).toFixed(2)}%</span>
                <span className="kpi-sub">ponderado por soporte</span>
              </div>
              <div className="kpi-card" style={{ '--kpi-accent': '#fb923c' }}>
                <span className="kpi-label">Datos de train</span>
                <span className="kpi-value">{metrics.n_train?.toLocaleString()}</span>
                <span className="kpi-sub">80% del dataset</span>
              </div>
            </div>

            {/* Radar */}
            <div className="chart-block">
              <p className="chart-label">Rendimiento por variedad — Precision, Recall y F1</p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="clase" tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }} />
                  <PolarRadiusAxis angle={30} domain={[80, 100]} tick={{ fill: '#374151', fontSize: 9 }} />
                  <Radar name="Precision" dataKey="Precision" stroke="#a3e635" fill="#a3e635" fillOpacity={0.12} />
                  <Radar name="Recall"    dataKey="Recall"    stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.12} />
                  <Radar name="F1-Score"  dataKey="F1-Score"  stroke="#f472b6" fill="#f472b6" fillOpacity={0.12} />
                  <Tooltip contentStyle={{ background: '#111827', color:'#e8edf2', border: '1px solid #1f2937', borderRadius: 8, fontFamily: 'monospace', fontSize: 12 }} labelStyle={{ color: '#a3e635' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Resumen narrativo */}
            <div className="exec-narrative">
              <div className="narrative-stat">
                <strong>BOMBAY</strong> — clasificación perfecta (F1 = 100%) gracias a su morfología
                inconfundible: es significativamente más grande que todas las demás variedades.
              </div>
              <div className="narrative-stat">
                <strong>SIRA</strong> — clase más difícil del dataset. Presenta solapamiento morfológico
                con BARBUNYA y CALI en el espacio PCA, lo que limita el F1 a ~87%.
              </div>
              <div className="narrative-stat">
                <strong>Límite técnico</strong> — ~92.7% es el techo práctico con algoritmos clásicos.
                Para superar este umbral se requeriría ensemble stacking o redes neuronales profundas.
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="page-footer">
        <span>Dry Bean Dataset · KOKLU & OZKAN (2020) · UCI ML Repository</span>
        <span>Javier Sagredo · Cristian Romero · SCY1101 · 2025</span>
      </footer>
    </div>
  );
}
