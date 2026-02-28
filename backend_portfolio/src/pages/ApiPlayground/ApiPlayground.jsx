import { useState, useEffect, useRef } from 'react'
import { useFramework } from '../../context/FrameworkContext'
import { endpoints, getEndpointsByCategory } from '../../modules/mockData/endpoints.js'
import { simulateRequest, simulateHighLoad } from '../../modules/apiEngine/simulateRequest.js'

const METHOD_COLORS = {
  GET:    { bg: 'rgba(74,222,128,0.1)',  border: '#4ade80', text: '#4ade80' },
  POST:   { bg: 'rgba(96,165,250,0.1)',  border: '#60a5fa', text: '#60a5fa' },
  PUT:    { bg: 'rgba(251,146,60,0.1)',  border: '#fb923c', text: '#fb923c' },
  PATCH:  { bg: 'rgba(167,139,250,0.1)', border: '#a78bfa', text: '#a78bfa' },
  DELETE: { bg: 'rgba(248,113,113,0.1)', border: '#f87171', text: '#f87171' },
}

const STATUS_COLORS = {
  200: '#4ade80', 201: '#4ade80',
  400: '#f59e0b', 401: '#f87171', 403: '#f87171', 404: '#fb923c',
  429: '#a78bfa', 500: '#f87171'
}

function MethodBadge({ method }) {
  const c = METHOD_COLORS[method] || METHOD_COLORS.GET
  return (
    <span className="method-badge" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {method}
    </span>
  )
}

function JsonViewer({ data, raw }) {
  const str = JSON.stringify(data, null, raw ? 0 : 2)
  if (raw) return <pre className="json-raw">{str}</pre>

  // Syntax highlight
  const highlighted = str.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-num'
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-str'
      } else if (/true|false/.test(match)) {
        cls = 'json-bool'
      } else if (/null/.test(match)) {
        cls = 'json-null'
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
  return <pre className="json-pretty" dangerouslySetInnerHTML={{ __html: highlighted }} />
}

