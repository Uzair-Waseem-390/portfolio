import { useState, useEffect, useRef } from 'react'
import { useFramework } from '../../context/FrameworkContext'

const archBlocks = [
  { id: 'client',  label: 'Client',          color: 'text-gray-300  border-gray-600',   dot: 'bg-gray-400',    bg: 'hover:bg-gray-800/60', modal: { title: 'Client / Frontend', body: 'The React-based frontend sends HTTP requests to the API Layer. All communication is stateless — no session stored on the client beyond JWT tokens in memory.' } },
  { id: 'api',     label: 'API Layer',        color: 'text-blue-400  border-blue-700',   dot: 'bg-blue-500',    bg: 'hover:bg-blue-950/40', modal: { title: 'API Layer', body: 'Handles routing, request validation, authentication middleware, and rate limiting. Every request passes through this layer before touching business logic.' } },
  { id: 'logic',   label: 'Business Logic',   color: 'text-emerald-400 border-emerald-700', dot: 'bg-emerald-500', bg: 'hover:bg-emerald-950/40', modal: { title: 'Business Logic', body: 'Separation of concerns enforced via service layer pattern. Views/routers delegate to service functions — keeping controllers thin and logic testable.' } },
  { id: 'orm',     label: 'ORM',              color: 'text-yellow-400 border-yellow-700', dot: 'bg-yellow-500',  bg: 'hover:bg-yellow-950/40', modal: { title: 'ORM Layer', body: 'Django ORM / SQLAlchemy handles model relationships and query optimization. Indexed fields used on high-traffic columns. N+1 queries actively prevented via select_related / joinedload.' } },
  { id: 'db',      label: 'Database',         color: 'text-purple-400 border-purple-700', dot: 'bg-purple-500',  bg: 'hover:bg-purple-950/40', modal: { title: 'PostgreSQL (Simulated)', body: 'Normalized schema at 3NF. Foreign key constraints enforced. Read replicas conceptually planned for scale. 9 indexed fields across 7 core tables.' } },
  { id: 'cache',   label: 'Cache',            color: 'text-red-400   border-red-700',    dot: 'bg-red-500',     bg: 'hover:bg-red-950/40', modal: { title: 'Redis Cache (Simulated)', body: 'Used for read-heavy endpoints. Cache-aside strategy. TTL enforced. Cache invalidation on write operations.' } },
  { id: 'worker',  label: 'Worker',           color: 'text-orange-400 border-orange-700', dot: 'bg-orange-500',  bg: 'hover:bg-orange-950/40', modal: { title: 'Background Worker', body: 'Handles async tasks: email delivery, AI processing jobs, report generation. Celery (Django) / async background tasks (FastAPI) conceptually implemented.' } },
]

const metricsData = {
  django:  [
    { label: 'Total Endpoints', value: '18', sub: 'across 6 categories' },
    { label: 'Auth Protected',  value: '12', sub: 'JWT required' },
    { label: 'Public',          value: '6',  sub: 'no auth needed' },
    { label: 'DB Tables',       value: '7',  sub: 'normalized schema' },
    { label: 'Indexed Fields',  value: '9',  sub: 'optimized queries' },
    { label: 'Async Views',     value: '0',  sub: 'sync default (Django)' },
  ],
  fastapi: [
    { label: 'Total Endpoints', value: '18', sub: 'across 6 categories' },
    { label: 'Auth Protected',  value: '12', sub: 'JWT required' },
    { label: 'Public',          value: '6',  sub: 'no auth needed' },
    { label: 'DB Tables',       value: '7',  sub: 'normalized schema' },
    { label: 'Indexed Fields',  value: '9',  sub: 'optimized queries' },
    { label: 'Async Endpoints', value: '5',  sub: 'native async support' },
  ],
}

