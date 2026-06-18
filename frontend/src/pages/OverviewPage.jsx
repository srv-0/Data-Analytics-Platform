export default function OverviewPage({ session, navigate }) {
  if (!session) return null

  const { filename, rows, columns, numeric_columns, categorical_columns, preview, column_names, missing_values } = session

  const totalMissing = Object.values(missing_values || {}).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="page-title">{filename}</div>
            <div className="page-sub">Dataset overview</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => navigate('analyze')}>Analyze →</button>
            <button className="btn btn-primary" onClick={() => navigate('predict')}>Run ML →</button>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <StatCard label="Rows" value={rows.toLocaleString()} />
        <StatCard label="Columns" value={columns} />
        <StatCard label="Numeric cols" value={numeric_columns?.length || 0} color="var(--accent)" />
        <StatCard label="Categorical cols" value={categorical_columns?.length || 0} color="var(--accent2)" />
        <StatCard label="Missing values" value={totalMissing} color={totalMissing > 0 ? 'var(--warn)' : 'var(--success)'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 12 }}>Numeric columns</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {numeric_columns?.length ? numeric_columns.map(c => (
              <span key={c} className="tag tag-blue">{c}</span>
            )) : <span style={{ color: 'var(--muted)', fontSize: 13 }}>None</span>}
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 12 }}>Categorical columns</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {categorical_columns?.length ? categorical_columns.map(c => (
              <span key={c} className="tag tag-green">{c}</span>
            )) : <span style={{ color: 'var(--muted)', fontSize: 13 }}>None</span>}
          </div>
        </div>
      </div>

      {missing_values && Object.values(missing_values).some(v => v > 0) && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(240,160,75,0.3)' }}>
          <div style={{ fontWeight: 500, marginBottom: 12 }}>Missing values per column</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(missing_values).filter(([, v]) => v > 0).map(([col, count]) => (
              <div key={col} style={{ fontSize: 12 }}>
                <span style={{ color: 'var(--muted)' }}>{col}: </span>
                <span style={{ color: 'var(--warn)', fontWeight: 500 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ fontWeight: 500, marginBottom: 16 }}>Data preview — first 5 rows</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>{column_names?.map(c => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {preview?.map((row, i) => (
                <tr key={i}>
                  {column_names?.map(c => <td key={c}>{row[c] === '' || row[c] == null ? <span style={{ color: 'var(--muted)' }}>—</span> : String(row[c])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
