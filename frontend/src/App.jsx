import { useState } from 'react'
import UploadPage from './pages/UploadPage'
import OverviewPage from './pages/OverviewPage'
import AnalyzePage from './pages/AnalyzePage'
import PredictPage from './pages/PredictPage'
import InsightsPage from './pages/InsightsPage'

const NAV = [
  { id: 'upload', label: 'Upload Data', icon: UploadIcon, section: 'Start' },
  { id: 'overview', label: 'Overview', icon: GridIcon, section: 'Explore' },
  { id: 'analyze', label: 'Analyze', icon: ChartIcon, section: 'Explore' },
  { id: 'insights', label: 'Auto Insights', icon: BulbIcon, section: 'Explore' },
  { id: 'predict', label: 'ML Predict', icon: BrainIcon, section: 'Machine Learning' },
]

export default function App() {
  const [page, setPage] = useState('upload')
  const [session, setSession] = useState(null)  // { id, filename, rows, columns, numeric_columns, categorical_columns, preview, column_names }

  const locked = (id) => id !== 'upload' && !session

  const pages = { upload: UploadPage, overview: OverviewPage, analyze: AnalyzePage, insights: InsightsPage, predict: PredictPage }
  const PageComponent = pages[page] || UploadPage

  const sections = [...new Set(NAV.map(n => n.section))]

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-logo">Data<span>Lens</span></div>
        {sections.map(sec => (
          <div key={sec}>
            <div className="nav-section-label">{sec}</div>
            {NAV.filter(n => n.section === sec).map(item => (
              <div
                key={item.id}
                className={`nav-item ${page === item.id ? 'active' : ''} ${locked(item.id) ? 'locked' : ''}`}
                onClick={() => !locked(item.id) && setPage(item.id)}
                style={{ opacity: locked(item.id) ? 0.35 : 1, cursor: locked(item.id) ? 'not-allowed' : 'pointer' }}
                title={locked(item.id) ? 'Upload a CSV first' : ''}
              >
                <item.icon />
                {item.label}
              </div>
            ))}
          </div>
        ))}
        {session && (
          <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Active dataset</div>
            <div style={{ fontSize: 12, color: 'var(--accent2)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.filename}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{session.rows.toLocaleString()} rows · {session.columns} cols</div>
          </div>
        )}
      </nav>
      <main className="main-content">
        <PageComponent session={session} setSession={setSession} navigate={setPage} />
      </main>
    </div>
  )
}

function UploadIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> }
function GridIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> }
function ChartIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
function BulbIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6H8.3A7 7 0 0112 2z"/></svg> }
function BrainIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5a3 3 0 00-5.996.142 4 4 0 00-2.526 5.77 4 4 0 00.556 6.588A4 4 0 1012 18z"/><path d="M12 5a3 3 0 015.996.142 4 4 0 012.526 5.77 4 4 0 01-.556 6.588A4 4 0 1112 18z"/><path d="M15 13a4.5 4.5 0 01-3-4 4.5 4.5 0 01-3 4"/><path d="M17.599 6.5a3 3 0 00.399-1.375M6.003 5.125A3 3 0 006.401 6.5"/><line x1="12" y1="9" x2="12" y2="18"/></svg> }