// ── FLOW DIAGRAM ────────────────────────────────────────────────────
function FlowDiagram({ steps }) {
  return (
    <div className="flow-diagram">
      {steps.map((step, i) => (
        <div key={i} className="flow-step-wrap">
          <div className="flow-step">{step}</div>
          {i < steps.length - 1 && <div className="flow-arrow">↓</div>}
        </div>
      ))}
    </div>
  )
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────
export default function ApiPlayground() {
  const { mode } = useFramework()
  const [grouped] = useState(() => getEndpointsByCategory())
  const [openCats, setOpenCats] = useState({ Authentication: true })
  const [selectedId, setSelectedId] = useState('auth-login')
  const [activeTab, setActiveTab] = useState('request')
  const [bodyText, setBodyText] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rawView, setRawView] = useState(false)
  const [highLoad, setHighLoad] = useState(false)
  const [highLoadMetrics, setHighLoadMetrics] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const selectedEndpoint = endpoints.find(e => e.id === selectedId)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (selectedEndpoint) {
      setBodyText(selectedEndpoint.defaultBody)
      setResponse(null)
      setActiveTab('request')
      setHighLoad(false)
      setHighLoadMetrics(null)
    }
  }, [selectedId])

  // Reset response when framework mode changes
  useEffect(() => {
    setResponse(null)
    setHighLoad(false)
    setHighLoadMetrics(null)
  }, [mode])

  function toggleCat(cat) {
    setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  function handleSend() {
    setLoading(true)
    setResponse(null)
    setTimeout(() => {
      const result = simulateRequest(selectedId, bodyText, mode)
      setResponse(result)
      setActiveTab('response')
      setLoading(false)
    }, 320)
  }

  function handleHighLoad() {
    const m = simulateHighLoad(selectedId, mode)
    setHighLoad(true)
    setHighLoadMetrics(m)
  }

  const tabs = ['Request', 'Response', 'Database', 'Performance', 'Security', 'Flow']
  const perf = selectedEndpoint?.performance[mode]

  return (
    <div className={`playground ${loaded ? 'page-loaded' : ''}`}>

      {/* Page header */}
      <div className="pg-header anim-item" style={{ '--delay': '0.05s' }}>
        <div className="section-tag">API PLAYGROUND</div>
        <h1 className="pg-title">Interactive Endpoint Explorer</h1>
        <p className="pg-subtitle">
          Simulate requests, inspect DB impact, analyze performance &amp; security decisions.
          <span className="mode-pill">{mode === 'django' ? '⚙ Django Mode' : '⚡ FastAPI Mode'}</span>
        </p>
      </div>

      {/* 3-col layout */}
      <div className="pg-layout anim-item" style={{ '--delay': '0.12s' }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside className="pg-sidebar">
          <div className="sidebar-label">ENDPOINTS</div>
          {Object.entries(grouped).map(([cat, eps]) => (
            <div key={cat} className="cat-group">
              <button className="cat-header" onClick={() => toggleCat(cat)}>
                <span className="cat-name">{cat}</span>
                <span className="cat-count">{eps.length}</span>
                <span className={`cat-chevron ${openCats[cat] ? 'open' : ''}`}>›</span>
              </button>
              {openCats[cat] && (
                <div className="cat-endpoints">
                  {eps.map(ep => (
                    <button
                      key={ep.id}
                      className={`ep-item ${selectedId === ep.id ? 'active' : ''}`}
                      onClick={() => setSelectedId(ep.id)}
                    >
                      <MethodBadge method={ep.method} />
                      <span className="ep-path">{ep.path.replace('/api/v1', '')}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* ── CENTER + RIGHT ── */}
        <div className="pg-main">

          {selectedEndpoint && (
            <>
              {/* Endpoint metadata */}
              <div className="ep-meta">
                <div className="ep-meta-top">
                  <MethodBadge method={selectedEndpoint.method} />
                  <code className="ep-url">{selectedEndpoint.path}</code>
                  {selectedEndpoint.requiresAuth && (
                    <span className="auth-badge">🔒 Auth Required</span>
                  )}
                </div>
                <p className="ep-summary">{selectedEndpoint.summary}</p>
                <div className="ep-pills">
                  <span className="ep-pill">Rate: {selectedEndpoint.rateLimit}</span>
                  <span className="ep-pill">Content-Type: {selectedEndpoint.contentType}</span>
                  <span className="ep-pill">Idempotent: {selectedEndpoint.idempotent ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="tab-bar">
                {tabs.map(t => (
                  <button
                    key={t}
                    className={`tab-btn ${activeTab === t.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setActiveTab(t.toLowerCase())}
                  >
                    {t}
                    {t === 'Response' && response && (
                      <span
                        className="tab-status-dot"
                        style={{ background: STATUS_COLORS[response.status] || '#7a95b0' }}
                      ></span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── REQUEST TAB ── */}
              {activeTab === 'request' && (
                <div className="tab-content">
                  <div className="req-headers-display">
                    <div className="mini-label">REQUEST HEADERS</div>
                    <div className="header-rows">
                      <div className="header-row">
                        <span className="hdr-key">Content-Type</span>
                        <span className="hdr-val">application/json</span>
                      </div>
                      {selectedEndpoint.requiresAuth && (
                        <div className="header-row">
                          <span className="hdr-key">Authorization</span>
                          <span className="hdr-val">Bearer &lt;your_token&gt;</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedEndpoint.method !== 'GET' && (
                    <>
                      <div className="mini-label" style={{ marginTop: '1.25rem' }}>REQUEST BODY</div>
                      <textarea
                        className="body-editor"
                        value={bodyText}
                        onChange={e => setBodyText(e.target.value)}
                        spellCheck={false}
                        rows={10}
                      />
                    </>
                  )}

                  {selectedEndpoint.method === 'GET' && (
                    <div className="get-note">
                      <span className="get-note-icon">ℹ</span>
                      GET requests do not require a body. Authentication header is injected automatically if required.
                    </div>
                  )}

                  <div className="req-actions">
                    <button
                      className={`btn-send ${loading ? 'loading' : ''}`}
                      onClick={handleSend}
                      disabled={loading}
                    >
                      {loading ? (
                        <><span className="spinner"></span> Simulating...</>
                      ) : (
                        <>▶ Send Request</>
                      )}
                    </button>
                  </div>

                  <div className="validation-guide">
                    <div className="mini-label">SIMULATION RULES</div>
                    <div className="sim-rules">
                      <div className="sim-rule"><span className="rule-code">400</span>Missing required fields</div>
                      <div className="sim-rule"><span className="rule-code">401</span>Wrong credentials (login only)</div>
                      <div className="sim-rule"><span className="rule-code">200</span>Valid input → success response</div>
                      {mode === 'django' ? (
                        <div className="sim-rule mode-note"><span className="rule-code django">Django</span>Array-style validation errors</div>
                      ) : (
                        <div className="sim-rule mode-note"><span className="rule-code fastapi">FastAPI</span>Pydantic detail array errors</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── RESPONSE TAB ── */}
              {activeTab === 'response' && (
                <div className="tab-content">
                  {!response ? (
                    <div className="no-response">
                      <div className="no-response-icon">◎</div>
                      <p>No response yet. Send a request from the Request tab.</p>
                    </div>
                  ) : (
                    <>
                      <div className="res-meta">
                        <div className="res-status" style={{ color: STATUS_COLORS[response.status] || '#e2eaf4' }}>
                          <span className="res-status-num">{response.status}</span>
                          <span className="res-status-text">{response.status === 200 ? 'OK' : response.status === 400 ? 'Bad Request' : response.status === 401 ? 'Unauthorized' : response.status === 404 ? 'Not Found' : 'Error'}</span>
                        </div>
                        <div className="res-timing">
                          <span className="timing-val">{response.responseTime}ms</span>
                          <span className="timing-label">Response Time</span>
                        </div>
                        <button className="raw-toggle" onClick={() => setRawView(r => !r)}>
                          {rawView ? 'Formatted' : 'Raw'}
                        </button>
                      </div>

                      <div className="mini-label" style={{ marginBottom: '0.5rem' }}>RESPONSE HEADERS</div>
                      <div className="header-rows" style={{ marginBottom: '1.25rem' }}>
                        {Object.entries(response.headers).map(([k, v]) => (
                          <div key={k} className="header-row">
                            <span className="hdr-key">{k}</span>
                            <span className="hdr-val">{v}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mini-label" style={{ marginBottom: '0.5rem' }}>RESPONSE BODY</div>
                      <div className="json-box">
                        <JsonViewer data={response.body} raw={rawView} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── DATABASE TAB ── */}
              {activeTab === 'database' && (
                <div className="tab-content">
                  <div className="mini-label">TABLES ACCESSED</div>
                  <div className="db-tables">
                    {selectedEndpoint.database.tables.map((t, i) => (
                      <div key={i} className="db-table-card">
                        <div className="db-table-header">
                          <span className="db-table-icon">⬡</span>
                          <span className="db-table-name">{t.name}</span>
                        </div>
                        <div className="db-ops">
                          {t.ops.map((op, j) => (
                            <span key={j} className="db-op-tag">{op}</span>
                          ))}
                        </div>
                        <p className="db-reason">{t.reason}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mini-label" style={{ marginTop: '1.5rem' }}>INDEXES USED</div>
                  <div className="index-list">
                    {selectedEndpoint.database.indexes.map((idx, i) => (
                      <div key={i} className="index-item">
                        <span className="index-icon">⚡</span>
                        <code className="index-name">{idx}</code>
                      </div>
                    ))}
                  </div>

                  <div className="mini-label" style={{ marginTop: '1.5rem' }}>RELATIONSHIPS</div>
                  <div className="relationship-box">
                    <code className="relationship-text">{selectedEndpoint.database.relationships}</code>
                  </div>

                  {/* Project structure changes per mode */}
                  <div className="mini-label" style={{ marginTop: '1.5rem' }}>PROJECT STRUCTURE ({mode.toUpperCase()})</div>
                  <div className="json-box">
                    <pre className="json-raw" style={{ fontSize: '12px', lineHeight: 1.8 }}>
                      {mode === 'django' ? `project/
  apps/
    ${selectedEndpoint.category.toLowerCase()}/
      models.py
      serializers.py
      views.py
      urls.py
  settings/
    base.py
  urls.py` : `app/
  routers/
    ${selectedEndpoint.category.toLowerCase()}.py
  models.py
  schemas.py
  dependencies.py
  main.py`}
                    </pre>
                  </div>
                </div>
              )}

              {/* ── PERFORMANCE TAB ── */}
              {activeTab === 'performance' && (
                <div className="tab-content">
                  <div className="perf-grid">
                    <div className="perf-card">
                      <div className="perf-val">{highLoad ? highLoadMetrics?.queries : perf?.queries}</div>
                      <div className="perf-key">DB Queries</div>
                    </div>
                    <div className="perf-card">
                      <div className="perf-val" style={{ color: perf?.cache ? '#4ade80' : '#f87171' }}>
                        {highLoad ? 'Miss' : (perf?.cache ? 'Hit' : 'Miss')}
                      </div>
                      <div className="perf-key">Cache</div>
                    </div>
                    <div className="perf-card">
                      <div className="perf-val">{highLoad ? `${highLoadMetrics?.avgMs}ms` : `${perf?.avgMs}ms`}</div>
                      <div className="perf-key">Avg Response</div>
                    </div>
                    <div className="perf-card">
                      <div className="perf-val">{highLoad ? `${highLoadMetrics?.coldMs}ms` : `${perf?.coldMs}ms`}</div>
                      <div className="perf-key">Cold Start</div>
                    </div>
                  </div>

                  <div className="perf-notes">
                    <div className="perf-note-item">
                      <span className="perf-note-icon" style={{ color: '#60a5fa' }}>⬡</span>
                      <span>
                        {mode === 'django'
                          ? 'Sync views (unless async explicitly enabled with async def)'
                          : 'Async endpoints supported natively via async def + await'}
                      </span>
                    </div>
                    <div className="perf-note-item">
                      <span className="perf-note-icon" style={{ color: '#a78bfa' }}>⬡</span>
                      <span>
                        {mode === 'django'
                          ? 'ORM query count tracked via Django Debug Toolbar in dev'
                          : 'SQLAlchemy async sessions used for non-blocking DB calls'}
                      </span>
                    </div>
                  </div>

                  <button
                    className={`btn-high-load ${highLoad ? 'active' : ''}`}
                    onClick={handleHighLoad}
                  >
                    {highLoad ? '🔴 High Load Simulated' : '⚡ Simulate High Load'}
                  </button>

                  {highLoad && (
                    <div className="high-load-note">
                      Under high load: DB connections spike, cache misses increase, response latency degrades significantly.
                      <strong> Solution: Redis caching, DB connection pooling, async workers.</strong>
                    </div>
                  )}
                </div>
              )}

              {/* ── SECURITY TAB ── */}
              {activeTab === 'security' && (
                <div className="tab-content">
                  <div className="security-list">
                    {selectedEndpoint.security.map((s, i) => (
                      <div key={i} className="security-card">
                        <div className="security-title">
                          <span className="security-icon">🔒</span>
                          {s.title}
                        </div>
                        <p className="security-body">{s.body}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mini-label" style={{ marginTop: '1.5rem' }}>FRAMEWORK BEHAVIOR</div>
                  <div className="framework-diff">
                    <div className="fw-diff-row">
                      <span className="fw-label django-label">Django</span>
                      <span className="fw-val">DRF throttling via DEFAULT_THROTTLE_CLASSES</span>
                    </div>
                    <div className="fw-diff-row">
                      <span className="fw-label fastapi-label">FastAPI</span>
                      <span className="fw-val">slowapi / custom middleware for rate limiting</span>
                    </div>
                    <div className="fw-diff-row">
                      <span className="fw-label django-label">Django</span>
                      <span className="fw-val">IsAuthenticated + custom permission classes</span>
                    </div>
                    <div className="fw-diff-row">
                      <span className="fw-label fastapi-label">FastAPI</span>
                      <span className="fw-val">Depends(get_current_user) dependency injection</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── FLOW TAB ── */}
              {activeTab === 'flow' && (
                <div className="tab-content">
                  <p className="flow-desc">
                    Request lifecycle for <code>{selectedEndpoint.path}</code>
                  </p>
                  <FlowDiagram steps={selectedEndpoint.flow} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}