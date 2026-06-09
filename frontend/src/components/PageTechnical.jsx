import TrainButton from './TrainButton';
import ConfusionMatrix from './ConfusionMatrix';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis,
  LineChart, Line, ReferenceLine,
} from 'recharts';

const BASE_RESULTS = [
  { model: 'Árbol', base: 90.56, opt: 90.49, overfit: true },
  { model: 'Log. Reg.', base: 92.14, opt: 92.14, overfit: false },
  { model: 'SVM', base: 92.21, opt: 92.69, overfit: false },
];

const UNSUPERVISED = [
  { model: 'K-Means', ari: 0.6917, sil: 0.2832 },
  { model: 'Jerárquico', ari: 0.7054, sil: 0.2738 },
  { model: 'DBSCAN', ari: 0.3812, sil: 0.1924 },
];

const HYPERPARAM_JOURNEY = [
  { label: 'SVM lineal\nC=1.0', acc: 92.21 },
  { label: 'RBF\nC=1.0', acc: 92.45 },
  { label: 'RBF\nC=10', acc: 92.58 },
  { label: 'RBF\nC=30\n(final)', acc: 92.69 },
];

export default function PageTechnical({ metrics, loading, error, backendStatus, lastTrained, trainDots, onTrain, onDismissError }) {

  const scatterData = metrics
    ? metrics.class_names.map(name => ({
        name,
        precision: +(metrics.classification_report[name].precision * 100).toFixed(2),
        recall: +(metrics.classification_report[name].recall * 100).toFixed(2),
        f1: +(metrics.classification_report[name]['f1-score'] * 100).toFixed(2),
        support: metrics.classification_report[name].support,
      }))
    : [];

  const f1Sorted = [...scatterData].sort((a, b) => b.f1 - a.f1);

  return (
    <div className="page tech-page">

      {/* ── HERO TÉCNICO ── */}
      <section className="hero hero--tech">
        <div className="hero-eyebrow">Vista Técnica · SCY1101</div>
        <h1 className="hero-title">
          Pipeline ML —<br />
          <span className="hero-accent">Análisis de Decisiones</span>
        </h1>
        <p className="hero-sub">
          Documentación técnica del proceso: EDA, preparación de datos, comparación de modelos,
          optimización de hiperparámetros y métricas de evaluación en detalle.
        </p>
      </section>

      {/* ── PIPELINE ── */}
      <section className="story-section">
        <div className="section-tag">01 · Arquitectura del Pipeline</div>
        <h2 className="section-title">Flujo de datos end-to-end</h2>
        <div className="pipeline-flow">
          {[
            { step: '01', icon: '⬡', title: 'Fuente de datos', desc: 'CSV alojado en GitHub — URL pública, versionado con el código. pd.read_csv() sin credenciales.' },
            { step: '02', icon: '⚙', title: 'ETL & Preprocesado', desc: 'LabelEncoder para target · StandardScaler (fit solo en train) · Eliminación de 6 variables colineales.' },
            { step: '03', icon: '◈', title: 'Entrenamiento SVM', desc: 'GridSearchCV 5-fold · Búsqueda amplia → refinada · kernel rbf · C=30 · gamma=scale.' },
            { step: '04', icon: '▣', title: 'Supabase (beans_clean)', desc: 'Datos procesados persistidos en PostgreSQL para consulta desde el frontend sin pasar por la API.' },
            { step: '05', icon: '◎', title: 'FastAPI en Render', desc: 'Endpoints /process · /train · /health. Respuesta JSON directa con todas las métricas.' },
          ].map((s, i) => (
            <div key={i} className="pipeline-step">
              <div className="ps-step-num">{s.step}</div>
              <div className="ps-icon">{s.icon}</div>
              <div className="ps-content">
                <strong>{s.title}</strong>
                <p>{s.desc}</p>
              </div>
              {i < 4 && <div className="ps-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── EDA ── */}
      <section className="story-section">
        <div className="section-tag">02 · Análisis Exploratorio (EDA)</div>
        <h2 className="section-title">Qué reveló el análisis inicial</h2>
        <div className="two-col">
          <div className="col-text">
            <div className="finding-block">
              <div className="finding-icon" style={{ color: '#a3e635' }}>▸</div>
              <div>
                <strong>Colinealidad alta detectada</strong>
                <p>El heatmap reveló 3 grupos redundantes: variables de <em>tamaño</em> (Area, ConvexArea, EquivDiameter, Perimeter) con correlación 0.97–1.00; variables de <em>elongación</em> (AspectRatio, Eccentricity) con 0.92; y Compactness vs ShapeFactor3 con correlación matemáticamente perfecta (1.00).</p>
              </div>
            </div>
            <div className="finding-block">
              <div className="finding-icon" style={{ color: '#38bdf8' }}>▸</div>
              <div>
                <strong>PCA explica el 81.9% de varianza</strong>
                <p>PC1 captura el 55.5% (tamaño del grano) y PC2 el 26.4% (elongación). BOMBAY aparece completamente aislada. BARBUNYA, CALI y SIRA se solapan en el centro: esto explica por qué el modelo no puede superar el 92.7%.</p>
              </div>
            </div>
            <div className="finding-block">
              <div className="finding-icon" style={{ color: '#f472b6' }}>▸</div>
              <div>
                <strong>Reducción: 16 → 10 variables</strong>
                <p>Se eliminaron ConvexArea, EquivDiameter, Perimeter, MinorAxisLength, AspectRatio y ShapeFactor3. El SVM mantuvo exactamente el mismo accuracy (0.9269), confirmando que las variables eliminadas solo aportaban ruido computacional.</p>
              </div>
            </div>
          </div>
          <div className="col-chart">
            <p className="chart-label">Accuracy base vs optimizado por modelo</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={BASE_RESULTS} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="model" tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis domain={[89, 93.5]} tickFormatter={v => `${v}%`} tick={{ fill: '#4b5563', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', color:'#e8edf2' , border: '1px solid #1f2937', borderRadius: 8, fontFamily: 'monospace', fontSize: 12 }}
                  formatter={(v) => [`${v}%`]}
                  labelStyle={{ color: '#a3e635' }}
                />
                <Bar dataKey="base" name="Base" fill="#374151" radius={[3, 3, 0, 0]} />
                <Bar dataKey="opt" name="Optimizado" radius={[3, 3, 0, 0]}>
                  {BASE_RESULTS.map((d, i) => (
                    <Cell key={i} fill={d.model === 'SVM' ? '#a3e635' : '#4b5563'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="chart-note">Solo el SVM ganó accuracy real con GridSearch (+0.48%). El Árbol corrigió overfitting bajando levemente.</p>
          </div>
        </div>
      </section>

      {/* ── OPTIMIZACIÓN ── */}
      <section className="story-section">
        <div className="section-tag">03 · Optimización de Hiperparámetros</div>
        <h2 className="section-title">El camino hacia C=30, kernel=rbf</h2>
        <div className="two-col">
          <div className="col-text">
            <p>
              Se aplicó <strong>GridSearchCV con 5-fold cross-validation</strong> en dos rondas iterativas.
              La primera ronda exploró rangos amplios del espacio de hiperparámetros. La segunda refinó
              alrededor del óptimo encontrado, explorando valores de C entre 1 y 100 y los kernels
              lineal, rbf y polinomial.
            </p>
            <div className="params-block">
              <div className="param-row">
                <span className="pr-key">kernel</span>
                <span className="pr-val pr-val--highlight">rbf</span>
                <span className="pr-reason">captura relaciones no lineales entre features morfológicas</span>
              </div>
              <div className="param-row">
                <span className="pr-key">C</span>
                <span className="pr-val pr-val--highlight">30</span>
                <span className="pr-reason">margen estrecho, alta penalización a errores de clasificación</span>
              </div>
              <div className="param-row">
                <span className="pr-key">gamma</span>
                <span className="pr-val pr-val--highlight">scale</span>
                <span className="pr-reason">1/(n_features × var(X)), se adapta automáticamente al escalado</span>
              </div>
              <div className="param-row">
                <span className="pr-key">split</span>
                <span className="pr-val">80 / 20</span>
                <span className="pr-reason">stratify=y para mantener proporción de clases en ambos sets</span>
              </div>
            </div>
          </div>
          <div className="col-chart">
            <p className="chart-label">Evolución de accuracy durante la búsqueda</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={HYPERPARAM_JOURNEY} margin={{ left: 0, right: 20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 9, fontFamily: 'monospace' }} />
                <YAxis domain={[91.8, 93]} tickFormatter={v => `${v}%`} tick={{ fill: '#4b5563', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', color:'#e8edf2' , border: '1px solid #1f2937', borderRadius: 8, fontFamily: 'monospace', fontSize: 12 }}
                  formatter={(v) => [`${v}%`, 'Accuracy']}
                  labelStyle={{ color: '#a3e635' }}
                />
                <ReferenceLine y={92.21} stroke="#374151" strokeDasharray="4 4" label={{ value: 'lineal base', fill: '#4b5563', fontSize: 10 }} />
                <Line type="monotone" dataKey="acc" stroke="#a3e635" strokeWidth={2} dot={{ fill: '#a3e635', r: 5 }} activeDot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── NO SUPERVISADO ── */}
      <section className="story-section">
        <div className="section-tag">04 · Contraste — Aprendizaje No Supervisado</div>
        <h2 className="section-title">¿Qué tan bien clustering sin etiquetas?</h2>
        <div className="two-col">
          <div className="col-text">
            <p>
              Para validar la elección del paradigma supervisado, se evaluaron tres algoritmos de
              clustering: K-Means, Agrupamiento Jerárquico y DBSCAN. La métrica principal fue el
              <strong> Adjusted Rand Index (ARI)</strong>: mide cuánto se parece la agrupación
              encontrada a las etiquetas reales, sin que el modelo las haya visto.
            </p>
            <p>
              El <strong>Jerárquico optimizado con GridSearch</strong> ganó con ARI 0.7054: sin acceso
              a ninguna etiqueta, reconstruye el 70% de la estructura real. Esto confirma que las
              features morfológicas son intrínsecamente discriminativas. Aun así, no se acerca al
              92.7% del SVM supervisado.
            </p>
            <div className="comparison-verdict">
              <div className="verdict-item">
                <span className="vi-label">Supervisado (SVM)</span>
                <span className="vi-metric">92.69% accuracy</span>
                <span className="vi-use">Producción · clasificación automática</span>
              </div>
              <div className="verdict-item">
                <span className="vi-label">No supervisado (Jerárquico)</span>
                <span className="vi-metric">ARI 0.7054</span>
                <span className="vi-use">Exploración · nuevas variedades</span>
              </div>
            </div>
          </div>
          <div className="col-chart">
            <p className="chart-label">ARI por algoritmo de clustering</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={UNSUPERVISED} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="model" tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis domain={[0, 0.8]} tickFormatter={v => v.toFixed(1)} tick={{ fill: '#4b5563', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', color:'#e8edf2' , border: '1px solid #1f2937', borderRadius: 8, fontFamily: 'monospace', fontSize: 12 }}
                  labelStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="ari" name="ARI" radius={[3, 3, 0, 0]}>
                  {UNSUPERVISED.map((d, i) => (
                    <Cell key={i} fill={d.model === 'Jerárquico' ? '#38bdf8' : '#374151'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="chart-note">ARI=1 sería agrupación perfecta. ARI=0 equivale a asignación aleatoria.</p>
          </div>
        </div>
      </section>

      {/* ── RESULTADOS EN VIVO ── */}
      <section className="story-section live-section">
        <div className="section-tag">05 · Métricas en vivo</div>
        <h2 className="section-title">Ejecuta el modelo y analiza los resultados</h2>
        <p className="section-desc">
          Cada ejecución corre el pipeline completo desde GitHub → StandardScaler → SVM (C=30, rbf, gamma=scale)
          → evaluación sobre el 20% de test. Las métricas pueden variar levemente por el split aleatorio.
        </p>

        <div className="train-zone">
          <TrainButton loading={loading} trainDots={trainDots} onTrain={onTrain} />
          {lastTrained && (
            <span className="last-trained-note">
              Resultado: <strong>{lastTrained}</strong>
              {metrics && <span className="ltn-acc"> · {(metrics.accuracy * 100).toFixed(2)}% accuracy</span>}
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
            {/* Hiperparámetros reales */}
            <div className="params-used">
              <span className="pu-label">Hiperparámetros del modelo entrenado</span>
              <div className="pu-chips">
                {Object.entries(metrics.params || {}).map(([k, v]) => (
                  <div key={k} className="pu-chip">
                    <span className="puc-key">{k}</span>
                    <span className="puc-val">{String(v)}</span>
                  </div>
                ))}
                <div className="pu-chip">
                  <span className="puc-key">n_train</span>
                  <span className="puc-val">{metrics.n_train?.toLocaleString()}</span>
                </div>
                <div className="pu-chip">
                  <span className="puc-key">n_test</span>
                  <span className="puc-val">{metrics.n_test?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* F1 por clase */}
            <div className="chart-block">
              <p className="chart-label">F1-Score por variedad (ordenado de mayor a menor)</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={f1Sorted} margin={{ left: 0, right: 20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis domain={[80, 101]} tickFormatter={v => `${v}%`} tick={{ fill: '#4b5563', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#111827', color: '#e8edf2', border: '1px solid #1f2937', borderRadius: 8, fontFamily: 'monospace', fontSize: 12 }}
                    labelStyle={{ color: '#a3e635' }}
                    formatter={(v, name, props) => {
                      const d = props.payload;
                      return [`F1: ${v}% | P: ${d.precision}% | R: ${d.recall}%`, d.name];
                    }}
                  />
                  <ReferenceLine y={metrics.f1_macro * 100} stroke="#374151" strokeDasharray="4 4" label={{ value: `media: ${(metrics.f1_macro*100).toFixed(1)}%`, fill: '#4b5563', fontSize: 10, position: 'right' }} />
                  <Bar dataKey="f1" radius={[4, 4, 0, 0]}>
                    {f1Sorted.map((d, i) => (
                      <Cell key={i} fill={d.f1 >= 99 ? '#a3e635' : d.f1 < 90 ? '#ef4444' : '#38bdf8'} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter precision vs recall */}
            <div className="chart-block">
              <p className="chart-label">Precision vs Recall — cada punto es una variedad</p>
              <p className="chart-sublabel">Ideal: esquina superior derecha (100%, 100%) · Tamaño del punto = soporte</p>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ left: 10, right: 30, top: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" dataKey="precision" name="Precision" domain={[85, 101]} unit="%" tick={{ fill: '#9ca3af', fontSize: 10 }} label={{ value: 'Precision (%)', position: 'insideBottom', offset: -10, fill: '#4b5563', fontSize: 11 }} />
                  <YAxis type="number" dataKey="recall" name="Recall" domain={[85, 101]} unit="%" tick={{ fill: '#9ca3af', fontSize: 10 }} label={{ value: 'Recall (%)', angle: -90, position: 'insideLeft', fill: '#4b5563', fontSize: 11 }} />
                  <ZAxis type="number" dataKey="support" range={[60, 250]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background: '#111827', color:'#e8edf2', border: '1px solid #1f2937', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>
                          <p style={{ color: '#a3e635', marginBottom: 4 }}>{d.name}</p>
                          <p style={{ color: '#9ca3af' }}>Precision: {d.precision}%</p>
                          <p style={{ color: '#9ca3af' }}>Recall: {d.recall}%</p>
                          <p style={{ color: '#9ca3af' }}>F1: {d.f1}%</p>
                          <p style={{ color: '#4b5563' }}>Soporte: {d.support} muestras</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={scatterData} fill="#38bdf8" opacity={0.8} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Reporte por clase */}
            <div className="chart-block">
              <p className="chart-label">Reporte de clasificación completo</p>
              <div className="class-report-scroll">
                <table className="class-report-table">
                  <thead>
                    <tr>
                      <th>Variedad</th>
                      <th>Precision</th>
                      <th>Recall</th>
                      <th>F1-Score</th>
                      <th>Soporte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.class_names.map(name => {
                      const r = metrics.classification_report[name];
                      return (
                        <tr key={name}>
                          <td className="cr-name">{name}</td>
                          <td><div className="cr-bar-wrap"><div className="cr-bar" style={{ width: `${r.precision * 100}%` }} /><span>{(r.precision * 100).toFixed(1)}%</span></div></td>
                          <td><div className="cr-bar-wrap"><div className="cr-bar" style={{ width: `${r.recall * 100}%` }} /><span>{(r.recall * 100).toFixed(1)}%</span></div></td>
                          <td><div className="cr-bar-wrap"><div className="cr-bar cr-bar--f1" style={{ width: `${r['f1-score'] * 100}%` }} /><span>{(r['f1-score'] * 100).toFixed(1)}%</span></div></td>
                          <td className="cr-support">{r.support}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Matriz de confusión */}
            <div className="chart-block">
              <p className="chart-label">Matriz de confusión</p>
              <p className="chart-sublabel">Verde = predicciones correctas (diagonal) · Rojo = errores · Hover para detalle</p>
              <ConfusionMatrix matrix={metrics.confusion_matrix} classNames={metrics.class_names} />
            </div>
          </>
        )}
      </section>

      <footer className="page-footer">
        <span>SVM kernel rbf · C=30 · gamma=scale · GridSearchCV 5-fold · sklearn pipeline</span>
        <span>Javier Sagredo · Cristian Romero · SCY1101 · 2025</span>
      </footer>
    </div>
  );
}
