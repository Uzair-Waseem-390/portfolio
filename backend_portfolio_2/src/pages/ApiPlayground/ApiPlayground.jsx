import { useState, useEffect, useRef } from 'react'
import { useFramework } from '../../context/FrameworkContext'
import { endpointsByCategory, categories, endpoints } from '../../modules/mockData/endpoints'
import { simulateRequest } from '../../modules/apiEngine/simulateRequest'

// ─── Helpers ─────────────────────────────────────────────────
const METHOD_COLORS = {
  GET: 'text-emerald-400 bg-emerald-950/40 border-emerald-800',
  POST: 'text-blue-400 bg-blue-950/40 border-blue-800',
  PATCH: 'text-yellow-400 bg-yellow-950/40 border-yellow-800',
  PUT: 'text-orange-400 bg-orange-950/40 border-orange-800',
  DELETE: 'text-red-400 bg-red-950/40 border-red-800',
}

const STATUS_COLORS = {
  200: 'text-emerald-400',
  201: 'text-emerald-400',
  202: 'text-emerald-400',
  400: 'text-yellow-400',
  401: 'text-red-400',
  403: 'text-red-400',
  404: 'text-orange-400',
  429: 'text-purple-400',
  500: 'text-red-500',
}

function JsonDisplay({ data, raw }) {
  const str = JSON.stringify(data, null, raw ? 0 : 2)
  if (raw) return <pre className="text-xs font-mono text-gray-300 break-all whitespace-pre-wrap">{str}</pre>

  // Syntax highlight
  const highlighted = str
    .replace(/(".*?")\s*:/g, '<span class="text-blue-300">$1</span>:')
    .replace(/:\s*(".*?")/g, ': <span class="text-emerald-300">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-yellow-300">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="text-purple-300">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="text-gray-500">$1</span>')

  return (
    <pre
      className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all leading-5"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

// ─── Login Gate Banner ────────────────────────────────────────
function LoginGateBanner({ onGoToLogin }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-800 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <p className="text-sm font-mono text-red-400 mb-1">Authentication Required</p>
      <p className="text-xs font-mono text-gray-500 mb-5 max-w-xs">
        You must run <span className="text-white">POST /auth/login</span> first to obtain a JWT token before accessing protected endpoints.
      </p>
      <button
        onClick={onGoToLogin}
        className="text-xs font-mono px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
      >
        Go to Login Endpoint →
      </button>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────
const TABS = ['Request', 'Response', 'Database', 'Performance', 'Security', 'Flow']

function TabBar({ active, onChange }) {
  return (
    <div className="flex border-b border-gray-800 overflow-x-auto shrink-0">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`shrink-0 px-3 py-2.5 text-xs font-mono border-b-2 transition-colors ${
            active === tab
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ─── Request Tab ──────────────────────────────────────────────
function RequestTab({ endpoint, mode, isLoggedIn, onSend, loading }) {
  const [body, setBody] = useState('')
  const [jsonError, setJsonError] = useState(null)

  useEffect(() => {
    setBody(JSON.stringify(endpoint.requestSchema, null, 2))
    setJsonError(null)
  }, [endpoint.id])

  function handleChange(val) {
    setBody(val)
    try {
      JSON.parse(val)
      setJsonError(null)
    } catch {
      setJsonError('Invalid JSON')
    }
  }

  function handleSend() {
    let parsed = {}
    try { parsed = JSON.parse(body) } catch { return }
    onSend(parsed)
  }

  const requiresAuth = endpoint.requiresAuth
  const isLoginEndpoint = endpoint.isLoginEndpoint

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Auth status pill */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${requiresAuth ? 'text-red-400 border-red-800 bg-red-950/30' : 'text-gray-400 border-gray-700'}`}>
          {requiresAuth ? '🔐 Auth Required' : '🌐 Public'}
        </span>
        <span className="text-xs font-mono text-gray-600 border border-gray-800 px-2 py-0.5 rounded">
          Rate: {endpoint.rateLimit}
        </span>
        <span className="text-xs font-mono text-gray-600 border border-gray-800 px-2 py-0.5 rounded">
          {endpoint.idempotent ? 'Idempotent' : 'Non-idempotent'}
        </span>
      </div>

      {/* Auto headers preview */}
      <div>
        <p className="text-xs font-mono text-gray-500 mb-1.5">Request Headers (auto)</p>
        <div className="bg-gray-900 border border-gray-800 rounded p-3 space-y-1">
          <div className="flex text-xs font-mono gap-4">
            <span className="text-gray-600">Content-Type:</span>
            <span className="text-gray-400">application/json</span>
          </div>
          {(isLoggedIn || requiresAuth) && (
            <div className="flex text-xs font-mono gap-4">
              <span className="text-gray-600">Authorization:</span>
              <span className={isLoggedIn ? 'text-emerald-400' : 'text-red-400'}>
                {isLoggedIn ? 'Bearer eyJhbGci... (JWT)' : 'Bearer <not set>'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Body editor — hide if no schema */}
      {Object.keys(endpoint.requestSchema).length > 0 && (
        <div>
          <p className="text-xs font-mono text-gray-500 mb-1.5">Request Body</p>
          <div className="relative">
            <textarea
              value={body}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded p-3 text-xs font-mono text-gray-300 focus:outline-none focus:border-gray-600 resize-none leading-5"
              rows={Math.min(12, body.split('\n').length + 1)}
              spellCheck={false}
            />
            {jsonError && (
              <p className="text-xs font-mono text-red-400 mt-1">⚠ {jsonError}</p>
            )}
          </div>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={loading || !!jsonError}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-mono transition-all duration-150 ${
          loading || jsonError
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
            : isLoginEndpoint
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
            : !isLoggedIn && requiresAuth
            ? 'bg-red-900/50 border border-red-800 text-red-400 hover:bg-red-900'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}
      >
        {loading ? (
          <>
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send Request
          </>
        )}
      </button>
    </div>
  )
}

// ─── Response Tab ─────────────────────────────────────────────
function ResponseTab({ result }) {
  const [raw, setRaw] = useState(false)

  if (!result) {
    return (
      <div className="flex items-center justify-center h-48 text-xs font-mono text-gray-600">
        Hit "Send Request" to see the response
      </div>
    )
  }

  const statusColor = STATUS_COLORS[result.status] || 'text-gray-400'

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Status bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-lg font-mono font-bold ${statusColor}`}>{result.status}</span>
        <span className="text-xs font-mono text-gray-500">{result.responseTime}ms</span>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`${!raw ? 'text-white' : 'text-gray-500'}`}>Pretty</span>
          <button
            onClick={() => setRaw(!raw)}
            className={`w-8 h-4 rounded-full transition-colors relative ${raw ? 'bg-emerald-600' : 'bg-gray-700'}`}
          >
            <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${raw ? 'left-4' : 'left-0.5'}`} />
          </button>
          <span className={`${raw ? 'text-white' : 'text-gray-500'}`}>Raw</span>
        </div>
      </div>

      {/* Headers */}
      <div>
        <p className="text-xs font-mono text-gray-500 mb-1.5">Response Headers</p>
        <div className="bg-gray-900 border border-gray-800 rounded p-3 space-y-1">
          {Object.entries(result.headers || {}).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="flex text-xs font-mono gap-3 flex-wrap">
              <span className="text-gray-600 shrink-0">{k}:</span>
              <span className="text-gray-400 break-all">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div>
        <p className="text-xs font-mono text-gray-500 mb-1.5">Response Body</p>
        <div className="bg-gray-900 border border-gray-800 rounded p-3 overflow-auto max-h-72">
          <JsonDisplay data={result.body} raw={raw} />
        </div>
      </div>

      {result.note === 'auth_required' && (
        <p className="text-xs font-mono text-red-400/80 bg-red-950/20 border border-red-900 rounded p-2">
          💡 Run POST /auth/login first to obtain a JWT token, then retry.
        </p>
      )}
    </div>
  )
}

// ─── Database Tab ─────────────────────────────────────────────
function DatabaseTab({ endpoint }) {
  const db = endpoint.databaseImpact
  return (
    <div className="p-4 space-y-5">
      <div>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Tables Accessed</p>
        <div className="flex flex-wrap gap-2">
          {db.tables.map((t) => (
            <span key={t} className="text-xs font-mono text-purple-400 border border-purple-800 bg-purple-950/30 px-2 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">SQL Operations</p>
        <div className="space-y-2">
          {db.operations.map((op, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded p-3">
              <span className={`text-xs font-mono font-bold mr-2 ${
                op.op.includes('SELECT') ? 'text-blue-400'
                : op.op.includes('INSERT') ? 'text-emerald-400'
                : op.op.includes('UPDATE') ? 'text-yellow-400'
                : 'text-red-400'
              }`}>{op.op}</span>
              <span className="text-xs font-mono text-gray-400">{op.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Indexes Used</p>
        {db.indexes.map((idx, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-mono text-gray-400 py-1 border-b border-gray-800/50 last:border-0">
            <svg className="w-3 h-3 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {idx}
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Relationships</p>
        <div className="bg-gray-900 border border-gray-800 rounded p-3 text-xs font-mono text-gray-400">
          {db.relationships}
        </div>
      </div>

      {/* Mini ER diagram (static SVG) */}
      <div>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">ER Diagram (simplified)</p>
        <div className="bg-gray-900 border border-gray-800 rounded p-4 overflow-x-auto">
          <svg viewBox="0 0 380 80" className="w-full min-w-[280px] max-w-sm">
            {db.tables.map((table, i) => {
              const x = i * (380 / db.tables.length) + 10
              return (
                <g key={table}>
                  <rect x={x} y={20} width={70} height={36} rx={4} fill="#1f2937" stroke="#374151" strokeWidth={1} />
                  <text x={x + 35} y={42} textAnchor="middle" fill="#a78bfa" fontSize={9} fontFamily="monospace">{table}</text>
                  {i < db.tables.length - 1 && (
                    <line
                      x1={x + 70} y1={38}
                      x2={x + 380 / db.tables.length - 8} y2={38}
                      stroke="#374151" strokeWidth={1} strokeDasharray="3,2"
                    />
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Performance Tab ──────────────────────────────────────────
function PerformanceTab({ endpoint, mode, result }) {
  const [highLoad, setHighLoad] = useState(false)
  const [simResult, setSimResult] = useState(null)
  const profile = endpoint.performanceProfile

  const isAsync = mode === 'fastapi'

  function handleHighLoad() {
    setHighLoad(true)
    setTimeout(() => {
      setSimResult({
        queries: profile.queries + 2,
        cacheUsed: false,
        responseTime: Math.round(profile.avgResponse * 3.2),
        note: 'Cache bypassed under high load. Connection pool near limit.',
      })
    }, 600)
  }

  function resetLoad() {
    setHighLoad(false)
    setSimResult(null)
  }

  const displayTime = simResult?.responseTime || result?.responseTime || profile.avgResponse
  const displayQueries = simResult?.queries || result?.dbQueries || profile.queries
  const displayCache = simResult !== null ? false : (result?.cacheUsed ?? profile.cacheUsed)

  return (
    <div className="p-4 space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'DB Queries', value: displayQueries, color: 'text-blue-400' },
          { label: 'Response Time', value: `${displayTime}ms`, color: highLoad ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Cache', value: displayCache ? 'HIT' : 'MISS', color: displayCache ? 'text-emerald-400' : 'text-yellow-400' },
          { label: 'Cold Start', value: `${profile.coldStart}ms`, color: 'text-purple-400' },
          { label: 'Async', value: isAsync ? 'Yes' : 'No', color: isAsync ? 'text-emerald-400' : 'text-gray-400' },
          { label: 'Load Status', value: highLoad ? 'HIGH' : 'Normal', color: highLoad ? 'text-red-400' : 'text-gray-400' },
        ].map((m) => (
          <div key={m.label} className="bg-gray-900 border border-gray-800 rounded p-3">
            <div className={`text-lg font-mono font-bold ${m.color}`}>{m.value}</div>
            <div className="text-xs font-mono text-gray-500 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Framework note */}
      <div className="bg-gray-900 border border-gray-800 rounded p-3">
        <p className="text-xs font-mono text-gray-500 mb-1">Framework Behavior</p>
        <p className="text-xs font-mono text-gray-400">
          {mode === 'django'
            ? '⚡ Sync view. Thread-per-request model (Gunicorn workers). Async requires explicit async def views.'
            : '⚡ Async endpoint natively. Event-loop based (Uvicorn). No thread blocking — handles concurrent I/O efficiently.'}
        </p>
      </div>

      {simResult?.note && (
        <div className="bg-red-950/20 border border-red-900 rounded p-3">
          <p className="text-xs font-mono text-red-400">⚠ High Load: {simResult.note}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleHighLoad}
          disabled={highLoad}
          className="text-xs font-mono px-3 py-2 bg-red-900/40 border border-red-800 text-red-400 rounded hover:bg-red-900/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Simulate High Load
        </button>
        {highLoad && (
          <button
            onClick={resetLoad}
            className="text-xs font-mono px-3 py-2 border border-gray-700 text-gray-400 rounded hover:border-gray-500 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Security Tab ─────────────────────────────────────────────
function SecurityTab({ endpoint }) {
  const s = endpoint.securityNotes
  const items = [
    { icon: '🔑', label: 'JWT Strategy', value: s.jwt },
    { icon: '🛡', label: 'Rate Limiting', value: s.rateLimit },
    { icon: '#️⃣', label: 'Password Hashing', value: s.hashing },
    { icon: '👮', label: 'Role Check', value: s.roleCheck },
    { icon: '🔄', label: 'Token Strategy', value: s.refresh },
  ]
  return (
    <div className="p-4 space-y-3">
      {items.map((item) => (
        <div key={item.label} className="bg-gray-900 border border-gray-800 rounded p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{item.icon}</span>
            <span className="text-xs font-mono text-gray-400 font-semibold">{item.label}</span>
          </div>
          <p className="text-xs font-mono text-gray-500 leading-relaxed">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Flow Tab ─────────────────────────────────────────────────
function FlowTab({ endpoint }) {
  const steps = endpoint.flowDiagram
  return (
    <div className="p-4">
      <p className="text-xs font-mono text-gray-500 mb-4 uppercase tracking-widest">Request Lifecycle</p>
      <div className="flex flex-col gap-0">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full border border-emerald-700 bg-emerald-950/40 flex items-center justify-center shrink-0">
                <span className="text-xs font-mono text-emerald-400">{i + 1}</span>
              </div>
              {i < steps.length - 1 && <div className="w-px h-6 bg-gray-800 mt-0.5" />}
            </div>
            <div className="pb-4">
              <span className="text-sm font-mono text-gray-300">{step}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Endpoint Sidebar ─────────────────────────────────────────
function EndpointSidebar({ selectedId, onSelect, isLoggedIn, mode }) {
  const [expanded, setExpanded] = useState({ Authentication: true, Users: false, Orders: false, Payments: false, 'AI Services': false, Admin: false })

  function toggle(cat) {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-gray-800">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Endpoints</span>
        {!isLoggedIn && (
          <div className="mt-1.5 text-xs font-mono text-yellow-500/80 bg-yellow-950/20 border border-yellow-900/40 rounded px-2 py-1">
            ⚠ Login required first
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {categories.map((cat) => (
          <div key={cat}>
            <button
              onClick={() => toggle(cat)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
            >
              <span>{cat}</span>
              <svg
                className={`w-3 h-3 transition-transform ${expanded[cat] ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {expanded[cat] && (
              <div className="pb-1">
                {endpointsByCategory[cat].map((ep) => {
                  const isSelected = selectedId === ep.id
                  const locked = ep.requiresAuth && !isLoggedIn && !ep.isLoginEndpoint
                  return (
                    <button
                      key={ep.id}
                      onClick={() => onSelect(ep.id)}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors ${
                        isSelected
                          ? 'bg-gray-800 border-l-2 border-emerald-500'
                          : 'border-l-2 border-transparent hover:bg-gray-900'
                      }`}
                    >
                      <span className={`text-xs font-mono font-bold shrink-0 px-1 py-0.5 rounded border ${METHOD_COLORS[ep.method]}`}>
                        {ep.method}
                      </span>
                      <span className={`text-xs font-mono truncate ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                        {ep.path.replace('/api/v1', '')}
                      </span>
                      {locked && <svg className="w-3 h-3 text-gray-600 shrink-0 ml-auto" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 016 0v1h2V7a5 5 0 00-5-5z"/></svg>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function ApiPlayground() {
  const { mode } = useFramework()
  const [selectedId, setSelectedId] = useState('auth-login')
  const [activeTab, setActiveTab] = useState('Request')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const endpoint = endpoints.find((e) => e.id === selectedId)

  // Reset result when endpoint or mode changes
  useEffect(() => {
    setResult(null)
    setActiveTab('Request')
  }, [selectedId, mode])

  function handleSelect(id) {
    setSelectedId(id)
    setSidebarOpen(false)
  }

  function goToLogin() {
    setSelectedId('auth-login')
    setActiveTab('Request')
    setSidebarOpen(false)
  }

  async function handleSend(body) {
    setLoading(true)
    // Simulate realistic network delay
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 400))

    const res = simulateRequest(endpoint.id, body, mode, isLoggedIn)
    setResult(res)
    setActiveTab('Response')
    setLoading(false)

    // Auto-login on successful login
    if (endpoint.isLoginEndpoint && res.status === 200) {
      setIsLoggedIn(true)
    }
  }

  const showLoginGate = endpoint?.requiresAuth && !isLoggedIn && !endpoint?.isLoginEndpoint

  return (
    <section id="playground" className="page-enter min-h-screen">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-800">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-mono font-bold text-white">API Playground</h2>
            <p className="text-xs font-mono text-gray-500 mt-0.5">
              Simulated backend — {endpoints.length} endpoints across {categories.length} categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Login status badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono ${
              isLoggedIn
                ? 'text-emerald-400 border-emerald-800 bg-emerald-950/30'
                : 'text-gray-500 border-gray-700'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isLoggedIn ? 'bg-emerald-400' : 'bg-gray-600'}`} />
              {isLoggedIn ? 'Authenticated' : 'Not logged in'}
            </div>
            {isLoggedIn && (
              <button
                onClick={() => setIsLoggedIn(false)}
                className="text-xs font-mono text-gray-600 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            )}
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-xs font-mono text-gray-400 border border-gray-700 px-2 py-1 rounded hover:border-gray-500"
            >
              Endpoints ☰
            </button>
          </div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="max-w-7xl mx-auto flex h-[calc(100vh-200px)] min-h-[600px] relative">

        {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside className={`
          ${sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-72' : 'hidden'}
          lg:relative lg:flex lg:w-60 xl:w-64
          flex-col border-r border-gray-800 bg-gray-950 overflow-hidden shrink-0
        `}>
          <EndpointSidebar
            selectedId={selectedId}
            onSelect={handleSelect}
            isLoggedIn={isLoggedIn}
            mode={mode}
          />
        </aside>

        {/* ── CENTER: Endpoint Details ──────────────────────── */}
        <div className="flex-1 flex flex-col border-r border-gray-800 overflow-hidden min-w-0">
          {endpoint && (
            <>
              {/* Endpoint header */}
              <div className="px-4 py-3 border-b border-gray-800 shrink-0">
                <div className="flex items-start gap-3 flex-wrap">
                  <span className={`text-xs font-mono font-bold px-2 py-1 rounded border shrink-0 ${METHOD_COLORS[endpoint.method]}`}>
                    {endpoint.method}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-300 break-all">{endpoint.path}</p>
                    <p className="text-xs font-mono text-gray-600 mt-0.5">{endpoint.description}</p>
                  </div>
                </div>
                {/* Metadata pills */}
                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                    mode === 'django' ? 'text-green-400 border-green-800 bg-green-950/20' : 'text-blue-400 border-blue-800 bg-blue-950/20'
                  }`}>
                    {mode === 'django' ? 'Django' : 'FastAPI'}
                  </span>
                  <span className="text-xs font-mono text-gray-600 border border-gray-800 px-2 py-0.5 rounded">
                    {endpoint.contentType}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <TabBar active={activeTab} onChange={setActiveTab} />

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto">
                {showLoginGate && activeTab !== 'Database' && activeTab !== 'Performance' && activeTab !== 'Security' && activeTab !== 'Flow' ? (
                  <LoginGateBanner onGoToLogin={goToLogin} />
                ) : (
                  <>
                    {activeTab === 'Request' && (
                      showLoginGate
                        ? <LoginGateBanner onGoToLogin={goToLogin} />
                        : <RequestTab endpoint={endpoint} mode={mode} isLoggedIn={isLoggedIn} onSend={handleSend} loading={loading} />
                    )}
                    {activeTab === 'Response' && <ResponseTab result={result} />}
                    {activeTab === 'Database' && <DatabaseTab endpoint={endpoint} />}
                    {activeTab === 'Performance' && <PerformanceTab endpoint={endpoint} mode={mode} result={result} />}
                    {activeTab === 'Security' && <SecurityTab endpoint={endpoint} />}
                    {activeTab === 'Flow' && <FlowTab endpoint={endpoint} />}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT PANEL: Quick Response Preview ───────────── */}
        <aside className="hidden xl:flex flex-col w-72 2xl:w-80 shrink-0 bg-gray-950">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Response Preview</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {!result ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs font-mono text-gray-600">Send a request to see the response here</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-mono font-bold ${STATUS_COLORS[result.status]}`}>{result.status}</span>
                  <span className="text-xs font-mono text-gray-500">{result.responseTime}ms</span>
                  {result.cacheUsed && (
                    <span className="text-xs font-mono text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">CACHE HIT</span>
                  )}
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded p-3 overflow-auto max-h-96">
                  <JsonDisplay data={result.body} raw={false} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-gray-900 border border-gray-800 rounded p-2">
                    <div className="text-gray-500 text-xs">DB Queries</div>
                    <div className="text-blue-400 font-bold">{result.dbQueries}</div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded p-2">
                    <div className="text-gray-500 text-xs">Cache</div>
                    <div className={result.cacheUsed ? 'text-emerald-400 font-bold' : 'text-yellow-400 font-bold'}>
                      {result.cacheUsed ? 'HIT' : 'MISS'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}