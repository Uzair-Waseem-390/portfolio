import { useState, useEffect } from 'react'
import { useFramework } from '../../context/FrameworkContext'

const architectureBlocks = [
  {
    id: 'client', label: 'Client', color: '#4ade80',
    modal: { title: 'Client Layer', points: ['Browser or mobile app initiates HTTP requests', 'Handles token storage (localStorage / memory)', 'Manages request serialization and response parsing', 'Responsible for UI state and user feedback'] }
  },
  {
    id: 'api', label: 'API Layer', color: '#60a5fa',
    modal: { title: 'API Layer', points: ['Handles routing and URL dispatching', 'Validates incoming request headers and body', 'Applies authentication middleware (JWT)', 'Enforces rate limiting per endpoint'] }
  },
  {
    id: 'logic', label: 'Business Logic', color: '#a78bfa',
    modal: { title: 'Business Logic', points: ['Separation of concerns via service layer pattern', 'Orchestrates data flow between components', 'Contains domain rules and validation logic', 'Decoupled from HTTP and database concerns'] }
  },
  {
    id: 'orm', label: 'ORM', color: '#f59e0b',
    modal: { title: 'ORM Layer', points: ['Abstracts raw SQL into Python model objects', 'Manages model relationships (FK, M2M, O2O)', 'Query optimization via select_related / prefetch', 'Handles migrations and schema evolution'] }
  },
  {
    id: 'db', label: 'Database', color: '#f87171',
    modal: { title: 'Database (PostgreSQL)', points: ['Primary persistent data store (simulated)', 'Normalized schema — 3rd Normal Form', 'Indexed columns on high-query fields', 'Foreign key constraints enforced at DB level'] }
  },
  {
    id: 'cache', label: 'Cache', color: '#34d399',
    modal: { title: 'Cache Layer (Redis)', points: ['Used for read-heavy endpoint responses', 'Reduces redundant DB queries significantly', 'TTL-based invalidation strategy', 'Session storage and rate limit counters'] }
  },
  {
    id: 'worker', label: 'Worker', color: '#fb923c',
    modal: { title: 'Background Worker', points: ['Handles async tasks: email, notifications', 'AI job processing and long-running tasks', 'Celery (Django) / BackgroundTasks (FastAPI)', 'Decouples slow operations from request cycle'] }
  }
]

const metricsConfig = {
  django:  { totalEndpoints: 18, authProtected: 12, publicEndpoints: 6, dbTables: 7, indexedFields: 9, asyncEndpoints: 'N/A' },
  fastapi: { totalEndpoints: 18, authProtected: 12, publicEndpoints: 6, dbTables: 7, indexedFields: 9, asyncEndpoints: 5 }
}

