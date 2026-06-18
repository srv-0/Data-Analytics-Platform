import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadCSV } from '../utils/api'

export default function UploadPage({ session, setSession, navigate }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (files) => {
    const file = files[0]
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const { data } = await uploadCSV(file)
      setSession({ ...data, filename: file.name })
      navigate('overview')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Upload failed. Check the file and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'] }, maxFiles: 1, disabled: loading
  })

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Upload your dataset</div>
        <div className="page-sub">Drop a CSV file to get instant analysis, charts, and ML predictions</div>
      </div>

      <div style={{ maxWidth: 560 }}>
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 14, padding: '60px 40px', textAlign: 'center', cursor: 'pointer',
            background: isDragActive ? 'rgba(108,142,245,0.06)' : 'var(--surface)',
            transition: 'all 0.2s',
          }}
        >
          <input {...getInputProps()} />
          <div style={{ fontSize: 40, marginBottom: 16 }}>📂</div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div className="spinner" />
              <div style={{ color: 'var(--muted)' }}>Parsing your file…</div>
            </div>
          ) : isDragActive ? (
            <div style={{ color: 'var(--accent)', fontWeight: 500 }}>Drop it here</div>
          ) : (
            <>
              <div style={{ fontWeight: 500, marginBottom: 6 }}>Drag & drop a CSV file</div>
              <div style={{ color: 'var(--muted)', marginBottom: 16 }}>or click to browse</div>
              <span className="btn btn-ghost" style={{ fontSize: 12 }}>Choose file</span>
            </>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(224,92,92,0.1)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', fontSize: 13 }}>
            {error}
          </div>
        )}

        {session && (
          <div style={{ marginTop: 20 }} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 500 }}>{session.filename}</div>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
                  {session.rows.toLocaleString()} rows · {session.columns} columns
                </div>
              </div>
              <span className="tag tag-green">Loaded</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => navigate('overview')}>View overview →</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          {/* <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 12 }}>Try with a sample dataset:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Iris (classification)', 'House prices (regression)', 'Customer data (clustering)'].map(s => (
              <span key={s} className="tag tag-blue" style={{ cursor: 'default' }}>{s}</span>
            ))}
          </div> */}
          <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
            Download any CSV from <a href="https://www.kaggle.com/datasets" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>Kaggle</a> or use <a href="https://archive.ics.uci.edu/datasets" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>UCI ML Repository</a>.
          </div>
        </div>
      </div>
    </div>
  )
}
