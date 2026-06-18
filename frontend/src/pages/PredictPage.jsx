import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts'
import { runPredict } from '../utils/api'

const TASKS = [
  { id: 'regression', label: 'Regression', desc: 'Predict a numeric value', icon: '📈' },
  { id: 'classification', label: 'Classification', desc: 'Predict a category', icon: '🏷️' },
  { id: 'clustering', label: 'Clustering', desc: 'Find natural groups', icon: '🔵' },
]

const COLORS = ['#6c8ef5','#4ecca3','#f0a04b','#e05c5c','#a78bfa']

export default function PredictPage({ session }) {
  const [task, setTask] = useState('regression')
  const [target, setTarget] = useState('')
  const [features, setFeatures] = useState([])
  const [nClusters, setNClusters] = useState(3)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  if (!session) return null

  const { numeric_columns = [], categorical_columns = [], column_names = [] } = session
  const allCols = column_names
  const toggleFeature = (col) => setFeatures(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])

  const canRun = features.length > 0 && (task === 'clustering' || target)

  const run = async () => {
    setLoading(true); setError(''); setResult(null)
    try {
      const payload = { target_column: target, feature_columns: features, task, n_clusters: nClusters }
      const { data } = await runPredict(session.session_id, payload)
      setResult(data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Prediction failed. Ensure columns have numeric data.')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">ML predict</div>
        <div className="page-sub">Run regression, classification, or clustering using Random Forest</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="form-label">Task type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TASKS.map(t => (
                <div key={t.id}
                  onClick={() => { setTask(t.id); setResult(null) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${task === t.id ? 'var(--accent)' : 'var(--border)'}`,
                    background: task === t.id ? 'rgba(108,142,245,0.1)' : 'var(--surface2)' }}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="form-group">
              <div className="form-label">Feature columns</div>
              <div className="checkbox-group">
                {allCols.map(col => (
                  <div key={col} className={`checkbox-pill ${features.includes(col) ? 'selected' : ''}`} onClick={() => toggleFeature(col)}>
                    {col}
                  </div>
                ))}
              </div>
            </div>

            {task !== 'clustering' && (
              <div className="form-group">
                <div className="form-label">Target column</div>
                <select value={target} onChange={e => setTarget(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select target…</option>
                  {allCols.filter(c => !features.includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {task === 'clustering' && (
              <div className="form-group">
                <div className="form-label">Number of clusters: {nClusters}</div>
                <input type="range" min={2} max={8} value={nClusters} onChange={e => setNClusters(+e.target.value)} style={{ width: '100%' }} />
              </div>
            )}

            <button className="btn btn-primary" onClick={run} disabled={!canRun || loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> Running…</> : 'Run model →'}
            </button>
            {error && <div style={{ marginTop: 10, color: 'var(--danger)', fontSize: 12 }}>{error}</div>}
          </div>
        </div>

        <div>
          {!result && !loading && (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--muted)', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
              <div style={{ fontWeight: 500, marginBottom: 6 }}>Configure and run a model</div>
              <div style={{ fontSize: 13 }}>Select features, a target column, and click Run model</div>
            </div>
          )}
          {loading && <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 40, color: 'var(--muted)' }}><div className="spinner" /> Training model…</div>}
          {result && <ResultPanel result={result} />}
        </div>
      </div>
    </div>
  )
}

function ResultPanel({ result }) {
  const { task } = result

  if (task === 'regression') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="stats-grid">
        <MetricCard label="R² score" value={(result.r2_score * 100).toFixed(1) + '%'} color={result.r2_score > 0.7 ? 'var(--success)' : 'var(--warn)'} />
        <MetricCard label="RMSE" value={result.rmse} />
        <MetricCard label="Train rows" value={result.train_size} />
        <MetricCard label="Test rows" value={result.test_size} />
      </div>
      <FeatureImportance data={result.feature_importance} />
      {result.scatter && (
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Predicted vs Actual</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Each point = one test sample</div>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <XAxis dataKey="x" name="Actual" tick={{ fill: '#7b8197', fontSize: 11 }} label={{ value: 'Actual', position: 'insideBottom', offset: -4, fill: '#7b8197', fontSize: 12 }} />
              <YAxis dataKey="y" name="Predicted" tick={{ fill: '#7b8197', fontSize: 11 }} label={{ value: 'Predicted', angle: -90, position: 'insideLeft', fill: '#7b8197', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#181c24', border: '1px solid #2a2f3d', borderRadius: 8, fontSize: 12 }} />
              <Scatter data={result.scatter.map(([x,y]) => ({x, y}))} fill="#6c8ef5" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )

  if (task === 'classification') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="stats-grid">
        <MetricCard label="Accuracy" value={(result.accuracy * 100).toFixed(1) + '%'} color={result.accuracy > 0.8 ? 'var(--success)' : 'var(--warn)'} />
        <MetricCard label="Classes" value={result.classes?.length} />
        <MetricCard label="Train rows" value={result.train_size} />
        <MetricCard label="Test rows" value={result.test_size} />
      </div>
      <FeatureImportance data={result.feature_importance} />
    </div>
  )

  if (task === 'clustering') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="stats-grid">
        <MetricCard label="Clusters" value={result.n_clusters} color="var(--accent)" />
        <MetricCard label="Silhouette score" value={result.silhouette_score?.toFixed(3)} color={result.silhouette_score > 0.5 ? 'var(--success)' : 'var(--warn)'} />
      </div>
      <div className="card">
        <div style={{ fontWeight: 500, marginBottom: 16 }}>Cluster sizes</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={Object.entries(result.cluster_sizes).map(([k,v]) => ({ name: `Cluster ${k}`, count: v }))}>
            <XAxis dataKey="name" tick={{ fill: '#7b8197', fontSize: 12 }} />
            <YAxis tick={{ fill: '#7b8197', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#181c24', border: '1px solid #2a2f3d', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" radius={[4,4,0,0]}>
              {Object.keys(result.cluster_sizes).map((_, i) => <Cell key={i} fill={['#6c8ef5','#4ecca3','#f0a04b','#e05c5c','#a78bfa'][i % 5]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  return null
}

function FeatureImportance({ data }) {
  if (!data) return null
  const sorted = Object.entries(data).sort((a,b) => b[1]-a[1])
  return (
    <div className="card">
      <div style={{ fontWeight: 500, marginBottom: 16 }}>Feature importance</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map(([col, val], i) => (
          <div key={col}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span>{col}</span>
              <span style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{(val * 100).toFixed(1)}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3 }}>
              <div style={{ height: '100%', width: `${val * 100}%`, background: ['#6c8ef5','#4ecca3','#f0a04b','#e05c5c','#a78bfa'][i%5], borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ fontSize: 20, color: color || 'var(--text)' }}>{value}</div>
    </div>
  )
}