export default function Dashboard({ setPage }) {
  const { mode } = useFramework()
  const [activeModal, setActiveModal] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const metrics = metricsConfig[mode]

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60)
    return () => clearTimeout(t)
  }, [])

  const envData = {
    django:  { framework: 'Django 4.2',    docStyle: 'Browsable API',   syncMode: 'Sync (WSGI)' },
    fastapi: { framework: 'FastAPI 0.110', docStyle: 'Auto Swagger UI', syncMode: 'Async (ASGI)' }
  }
  const env = envData[mode]

  return (
    <div className={`dashboard ${loaded ? 'page-loaded' : ''}`}>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">

          <div className="hero-info anim-item" style={{ '--delay': '0.05s' }}>
            <div className="hero-tag">SIMULATED PRODUCTION ENVIRONMENT</div>
            <h1 className="hero-title">Backend Lab</h1>
            <p className="hero-subtitle">
              Interactive API simulation environment showcasing backend engineering depth.
            </p>

            <div className="env-table">
              <div className="env-row"><span className="env-key">Framework Mode</span><span className="env-val framework-val">{env.framework}</span></div>
              <div className="env-row"><span className="env-key">Environment</span><span className="env-val green-val">Production</span></div>
              <div className="env-row"><span className="env-key">API Version</span><span className="env-val">v1.0</span></div>
              <div className="env-row"><span className="env-key">Database</span><span className="env-val">PostgreSQL <span className="simulated">(Simulated)</span></span></div>
              <div className="env-row"><span className="env-key">Cache</span><span className="env-val">Redis <span className="simulated">(Simulated)</span></span></div>
              <div className="env-row"><span className="env-key">Worker</span><span className="env-val green-val">Active</span></div>
              <div className="env-row"><span className="env-key">API Docs</span><span className="env-val">{env.docStyle}</span></div>
              <div className="env-row"><span className="env-key">Runtime</span><span className="env-val">{env.syncMode}</span></div>
            </div>

            <div className="hero-cta">
              <button className="btn-primary" onClick={() => setPage('playground')}>Enter API Playground</button>
              <button className="btn-secondary" onClick={() => setPage('architecture')}>View Architecture Decisions</button>
            </div>
          </div>

          <div className="hero-image-wrap anim-item" style={{ '--delay': '0.18s' }}>
            <div className="hero-image-frame">
              <img
                src="/src/assets/images/uzair.png"
                alt="Uzair Waseem"
                className="hero-image"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="hero-image-placeholder" style={{ display: 'none' }}>
                <span className="placeholder-initials">UW</span>
                <span className="placeholder-role">Backend Engineer</span>
              </div>
            </div>
            <div className="image-badge image-badge-1"><span className="badge-dot green"></span>System Online</div>
            <div className="image-badge image-badge-2"><span className="badge-dot blue"></span>{mode === 'django' ? 'Django Mode' : 'FastAPI Mode'}</div>
          </div>

        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="architecture-section">
        <div className="section-header anim-item" style={{ '--delay': '0.25s' }}>
          <div className="section-tag">SYSTEM ARCHITECTURE</div>
          <h2 className="section-title">Request Lifecycle Overview</h2>
          <p className="section-desc">Click any layer to explore its role in the system.</p>
        </div>

        <div className="arch-flow anim-item" style={{ '--delay': '0.33s' }}>
          {architectureBlocks.map((block, idx) => (
            <div key={block.id} className="arch-block-wrap">
              <button
                className="arch-block"
                style={{ '--block-color': block.color }}
                onClick={() => setActiveModal(block)}
              >
                <div className="arch-block-top">
                  <span className="arch-block-label">{block.label}</span>
                </div>
                <div className="arch-block-explore">explore →</div>
              </button>
              {idx < architectureBlocks.length - 1 && (
                <div className="arch-arrow">
                  <svg width="24" height="16" viewBox="0 0 24 16">
                    <path d="M0 8 H18 M14 3 L22 8 L14 13" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* METRICS */}
      <section className="metrics-section">
        <div className="section-header anim-item" style={{ '--delay': '0.4s' }}>
          <div className="section-tag">SYSTEM METRICS</div>
          <h2 className="section-title">Environment Statistics</h2>
        </div>

        <div className="metrics-grid anim-item" style={{ '--delay': '0.48s' }}>
          <div className="metric-card">
            <div className="metric-value">{metrics.totalEndpoints}</div>
            <div className="metric-label">Total Endpoints</div>
            <div className="metric-bar"><div className="metric-fill" style={{ width: '100%' }}></div></div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.authProtected}</div>
            <div className="metric-label">Auth Protected</div>
            <div className="metric-bar"><div className="metric-fill amber" style={{ width: '67%' }}></div></div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.publicEndpoints}</div>
            <div className="metric-label">Public Endpoints</div>
            <div className="metric-bar"><div className="metric-fill green" style={{ width: '33%' }}></div></div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.dbTables}</div>
            <div className="metric-label">DB Tables</div>
            <div className="metric-bar"><div className="metric-fill purple" style={{ width: '58%' }}></div></div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.indexedFields}</div>
            <div className="metric-label">Indexed Fields</div>
            <div className="metric-bar"><div className="metric-fill blue" style={{ width: '75%' }}></div></div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: mode === 'fastapi' ? '#60a5fa' : '#475569' }}>
              {metrics.asyncEndpoints}
            </div>
            <div className="metric-label">Async Endpoints</div>
            <div className="metric-bar">
              <div className="metric-fill blue" style={{ width: mode === 'fastapi' ? '28%' : '0%', transition: 'width 0.7s ease' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderColor: activeModal.color }}>
              <h3 className="modal-title" style={{ color: activeModal.color }}>{activeModal.modal.title}</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <ul className="modal-points">
              {activeModal.modal.points.map((point, i) => (
                <li key={i} className="modal-point">
                  <span className="point-bullet" style={{ color: activeModal.color }}>▸</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}