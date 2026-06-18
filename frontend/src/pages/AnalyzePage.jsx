import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getStats, getDistribution, getCorrelation } from '../utils/api'

const COLORS = ['#6c8ef5','#4ecca3','#f0a04b','#e05c5c','#a78bfa','#f472b6','#34d399','#60a5fa']

export default function AnalyzePage({ session }) {
  const [stats, setStats] = useState(null)
  const [dists, setDists] = useState(null)
  const [corr, setCorr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeCol, setActiveCol] = useState(null)
  const [tab, setTab] = useState('distributions')

  useEffect(() => {
    if (!session) return
    setLoading(true)
    Promise.all([
      getStats(session.session_id),
      getDistribution(session.session_id),
      getCorrelation(session.session_id).catch(() => null),
    ]).then(([s, d, c]) => {
      setStats(s.data.statistics)
      setDists(d.data.distributions)
      if (c) setCorr(c.data)
      const cols = Object.keys(s.data.statistics)
      if (cols.length) setActiveCol(cols[0])
    }).finally(() => setLoading(false))
  }, [session?.session_id])

  if (!session) return null
  if (loading) return <Loader />

  const statCols = stats ? Object.keys(stats) : []
  const distCols = dists ? Object.keys(dists) : []

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Data analysis</div>
        <div className="page-sub">Distributions, statistics, and correlations</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['distributions', 'statistics', 'correlation'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'distributions' && dists && (
        <div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            {distCols.map(col => (
              <button key={col} className={`checkbox-pill ${activeCol === col ? 'selected' : ''}`} onClick={() => setActiveCol(col)}>
                {col}
              </button>
            ))}
          </div>
          {activeCol && dists[activeCol] && (
            <div className="card">
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{activeCol}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 16 }}>
                {dists[activeCol].type === 'histogram' ? 'Numeric distribution' : 'Category counts'}
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={buildChartData(dists[activeCol])}>
                  <XAxis dataKey="label" tick={{ fill: '#7b8197', fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#7b8197', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#181c24', border: '1px solid #2a2f3d', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {buildChartData(dists[activeCol]).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {tab === 'statistics' && stats && (
        <div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            {statCols.map(col => (
              <button key={col} className={`checkbox-pill ${activeCol === col ? 'selected' : ''}`} onClick={() => setActiveCol(col)}>
                {col}
              </button>
            ))}
          </div>
          {activeCol && stats[activeCol] && (
            <div className="card">
              <div style={{ fontWeight: 500, marginBottom: 16 }}>{activeCol} — statistics</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                {Object.entries(stats[activeCol]).map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 500, fontSize: 15 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'correlation' && corr && (
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 16 }}>Correlation matrix</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--mono)' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 12px', color: 'var(--muted)' }}></th>
                  {corr.columns.map(c => <th key={c} style={{ padding: '8px 12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {corr.matrix.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>{corr.columns[i]}</td>
                    {row.map((val, j) => (
                      <td key={j} style={{
                        padding: '8px 12px', textAlign: 'center',
                        background: corrColor(val), color: Math.abs(val) > 0.5 ? '#fff' : 'var(--text)',
                        borderRadius: 4
                      }}>
                        {val.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
            <span style={{ background: '#1a3a60', padding: '2px 8px', borderRadius: 4, marginRight: 8 }}>Blue = positive</span>
            <span style={{ background: '#3a1a1a', padding: '2px 8px', borderRadius: 4, marginRight: 8 }}>Red = negative</span>
            Strong correlation: |r| &gt; 0.7
          </div>
        </div>
      )}

      {tab === 'correlation' && !corr && (
        <div style={{ color: 'var(--muted)', padding: 20 }}>Need at least 2 numeric columns for correlation.</div>
      )}
    </div>
  )
}

function buildChartData(dist) {
  if (dist.type === 'histogram') {
    return dist.bins.map((b, i) => ({ label: b.toFixed(1), count: dist.counts[i] }))
  }
  return dist.labels.map((l, i) => ({ label: String(l), count: dist.counts[i] }))
}

function corrColor(val) {
  if (Math.abs(val) < 0.2) return 'transparent'
  if (val > 0) return `rgba(108,142,245,${Math.min(Math.abs(val), 0.9)})`
  return `rgba(224,92,92,${Math.min(Math.abs(val), 0.9)})`
}

function Loader() {
  return <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 40, color: 'var(--muted)' }}><div className="spinner" /> Loading analysis…</div>
}