const envData = {
  django:  { framework: 'Django 4.2', orm: 'Django ORM (built-in)', validation: 'DRF Serializers',   docs: 'Browsable API',       async: 'Sync (async opt-in)' },
  fastapi: { framework: 'FastAPI 0.110', orm: 'SQLAlchemy + Pydantic', validation: 'Pydantic Models', docs: 'Auto Swagger UI',    async: 'Async-first (native)' },
}

function ArchModal({ block, onClose }) {
  if (!block) return null
  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-box bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${block.dot}`} />
            <h3 className="font-mono font-semibold text-white text-sm">{block.modal.title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none transition-colors">×</button>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed font-mono">{block.modal.body}</p>
      </div>
    </div>
  )
}

// Hook: animate number counting up
function useCountUp(target, duration = 1200, delay = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const num = parseInt(target)
    if (isNaN(num)) { setVal(target); return }
    const timeout = setTimeout(() => {
      let start = 0
      const step = Math.ceil(num / (duration / 16))
      const timer = setInterval(() => {
        start += step
        if (start >= num) { setVal(num); clearInterval(timer) }
        else setVal(start)
      }, 16)
      return () => clearInterval(timer)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, duration, delay])
  return val
}

function MetricCard({ label, value, sub, delay }) {
  const { mode } = useFramework()
  const num = useCountUp(value, 900, delay)
  return (
    <div className="metric-card animate-fade-up bg-gray-900 border border-gray-800 rounded-xl p-4" style={{ animationDelay: `${delay}ms` }}>
      <div className={`text-2xl font-mono font-bold ${mode === 'django' ? 'text-emerald-400' : 'text-blue-400'} mb-1`}>{num}</div>
      <div className="text-xs font-mono text-white mb-0.5">{label}</div>
      <div className="text-xs font-mono text-gray-600">{sub}</div>
    </div>
  )
}

export default function Dashboard({ onNavigate }) {
  const { mode } = useFramework()
  const [activeModal, setActiveModal] = useState(null)
  const env = envData[mode]
  const metrics = metricsData[mode]

  return (
    <div className="page-enter flex flex-col">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center justify-items-center">

          {/* Left */}
          <div className="space-y-6 animate-slide-left w-full max-w-md lg:max-w-none lg:w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-emerald-400 border border-emerald-800 bg-emerald-950/30 px-2 py-0.5 rounded">● LIVE SIMULATION</span>
              <span className={`text-xs font-mono border px-2 py-0.5 rounded ${mode === 'django' ? 'text-green-400 border-green-800 bg-green-950/30' : 'text-blue-400 border-blue-800 bg-blue-950/30'}`}>
                {mode === 'django' ? 'Django Mode' : 'FastAPI Mode'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-white leading-tight">
                Simulated Production<br />
                <span className={mode === 'django' ? 'text-emerald-400' : 'text-blue-400'}>Environment</span>
              </h1>
              {/* <p className="text-sm text-gray-500 font-mono mt-2">A backend engineering showcase — not a generic portfolio.</p> */}
            </div>

            {/* Env card */}
            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-900/80 px-4 py-2 flex items-center gap-2 border-b border-gray-800">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs font-mono text-gray-500 ml-1">environment.config</span>
              </div>
              <div className="p-4 space-y-2 bg-gray-900/40">
                {[
                  ['Framework Mode', env.framework],
                  ['Environment',    'Production'],
                  ['API Version',    'v1.0'],
                  ['Database',       'PostgreSQL (Simulated)'],
                  ['Cache',          'Redis (Simulated)'],
                  ['Worker',         'Active'],
                  ['ORM',            env.orm],
                  ['Validation',     env.validation],
                  ['API Docs',       env.docs],
                  ['Async',          env.async],
                ].map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-500">{key}:</span>
                    <span className={
                      val === 'Active' || val === 'Production' 
                        ? mode === 'django' ? 'text-emerald-400' : 'text-blue-400'
                        : mode === 'django' ? 'text-green-300' : 'text-blue-300'
                    }>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Photo */}
          {/* Right: Photo */}
          <div className="flex flex-col items-center gap-6 animate-slide-right w-full max-w-md lg:max-w-none">
            <div className="relative">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-gray-700 bg-gray-900 shadow-2xl shadow-black/50">
                <img
                  src="/src/assets/images/uzair.png"
                  alt="Uzair Waseem"
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                />
                <div className="w-full h-full items-center justify-center bg-gray-900 text-gray-600 font-mono text-sm" style={{ display: 'none' }}>
                  <div className="text-center"><div className="text-4xl mb-2">👤</div><div className="text-xs">uzair.png</div></div>
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 animate-fade-in delay-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 glow-dot" />
                  <span className="text-xs font-mono text-emerald-400">System Online</span>
                </div>
              </div>
            </div>
            <div className="text-center animate-fade-in delay-300">
              <p className="text-base font-mono font-semibold text-white">Uzair Waseem</p>
              <p className="text-sm font-mono text-gray-500">Backend Engineer</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center lg:justify-center">
                {['Django', 'FastAPI', 'PostgreSQL', 'OpenAI SDK'].map(tech => (
                  <span key={tech} className="text-xs font-mono text-gray-400 border border-gray-700 px-2 py-0.5 rounded hover:border-gray-500 transition-colors">{tech}</span>
                ))}
              </div>
            </div>
          </div>
          {/* <div className="flex flex-col items-center gap-6 animate-slide-right w-full max-w-md lg:max-w-none">
            <div className="relative">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-gray-700 bg-gray-900 shadow-2xl shadow-black/50">
                <img
                  src="/src/assets/images/uzair.png"
                  alt="Uzair Waseem"
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                />
                <div className="w-full h-full items-center justify-center bg-gray-900 text-gray-600 font-mono text-sm" style={{ display: 'none' }}>
                  <div className="text-center"><div className="text-4xl mb-2">👤</div><div className="text-xs">uzair.png</div></div>
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 animate-fade-in delay-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 glow-dot" />
                  <span className="text-xs font-mono text-emerald-400">System Online</span>
                </div>
              </div>
            </div>
            <div className="text-center lg:text-right animate-fade-in delay-300">
              <p className="text-base font-mono font-semibold text-white">Uzair Waseem</p>
              <p className="text-sm font-mono text-gray-500">Backend Engineer</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center lg:justify-end">
                {['Django', 'FastAPI', 'PostgreSQL', 'OpenAI SDK'].map(tech => (
                  <span key={tech} className="text-xs font-mono text-gray-400 border border-gray-700 px-2 py-0.5 rounded hover:border-gray-500 transition-colors">{tech}</span>
                ))}
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* ── SYSTEM ARCHITECTURE — FULL WIDTH ─────────────── */}
      <section className="w-full border-y border-gray-800 bg-gray-900/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">System Architecture</div>
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs font-mono text-gray-600">click any block</span>
          </div>
        </div>

        {/* Desktop: full-width horizontal flow */}
        <div className="hidden sm:block w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between w-full gap-0">
            {archBlocks.map((block, i) => (
              <div key={block.id} className="flex items-center flex-1 min-w-0">
                <button
                  onClick={() => setActiveModal(block)}
                  className={`arch-block flex flex-col items-center gap-2 px-2 py-3 xl:px-4 xl:py-4 rounded-xl border flex-1 font-mono text-xs ${block.color} ${block.bg} animate-fade-up`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className={`w-2 h-2 rounded-full ${block.dot}`} />
                  <span className="text-center leading-tight text-xs xl:text-xs whitespace-nowrap">{block.label}</span>
                </button>
                {i < archBlocks.length - 1 && (
                  <div className="flex items-center shrink-0 px-1 xl:px-2">
                    <div className="w-3 xl:w-5 h-px bg-gray-700" />
                    <svg className="arch-arrow w-3 h-3 text-gray-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical */}
        <div className="sm:hidden px-4 space-y-2">
          {archBlocks.map((block, i) => (
            <div key={block.id}>
              <button
                onClick={() => setActiveModal(block)}
                className={`arch-block w-full flex items-center gap-3 px-4 py-3 rounded-xl border font-mono text-xs text-left ${block.color} ${block.bg} animate-fade-up`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${block.dot}`} />
                <span className="flex-1">{block.label}</span>
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {i < archBlocks.length - 1 && (
                <div className="flex justify-center py-1">
                  <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <ArchModal block={activeModal} onClose={() => setActiveModal(null)} />
      </section>

      {/* ── METRICS ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">System Metrics</div>
          <div className="flex-1 h-px bg-gray-800" />
          <span className={`text-xs font-mono ${mode === 'django' ? 'text-green-500' : 'text-blue-500'}`}>
            {mode === 'django' ? 'Django' : 'FastAPI'} Mode
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map((m, i) => (
            <MetricCard key={m.label} {...m} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ── FRAMEWORK DIFF ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Framework Behavior</div>
          <div className="flex-1 h-px bg-gray-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="animate-fade-up delay-0 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-800">
              <span className="text-xs font-mono text-gray-400">Validation Error Format</span>
            </div>
            <pre className="p-4 text-xs font-mono text-gray-400 overflow-x-auto">
              {mode === 'django'
                ? `{\n  "email": [\n    "This field is required."\n  ]\n}`
                : `{\n  "detail": [\n    {\n      "loc": ["body", "email"],\n      "msg": "field required",\n      "type": "value_error.missing"\n    }\n  ]\n}`}
            </pre>
          </div>
          <div className="animate-fade-up delay-100 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-800">
              <span className="text-xs font-mono text-gray-400">Project Structure</span>
            </div>
            <pre className="p-4 text-xs font-mono text-gray-400 overflow-x-auto">
              {mode === 'django'
                ? `project/\n  apps/\n    users/\n      models.py\n      serializers.py\n      views.py\n      urls.py`
                : `app/\n  routers/\n    users.py\n  models.py\n  schemas.py\n  main.py`}
            </pre>
          </div>
          <div className="animate-fade-up delay-200 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs font-mono text-gray-500 mb-2">Async Behavior</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${mode === 'fastapi' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
              <span className="text-sm font-mono text-gray-300">
                {mode === 'django' ? 'Sync views (async opt-in per view)' : 'Async endpoints supported natively'}
              </span>
            </div>
          </div>
          <div className="animate-fade-up delay-300 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs font-mono text-gray-500 mb-2">API Documentation Style</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${mode === 'fastapi' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
              <span className="text-sm font-mono text-gray-300">
                {mode === 'django' ? 'DRF Browsable API' : 'Auto-generated Swagger UI'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BUTTONS ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-up delay-200">
          <button
            onClick={() => onNavigate('playground')}
            className="btn-primary w-full sm:w-auto text-center px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-mono rounded-xl"
          >
            Enter API Playground →
          </button>
          <button
            onClick={() => onNavigate('architecture')}
            className="btn-outline w-full sm:w-auto text-center px-7 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-mono rounded-xl"
          >
            Read Architecture Decisions
          </button>
          <button
            onClick={() => onNavigate('projects')}
            className="btn-outline w-full sm:w-auto text-center px-7 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-mono rounded-xl"
          >
            Explore Projects
          </button>
        </div>
      </section>
    </div>
  )
}
















// import { useState, useEffect, useRef } from 'react'
// import { useFramework } from '../../context/FrameworkContext'

// const archBlocks = [
//   { id: 'client',  label: 'Client',          color: 'text-gray-300  border-gray-600',   dot: 'bg-gray-400',    bg: 'hover:bg-gray-800/60', modal: { title: 'Client / Frontend', body: 'The React-based frontend sends HTTP requests to the API Layer. All communication is stateless — no session stored on the client beyond JWT tokens in memory.' } },
//   { id: 'api',     label: 'API Layer',        color: 'text-blue-400  border-blue-700',   dot: 'bg-blue-500',    bg: 'hover:bg-blue-950/40', modal: { title: 'API Layer', body: 'Handles routing, request validation, authentication middleware, and rate limiting. Every request passes through this layer before touching business logic.' } },
//   { id: 'logic',   label: 'Business Logic',   color: 'text-emerald-400 border-emerald-700', dot: 'bg-emerald-500', bg: 'hover:bg-emerald-950/40', modal: { title: 'Business Logic', body: 'Separation of concerns enforced via service layer pattern. Views/routers delegate to service functions — keeping controllers thin and logic testable.' } },
//   { id: 'orm',     label: 'ORM',              color: 'text-yellow-400 border-yellow-700', dot: 'bg-yellow-500',  bg: 'hover:bg-yellow-950/40', modal: { title: 'ORM Layer', body: 'Django ORM / SQLAlchemy handles model relationships and query optimization. Indexed fields used on high-traffic columns. N+1 queries actively prevented via select_related / joinedload.' } },
//   { id: 'db',      label: 'Database',         color: 'text-purple-400 border-purple-700', dot: 'bg-purple-500',  bg: 'hover:bg-purple-950/40', modal: { title: 'PostgreSQL (Simulated)', body: 'Normalized schema at 3NF. Foreign key constraints enforced. Read replicas conceptually planned for scale. 9 indexed fields across 7 core tables.' } },
//   { id: 'cache',   label: 'Cache',            color: 'text-red-400   border-red-700',    dot: 'bg-red-500',     bg: 'hover:bg-red-950/40', modal: { title: 'Redis Cache (Simulated)', body: 'Used for read-heavy endpoints. Cache-aside strategy. TTL enforced. Cache invalidation on write operations.' } },
//   { id: 'worker',  label: 'Worker',           color: 'text-orange-400 border-orange-700', dot: 'bg-orange-500',  bg: 'hover:bg-orange-950/40', modal: { title: 'Background Worker', body: 'Handles async tasks: email delivery, AI processing jobs, report generation. Celery (Django) / async background tasks (FastAPI) conceptually implemented.' } },
// ]

// const metricsData = {
//   django:  [
//     { label: 'Total Endpoints', value: '18', sub: 'across 6 categories' },
//     { label: 'Auth Protected',  value: '12', sub: 'JWT required' },
//     { label: 'Public',          value: '6',  sub: 'no auth needed' },
//     { label: 'DB Tables',       value: '7',  sub: 'normalized schema' },
//     { label: 'Indexed Fields',  value: '9',  sub: 'optimized queries' },
//     { label: 'Async Views',     value: '0',  sub: 'sync default (Django)' },
//   ],
//   fastapi: [
//     { label: 'Total Endpoints', value: '18', sub: 'across 6 categories' },
//     { label: 'Auth Protected',  value: '12', sub: 'JWT required' },
//     { label: 'Public',          value: '6',  sub: 'no auth needed' },
//     { label: 'DB Tables',       value: '7',  sub: 'normalized schema' },
//     { label: 'Indexed Fields',  value: '9',  sub: 'optimized queries' },
//     { label: 'Async Endpoints', value: '5',  sub: 'native async support' },
//   ],
// }

// const envData = {
//   django:  { framework: 'Django 4.2', orm: 'Django ORM (built-in)', validation: 'DRF Serializers',   docs: 'Browsable API',       async: 'Sync (async opt-in)' },
//   fastapi: { framework: 'FastAPI 0.110', orm: 'SQLAlchemy + Pydantic', validation: 'Pydantic Models', docs: 'Auto Swagger UI',    async: 'Async-first (native)' },
// }

// function ArchModal({ block, onClose }) {
//   if (!block) return null
//   return (
//     <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
//       <div className="modal-box bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-2">
//             <div className={`w-2 h-2 rounded-full ${block.dot}`} />
//             <h3 className="font-mono font-semibold text-white text-sm">{block.modal.title}</h3>
//           </div>
//           <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none transition-colors">×</button>
//         </div>
//         <p className="text-sm text-gray-400 leading-relaxed font-mono">{block.modal.body}</p>
//       </div>
//     </div>
//   )
// }

// // Hook: animate number counting up
// function useCountUp(target, duration = 1200, delay = 0) {
//   const [val, setVal] = useState(0)
//   useEffect(() => {
//     const num = parseInt(target)
//     if (isNaN(num)) { setVal(target); return }
//     const timeout = setTimeout(() => {
//       let start = 0
//       const step = Math.ceil(num / (duration / 16))
//       const timer = setInterval(() => {
//         start += step
//         if (start >= num) { setVal(num); clearInterval(timer) }
//         else setVal(start)
//       }, 16)
//       return () => clearInterval(timer)
//     }, delay)
//     return () => clearTimeout(timeout)
//   }, [target, duration, delay])
//   return val
// }

// function MetricCard({ label, value, sub, delay }) {
//   const num = useCountUp(value, 900, delay)
//   return (
//     <div className="metric-card animate-fade-up bg-gray-900 border border-gray-800 rounded-xl p-4" style={{ animationDelay: `${delay}ms` }}>
//       <div className="text-2xl font-mono font-bold text-emerald-400 mb-1">{num}</div>
//       <div className="text-xs font-mono text-white mb-0.5">{label}</div>
//       <div className="text-xs font-mono text-gray-600">{sub}</div>
//     </div>
//   )
// }

// export default function Dashboard({ onNavigate }) {
//   const { mode } = useFramework()
//   const [activeModal, setActiveModal] = useState(null)
//   const env = envData[mode]
//   const metrics = metricsData[mode]

//   return (
//     <div className="page-enter flex flex-col">

//       {/* ── HERO ──────────────────────────────────────────── */}
//       <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

//           {/* Left */}
//           <div className="space-y-6 animate-slide-left">
//             <div className="flex items-center gap-2 flex-wrap">
//               <span className="text-xs font-mono text-emerald-400 border border-emerald-800 bg-emerald-950/30 px-2 py-0.5 rounded">● LIVE SIMULATION</span>
//               <span className={`text-xs font-mono border px-2 py-0.5 rounded ${mode === 'django' ? 'text-green-400 border-green-800 bg-green-950/30' : 'text-blue-400 border-blue-800 bg-blue-950/30'}`}>
//                 {mode === 'django' ? 'Django Mode' : 'FastAPI Mode'}
//               </span>
//             </div>

//             <div>
//               <h1 className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-white leading-tight">
//                 Simulated Production<br />
//                 <span className={mode === 'django' ? 'text-emerald-400' : 'text-blue-400'}>Environment</span>
//               </h1>
//               <p className="text-sm text-gray-500 font-mono mt-2">A backend engineering showcase — not a generic portfolio.</p>
//             </div>

//             {/* Env card */}
//             <div className="border border-gray-800 rounded-xl overflow-hidden">
//               <div className="bg-gray-900/80 px-4 py-2 flex items-center gap-2 border-b border-gray-800">
//                 <div className="flex gap-1.5">
//                   <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
//                   <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
//                   <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
//                 </div>
//                 <span className="text-xs font-mono text-gray-500 ml-1">environment.config</span>
//               </div>
//               <div className="p-4 space-y-2 bg-gray-900/40">
//                 {[
//                   ['Framework Mode', env.framework],
//                   ['Environment',    'Production'],
//                   ['API Version',    'v1.0'],
//                   ['Database',       'PostgreSQL (Simulated)'],
//                   ['Cache',          'Redis (Simulated)'],
//                   ['Worker',         'Active'],
//                   ['ORM',            env.orm],
//                   ['Validation',     env.validation],
//                   ['API Docs',       env.docs],
//                   ['Async',          env.async],
//                 ].map(([key, val]) => (
//                   <div key={key} className="flex items-center justify-between text-xs font-mono">
//                     <span className="text-gray-500">{key}:</span>
//                     <span className={val === 'Active' || val === 'Production' ? 'text-emerald-400' : mode === 'django' ? 'text-green-300' : 'text-blue-300'}>
//                       {val}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Right: Photo */}
//           <div className="flex flex-col items-center lg:items-end gap-6 animate-slide-right">
//             <div className="relative">
//               <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-gray-700 bg-gray-900 shadow-2xl shadow-black/50">
//                 <img
//                   src="/src/assets/images/uzair.png"
//                   alt="Uzair Waseem"
//                   className="w-full h-full object-cover"
//                   onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
//                 />
//                 <div className="w-full h-full items-center justify-center bg-gray-900 text-gray-600 font-mono text-sm" style={{ display: 'none' }}>
//                   <div className="text-center"><div className="text-4xl mb-2">👤</div><div className="text-xs">uzair.png</div></div>
//                 </div>
//               </div>
//               <div className="absolute -bottom-3 -right-3 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 animate-fade-in delay-400">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 rounded-full bg-emerald-400 glow-dot" />
//                   <span className="text-xs font-mono text-emerald-400">System Online</span>
//                 </div>
//               </div>
//             </div>
//             <div className="text-center lg:text-right animate-fade-in delay-300">
//               <p className="text-base font-mono font-semibold text-white">Uzair Waseem</p>
//               <p className="text-sm font-mono text-gray-500">Backend Engineer</p>
//               <div className="flex flex-wrap gap-2 mt-3 justify-center lg:justify-end">
//                 {['Django', 'FastAPI', 'PostgreSQL', 'OpenAI SDK'].map(tech => (
//                   <span key={tech} className="text-xs font-mono text-gray-400 border border-gray-700 px-2 py-0.5 rounded hover:border-gray-500 transition-colors">{tech}</span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── SYSTEM ARCHITECTURE — FULL WIDTH ─────────────── */}
//       <section className="w-full border-y border-gray-800 bg-gray-900/30 py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
//           <div className="flex items-center gap-3">
//             <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">System Architecture</div>
//             <div className="flex-1 h-px bg-gray-800" />
//             <span className="text-xs font-mono text-gray-600">click any block</span>
//           </div>
//         </div>

//         {/* Desktop: full-width horizontal flow */}
//         <div className="hidden sm:block w-full px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between w-full gap-0">
//             {archBlocks.map((block, i) => (
//               <div key={block.id} className="flex items-center flex-1 min-w-0">
//                 <button
//                   onClick={() => setActiveModal(block)}
//                   className={`arch-block flex flex-col items-center gap-2 px-2 py-3 xl:px-4 xl:py-4 rounded-xl border flex-1 font-mono text-xs ${block.color} ${block.bg} animate-fade-up`}
//                   style={{ animationDelay: `${i * 70}ms` }}
//                 >
//                   <div className={`w-2 h-2 rounded-full ${block.dot}`} />
//                   <span className="text-center leading-tight text-xs xl:text-xs whitespace-nowrap">{block.label}</span>
//                 </button>
//                 {i < archBlocks.length - 1 && (
//                   <div className="flex items-center shrink-0 px-1 xl:px-2">
//                     <div className="w-3 xl:w-5 h-px bg-gray-700" />
//                     <svg className="arch-arrow w-3 h-3 text-gray-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                       <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
//                     </svg>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Mobile: vertical */}
//         <div className="sm:hidden px-4 space-y-2">
//           {archBlocks.map((block, i) => (
//             <div key={block.id}>
//               <button
//                 onClick={() => setActiveModal(block)}
//                 className={`arch-block w-full flex items-center gap-3 px-4 py-3 rounded-xl border font-mono text-xs text-left ${block.color} ${block.bg} animate-fade-up`}
//                 style={{ animationDelay: `${i * 60}ms` }}
//               >
//                 <div className={`w-2 h-2 rounded-full shrink-0 ${block.dot}`} />
//                 <span className="flex-1">{block.label}</span>
//                 <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//               </button>
//               {i < archBlocks.length - 1 && (
//                 <div className="flex justify-center py-1">
//                   <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
//                   </svg>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         <ArchModal block={activeModal} onClose={() => setActiveModal(null)} />
//       </section>

//       {/* ── METRICS ───────────────────────────────────────── */}
//       <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">System Metrics</div>
//           <div className="flex-1 h-px bg-gray-800" />
//           <span className={`text-xs font-mono ${mode === 'django' ? 'text-green-500' : 'text-blue-500'}`}>
//             {mode === 'django' ? 'Django' : 'FastAPI'} Mode
//           </span>
//         </div>
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
//           {metrics.map((m, i) => (
//             <MetricCard key={m.label} {...m} delay={i * 80} />
//           ))}
//         </div>
//       </section>

//       {/* ── FRAMEWORK DIFF ────────────────────────────────── */}
//       <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Framework Behavior</div>
//           <div className="flex-1 h-px bg-gray-800" />
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="animate-fade-up delay-0 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
//             <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-800">
//               <span className="text-xs font-mono text-gray-400">Validation Error Format</span>
//             </div>
//             <pre className="p-4 text-xs font-mono text-gray-400 overflow-x-auto">
//               {mode === 'django'
//                 ? `{\n  "email": [\n    "This field is required."\n  ]\n}`
//                 : `{\n  "detail": [\n    {\n      "loc": ["body", "email"],\n      "msg": "field required",\n      "type": "value_error.missing"\n    }\n  ]\n}`}
//             </pre>
//           </div>
//           <div className="animate-fade-up delay-100 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
//             <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-800">
//               <span className="text-xs font-mono text-gray-400">Project Structure</span>
//             </div>
//             <pre className="p-4 text-xs font-mono text-gray-400 overflow-x-auto">
//               {mode === 'django'
//                 ? `project/\n  apps/\n    users/\n      models.py\n      serializers.py\n      views.py\n      urls.py`
//                 : `app/\n  routers/\n    users.py\n  models.py\n  schemas.py\n  main.py`}
//             </pre>
//           </div>
//           <div className="animate-fade-up delay-200 bg-gray-900 border border-gray-800 rounded-xl p-4">
//             <div className="text-xs font-mono text-gray-500 mb-2">Async Behavior</div>
//             <div className="flex items-center gap-2">
//               <div className={`w-2 h-2 rounded-full ${mode === 'fastapi' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
//               <span className="text-sm font-mono text-gray-300">
//                 {mode === 'django' ? 'Sync views (async opt-in per view)' : 'Async endpoints supported natively'}
//               </span>
//             </div>
//           </div>
//           <div className="animate-fade-up delay-300 bg-gray-900 border border-gray-800 rounded-xl p-4">
//             <div className="text-xs font-mono text-gray-500 mb-2">API Documentation Style</div>
//             <div className="flex items-center gap-2">
//               <div className={`w-2 h-2 rounded-full ${mode === 'fastapi' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
//               <span className="text-sm font-mono text-gray-300">
//                 {mode === 'django' ? 'DRF Browsable API' : 'Auto-generated Swagger UI'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── CTA BUTTONS ───────────────────────────────────── */}
//       <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
//         <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-up delay-200">
//           <button
//             onClick={() => onNavigate('playground')}
//             className="btn-primary w-full sm:w-auto text-center px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-mono rounded-xl"
//           >
//             Enter API Playground →
//           </button>
//           <button
//             onClick={() => onNavigate('architecture')}
//             className="btn-outline w-full sm:w-auto text-center px-7 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-mono rounded-xl"
//           >
//             Read Architecture Decisions
//           </button>
//           <button
//             onClick={() => onNavigate('projects')}
//             className="btn-outline w-full sm:w-auto text-center px-7 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-mono rounded-xl"
//           >
//             Explore Projects
//           </button>
//         </div>
//       </section>
//     </div>
//   )
// }


