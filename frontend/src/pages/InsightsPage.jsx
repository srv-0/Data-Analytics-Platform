import { useState, useEffect } from 'react'
import { getInsights } from '../utils/api'

const TYPE_STYLE = {
  success: { bg: 'rgba(78,204,163,0.08)', border: 'rgba(78,204,163,0.3)', icon: '✅', color: 'var(--success)' },
  warning: { bg: 'rgba(240,160,75,0.08)', border: 'rgba(240,160,75,0.3)', icon: '⚠️', color: 'var(--warn)' },
  info:    { bg: 'rgba(108,142,245,0.08)', border: 'rgba(108,142,245,0.3)', icon: '💡', color: 'var(--accent)' },
  danger:  { bg: 'rgba(224,92,92,0.08)', border: 'rgba(224,92,92,0.3)', icon: '🔴', color: 'var(--danger)' },
}

export default function InsightsPage({ session }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    setLoading(true)
    getInsights(session.session_id)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [session?.session_id])

  if (!session) return null
  if (loading) return <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 40, color: 'var(--muted)' }}><div className="spinner" /> Generating insights…</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Auto insights</div>
        <div className="page-sub">Automatically detected patterns, warnings, and opportunities in your data</div>
      </div>

      {data?.summary && (
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <StatCard label="Rows" value={data.summary.rows.toLocaleString()} />
          <StatCard label="Columns" value={data.summary.columns} />
          <StatCard label="Numeric" value={data.summary.numeric_cols} color="var(--accent)" />
          <StatCard label="Categorical" value={data.summary.categorical_cols} color="var(--accent2)" />
          <StatCard label="Missing cells" value={data.summary.total_missing} color={data.summary.total_missing > 0 ? 'var(--warn)' : 'var(--success)'} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {data?.insights?.map((ins, i) => {
          const s = TYPE_STYLE[ins.type] || TYPE_STYLE.info
          return (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '16px 20px', display: 'flex', gap: 14 }}>
              <div style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 500, color: s.color, marginBottom: 4 }}>{ins.title}</div>
                <div style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.6 }}>{ins.detail}</div>
              </div>
            </div>
          )
        })}
      </div>

      {data?.total_insights === 0 && (
        <div style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>No insights generated. Try a larger dataset.</div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: color || 'var(--text)' }}>{value}</div>
    </div>
  )
}
