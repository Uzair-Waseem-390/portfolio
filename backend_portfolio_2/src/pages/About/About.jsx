import { useState, useEffect, useRef } from 'react'
import { useFramework } from '../../context/FrameworkContext'

// ─────────────────────────────────────────────────────────────
// INTERSECTION OBSERVER HOOK
// ─────────────────────────────────────────────────────────────
function useInView(ref, threshold = 0.1) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref, threshold])
  return visible
}

function Reveal({ children, delay = 0, direction = 'up', className = '' }) {
  const ref = useRef(null)
  const visible = useInView(ref, 0.08)
  const animClass = {
    up:    'animate-fade-up',
    left:  'animate-slide-left',
    right: 'animate-slide-right',
  }[direction] || 'animate-fade-up'

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className={`${visible ? animClass : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const techStack = {
  Backend: [
    { name: 'Django',       level: 90, color: 'bg-green-500',  badge: 'text-green-400 border-green-800 bg-green-950/30',  note: 'Primary framework — production SaaS projects' },
    { name: 'FastAPI',      level: 82, color: 'bg-blue-500',   badge: 'text-blue-400 border-blue-800 bg-blue-950/30',    note: 'Async APIs, AI services, microservices' },
    { name: 'PostgreSQL',   level: 85, color: 'bg-indigo-500', badge: 'text-indigo-400 border-indigo-800 bg-indigo-950/30', note: 'Primary DB — schema design, indexing, optimization' },
    { name: 'Redis',        level: 65, color: 'bg-red-500',    badge: 'text-red-400 border-red-800 bg-red-950/30',       note: 'Caching, session storage (conceptual)' },
    { name: 'JWT / Auth',   level: 88, color: 'bg-yellow-500', badge: 'text-yellow-400 border-yellow-800 bg-yellow-950/30', note: 'Stateless auth, refresh rotation, RBAC' },
    { name: 'REST APIs',    level: 92, color: 'bg-emerald-500',badge: 'text-emerald-400 border-emerald-800 bg-emerald-950/30', note: 'Design, versioning, error contracts' },
  ],
  Frontend: [
    { name: 'React',        level: 75, color: 'bg-cyan-500',   badge: 'text-cyan-400 border-cyan-800 bg-cyan-950/30',    note: 'Used for frontend simulation tooling' },
    { name: 'Next.js',      level: 60, color: 'bg-gray-400',   badge: 'text-gray-300 border-gray-600 bg-gray-800/40',   note: 'BusinessPulse — SSR & marketing pages' },
    { name: 'Tailwind CSS', level: 78, color: 'bg-sky-500',    badge: 'text-sky-400 border-sky-800 bg-sky-950/30',      note: 'UI framework across all frontend work' },
  ],
  'AI & Tooling': [
    { name: 'OpenAI SDK',   level: 72, color: 'bg-purple-500', badge: 'text-purple-400 border-purple-800 bg-purple-950/30', note: 'Agent loops, structured prompting, schema gen' },
    { name: 'Git / GitHub', level: 88, color: 'bg-orange-500', badge: 'text-orange-400 border-orange-800 bg-orange-950/30', note: 'Version control, branching, open source' },
    { name: 'Gunicorn / Uvicorn', level: 70, color: 'bg-teal-500', badge: 'text-teal-400 border-teal-800 bg-teal-950/30', note: 'WSGI/ASGI server config, worker tuning' },
  ],
}

const philosophyPoints = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Clean API Contracts',
    text: 'An API is a contract. Every endpoint has a defined input, a defined output, and consistent error shapes. Clients should never be surprised.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Security by Default',
    text: "Auth, hashing, rate limiting, and input validation aren't afterthoughts. They're baked into the first version, not added when something breaks.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Performance Awareness',
    text: 'Know your query count per request. Know which fields are indexed. Understand your cache hit rate. Performance is measured, not assumed.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 4 8 4" />
      </svg>
    ),
    title: 'Schema-First Thinking',
    text: 'The database is the source of truth. Model relationships correctly from the start. Migrations are versioned. Indexes are deliberate.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
    title: 'Separation of Concerns',
    text: 'Views are thin. Services hold business logic. Models are data. No fat controllers, no logic in templates. Every layer has one job.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    title: 'Framework Agnostic Thinking',
    text: 'Django and FastAPI are tools. Understanding both means choosing the right one — not defaulting to familiarity. The problem picks the framework.',
  },
]

const focusAreas = [
  { label: 'REST API Design',       icon: '⬡', desc: 'Resource modeling, versioning, error contracts' },
  { label: 'Authentication Systems', icon: '⬡', desc: 'JWT, refresh rotation, RBAC, session security' },
  { label: 'Database Architecture', icon: '⬡', desc: 'Normalization, indexing, query optimization' },
  { label: 'SaaS Backend Systems',  icon: '⬡', desc: 'Multi-tenant, role management, financial flows' },
  { label: 'AI Integration',        icon: '⬡', desc: 'OpenAI SDK, agent loops, structured prompting' },
  { label: 'Performance Design',    icon: '⬡', desc: 'Caching strategy, async workers, profiling' },
]

const currentlyLearning = [
  'Docker & containerization workflows',
  'AWS fundamentals (EC2, RDS, S3)',
  'System design at scale — load balancing, sharding',
  'Advanced async patterns in FastAPI',
]

// ─────────────────────────────────────────────────────────────
// SKILL BAR
// ─────────────────────────────────────────────────────────────
function SkillBar({ name, level, color, badge, note, delay }) {
  const ref = useRef(null)
  const visible = useInView(ref, 0.1)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (visible && !animated) {
      setTimeout(() => setAnimated(true), delay)
    }
  }, [visible, delay, animated])

  return (
    <div ref={ref} className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${badge}`}>{name}</span>
        </div>
        <span className="text-xs font-mono text-gray-600">{level}%</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: animated ? `${level}%` : '0%' }}
        />
      </div>
      <p className="text-xs font-mono text-gray-700 mt-1 leading-relaxed group-hover:text-gray-500 transition-colors">{note}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function About({ onNavigate }) {
  const { mode } = useFramework()

  const accentColor  = mode === 'django' ? 'text-emerald-400'  : 'text-blue-400'
  const accentBorder = mode === 'django' ? 'border-emerald-800' : 'border-blue-800'
  const accentBg     = mode === 'django' ? 'bg-emerald-950/30' : 'bg-blue-950/30'
  const accentFill   = mode === 'django' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
  const accentBadge  = `${accentColor} ${accentBorder} ${accentBg}`

  const [activeStackCategory, setActiveStackCategory] = useState('Backend')

  return (
    <div className="page-enter min-h-screen">

      {/* ── Page Header (static, not sticky) ───────────────── */}
      <div className="border-b border-gray-800 bg-gray-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <button onClick={() => onNavigate('home')} className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors">← Home</button>
                <span className="text-gray-700">/</span>
                <span className="text-xs font-mono text-gray-400">About Engineer</span>
              </div>
              <h1 className="text-xl font-mono font-bold text-white">About Engineer</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full glow-dot ${mode === 'django' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                <span className={`text-xs font-mono ${accentColor}`}>{mode === 'django' ? 'Django' : 'FastAPI'} Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">

        {/* ══════════════════════════════════════════════════
            SECTION 1 — HERO (Photo left, info right)
        ══════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — Photo (20% larger) */}
          <Reveal direction="left">
            <div className="flex flex-col items-center lg:items-start gap-6">
              <div className="relative">
                <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border-2 border-gray-700 bg-gray-900 shadow-2xl shadow-black/60">
                  <img
                    src="/images/uzair.png"
                    alt="Uzair Waseem"
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="w-full h-full absolute inset-0 items-center justify-center bg-gray-900 font-mono text-gray-600 text-xs hidden flex-col gap-2" style={{ display: 'none' }}>
                    <svg className="w-14 h-14 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    uzair.png
                  </div>
                </div>

                {/* Status badge */}
                <div className="absolute -bottom-4 -right-4 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 shadow-xl">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 glow-dot" />
                    <span className="text-xs font-mono text-emerald-400 font-semibold">Available to Work</span>
                  </div>
                  <p className="text-xs font-mono text-gray-600 pl-4">Backend Engineer</p>
                </div>
              </div>

              {/* Quick links under photo */}
              <div className="flex items-center gap-3 mt-6">
                <a href="https://github.com/Uzair-Waseem-390" target="_blank" rel="noreferrer"
                  className="footer-link flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-all">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/uzair-waseem-digital/" target="_blank" rel="noreferrer"
                  className="footer-link flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-blue-400 border border-gray-800 hover:border-blue-800 px-3 py-1.5 rounded-lg transition-all">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a href="/images/Uzair Waseem – Backend Developer Resume.pdf" target="_blank" rel="noreferrer"
                  className="footer-link flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-emerald-400 border border-gray-800 hover:border-emerald-800 px-3 py-1.5 rounded-lg transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Resume
                </a>
              </div>
            </div>
          </Reveal>

          {/* Right — Info */}
          <Reveal direction="right" delay={80}>
            <div className="space-y-5">
              {/* Name + role */}
              <div>
                <div className={`inline-flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-lg border mb-3 ${accentBadge}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${mode === 'django' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                  Backend Engineer
                </div>
                <h2 className="text-3xl sm:text-4xl font-mono font-bold text-white mb-1">Uzair Waseem</h2>
                <p className="text-sm font-mono text-gray-500">
                  Building backend systems that are designed to last — not just to ship.
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-3 text-sm font-mono text-gray-400 leading-relaxed">
                <p>
                  I'm a backend-focused developer who builds with{' '}
                  <span className="text-green-400">Django</span> and{' '}
                  <span className="text-blue-400">FastAPI</span> — choosing the right tool based on the problem, not habit.
                </p>
                <p>
                  My work centers on API design, authentication systems, and database architecture. I care about
                  clean contracts, secure defaults, and performance that's measured — not assumed.
                </p>
                <p>
                  This portfolio is itself a backend simulation tool — not a typical "hi I'm Uzair" page. It demonstrates
                  the way I think about systems: layers, contracts, tradeoffs, and visibility.
                </p>
              </div>

              {/* Mode-specific framing */}
              <div className={`border rounded-xl p-4 ${accentBorder} ${accentBg}`}>
                <p className="text-xs font-mono text-gray-500 mb-1">
                  {mode === 'django' ? 'Django-first perspective' : 'FastAPI-first perspective'}
                </p>
                <p className={`text-sm font-mono ${accentColor}`}>
                  {mode === 'django'
                    ? '"Django taught me structure. Convention over configuration means fewer decisions on things that don\'t matter — so I can focus on the ones that do."'
                    : '"FastAPI taught me explicitness. When every dependency is injected and every type is declared, there\'s nowhere to hide bad design."'
                  }
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: '4+',  label: 'Projects Shipped' },
                  { val: '2',   label: 'Frameworks Mastered' },
                  { val: '18',  label: 'API Endpoints Built' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center metric-card">
                    <div className={`text-2xl font-mono font-bold ${accentColor}`}>{s.val}</div>
                    <div className="text-xs font-mono text-gray-500 mt-0.5 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 2 — TECH STACK
        ══════════════════════════════════════════════════ */}
        <section>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Tech Stack</h2>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
          </Reveal>

          {/* Category tabs */}
          <Reveal delay={60}>
            <div className="flex gap-2 mb-7 flex-wrap">
              {Object.keys(techStack).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveStackCategory(cat)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    activeStackCategory === cat
                      ? `${accentColor} ${accentBorder} ${accentBg}`
                      : 'text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {techStack[activeStackCategory].map((skill, i) => (
              <Reveal key={skill.name} delay={i * 60}>
                <SkillBar {...skill} delay={i * 80} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 3 — ENGINEERING FOCUS
        ══════════════════════════════════════════════════ */}
        <section>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Engineering Focus</h2>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {focusAreas.map((area, i) => (
              <Reveal key={area.label} delay={i * 55}>
                <div className="metric-card bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-lg ${accentColor} transition-transform duration-200 group-hover:scale-110`}>⬡</span>
                    <span className="text-sm font-mono font-semibold text-white">{area.label}</span>
                  </div>
                  <p className="text-xs font-mono text-gray-500 leading-relaxed">{area.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 4 — ENGINEERING PHILOSOPHY
        ══════════════════════════════════════════════════ */}
        <section>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Engineering Philosophy</h2>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {philosophyPoints.map((pt, i) => (
              <Reveal key={pt.title} delay={i * 50}>
                <div className="metric-card bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 group h-full">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 transition-colors duration-200 ${
                      mode === 'django'
                        ? 'text-emerald-400 border-emerald-900 bg-emerald-950/40 group-hover:border-emerald-700'
                        : 'text-blue-400 border-blue-900 bg-blue-950/40 group-hover:border-blue-700'
                    }`}>
                      {pt.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-mono font-semibold text-white mb-1.5">{pt.title}</h3>
                      <p className="text-xs font-mono text-gray-500 leading-relaxed">{pt.text}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 5 — CURRENTLY LEARNING
        ══════════════════════════════════════════════════ */}
        <section>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Currently Learning</h2>
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs font-mono text-gray-700 italic">always in progress</span>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentlyLearning.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 metric-card hover:border-gray-700">
                  <div className="w-5 h-5 rounded-full border border-dashed border-gray-600 flex items-center justify-center shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${accentColor.replace('text-', 'bg-')} animate-pulse`} />
                  </div>
                  <span className="text-xs font-mono text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 6 — RESUME + LINKS CARD
        ══════════════════════════════════════════════════ */}
        <section>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Get In Touch</h2>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className={`border rounded-2xl overflow-hidden ${accentBorder}`}>
              {/* Top accent bar */}
              <div className={`h-1 w-full ${mode === 'django' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`} />

              <div className="p-8 sm:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

                  {/* Left text */}
                  <div>
                    <h3 className="text-xl font-mono font-bold text-white mb-3">Open to Backend Roles</h3>
                    <p className="text-sm font-mono text-gray-400 leading-relaxed mb-4">
                      I'm actively looking for backend engineering opportunities — full-time, contract, or freelance.
                      If you're building something that needs clean API design, solid auth, or database-first thinking, let's talk.
                    </p>
                    <div className="space-y-2">
                      {[
                        'Backend Developer (Django / FastAPI)',
                        'API Engineer',
                        'Full Stack with Backend Focus',
                        'Remote or On-site — Faisalabad, PK',
                      ].map(role => (
                        <div key={role} className="flex items-center gap-2 text-xs font-mono text-gray-400">
                          <svg className={`w-3.5 h-3.5 shrink-0 ${accentColor}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          {role}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right links */}
                  <div className="space-y-3">
                    <a
                      href="/images/Uzair Waseem – Backend Developer Resume.pdf"
                      target="_blank"
                      rel="noreferrer"
                      className={`btn-primary flex items-center justify-between gap-3 w-full px-5 py-4 ${accentFill} text-white rounded-xl shadow-lg group`}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="text-left">
                          <p className="text-sm font-mono font-semibold">Download Resume</p>
                          <p className="text-xs font-mono opacity-70">PDF — Backend Developer</p>
                        </div>
                      </div>
                      <svg className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </a>

                    <a
                      href="https://www.linkedin.com/in/uzair-waseem-digital/"
                      target="_blank"
                      rel="noreferrer"
                      className="btn-outline flex items-center justify-between gap-3 w-full px-5 py-4 border border-gray-700 hover:border-blue-700 text-gray-300 hover:text-blue-400 rounded-xl group transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <div className="text-left">
                          <p className="text-sm font-mono font-semibold">LinkedIn Profile</p>
                          <p className="text-xs font-mono opacity-50">uzair-waseem-digital</p>
                        </div>
                      </div>
                      <svg className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </a>

                    <a
                      href="https://github.com/Uzair-Waseem-390"
                      target="_blank"
                      rel="noreferrer"
                      className="btn-outline flex items-center justify-between gap-3 w-full px-5 py-4 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl group transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                        </svg>
                        <div className="text-left">
                          <p className="text-sm font-mono font-semibold">GitHub</p>
                          <p className="text-xs font-mono opacity-50">Uzair-Waseem-390</p>
                        </div>
                      </div>
                      <svg className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Bottom nav ───────────────────────────────── */}
        <div className="border-t border-gray-800 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono text-gray-700">
            Built with React + Tailwind v4 · Simulated backend — no real server
          </p>
          <div className="flex gap-3">
            <button onClick={() => onNavigate('playground')} className={`btn-primary text-xs font-mono px-4 py-2 ${accentFill} text-white rounded-lg`}>
              Try API Playground
            </button>
            <button onClick={() => onNavigate('projects')} className="btn-outline text-xs font-mono px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-lg">
              View Projects
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}















// import { useState, useEffect, useRef } from 'react'
// import { useFramework } from '../../context/FrameworkContext'

// // ─────────────────────────────────────────────────────────────
// // INTERSECTION OBSERVER HOOK
// // ─────────────────────────────────────────────────────────────
// function useInView(ref, threshold = 0.1) {
//   const [visible, setVisible] = useState(false)
//   useEffect(() => {
//     const obs = new IntersectionObserver(
//       ([e]) => { if (e.isIntersecting) setVisible(true) },
//       { threshold }
//     )
//     if (ref.current) obs.observe(ref.current)
//     return () => obs.disconnect()
//   }, [ref, threshold])
//   return visible
// }

// function Reveal({ children, delay = 0, direction = 'up', className = '' }) {
//   const ref = useRef(null)
//   const visible = useInView(ref, 0.08)
//   const animClass = {
//     up:    'animate-fade-up',
//     left:  'animate-slide-left',
//     right: 'animate-slide-right',
//   }[direction] || 'animate-fade-up'

//   return (
//     <div
//       ref={ref}
//       style={{ animationDelay: `${delay}ms` }}
//       className={`${visible ? animClass : 'opacity-0'} ${className}`}
//     >
//       {children}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────
// // DATA
// // ─────────────────────────────────────────────────────────────

// const techStack = {
//   Backend: [
//     { name: 'Django',       level: 90, color: 'bg-green-500',  badge: 'text-green-400 border-green-800 bg-green-950/30',  note: 'Primary framework — production SaaS projects' },
//     { name: 'FastAPI',      level: 82, color: 'bg-blue-500',   badge: 'text-blue-400 border-blue-800 bg-blue-950/30',    note: 'Async APIs, AI services, microservices' },
//     { name: 'PostgreSQL',   level: 85, color: 'bg-indigo-500', badge: 'text-indigo-400 border-indigo-800 bg-indigo-950/30', note: 'Primary DB — schema design, indexing, optimization' },
//     { name: 'Redis',        level: 65, color: 'bg-red-500',    badge: 'text-red-400 border-red-800 bg-red-950/30',       note: 'Caching, session storage (conceptual)' },
//     { name: 'JWT / Auth',   level: 88, color: 'bg-yellow-500', badge: 'text-yellow-400 border-yellow-800 bg-yellow-950/30', note: 'Stateless auth, refresh rotation, RBAC' },
//     { name: 'REST APIs',    level: 92, color: 'bg-emerald-500',badge: 'text-emerald-400 border-emerald-800 bg-emerald-950/30', note: 'Design, versioning, error contracts' },
//   ],
//   Frontend: [
//     { name: 'React',        level: 75, color: 'bg-cyan-500',   badge: 'text-cyan-400 border-cyan-800 bg-cyan-950/30',    note: 'Used for frontend simulation tooling' },
//     { name: 'Next.js',      level: 60, color: 'bg-gray-400',   badge: 'text-gray-300 border-gray-600 bg-gray-800/40',   note: 'BusinessPulse — SSR & marketing pages' },
//     { name: 'Tailwind CSS', level: 78, color: 'bg-sky-500',    badge: 'text-sky-400 border-sky-800 bg-sky-950/30',      note: 'UI framework across all frontend work' },
//   ],
//   'AI & Tooling': [
//     { name: 'OpenAI SDK',   level: 72, color: 'bg-purple-500', badge: 'text-purple-400 border-purple-800 bg-purple-950/30', note: 'Agent loops, structured prompting, schema gen' },
//     { name: 'Git / GitHub', level: 88, color: 'bg-orange-500', badge: 'text-orange-400 border-orange-800 bg-orange-950/30', note: 'Version control, branching, open source' },
//     { name: 'Gunicorn / Uvicorn', level: 70, color: 'bg-teal-500', badge: 'text-teal-400 border-teal-800 bg-teal-950/30', note: 'WSGI/ASGI server config, worker tuning' },
//   ],
// }

// const philosophyPoints = [
//   {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//       </svg>
//     ),
//     title: 'Clean API Contracts',
//     text: 'An API is a contract. Every endpoint has a defined input, a defined output, and consistent error shapes. Clients should never be surprised.',
//   },
//   {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//       </svg>
//     ),
//     title: 'Security by Default',
//     text: "Auth, hashing, rate limiting, and input validation aren't afterthoughts. They're baked into the first version, not added when something breaks.",
//   },
//   {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
//       </svg>
//     ),
//     title: 'Performance Awareness',
//     text: 'Know your query count per request. Know which fields are indexed. Understand your cache hit rate. Performance is measured, not assumed.',
//   },
//   {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 4 8 4" />
//       </svg>
//     ),
//     title: 'Schema-First Thinking',
//     text: 'The database is the source of truth. Model relationships correctly from the start. Migrations are versioned. Indexes are deliberate.',
//   },
//   {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
//       </svg>
//     ),
//     title: 'Separation of Concerns',
//     text: 'Views are thin. Services hold business logic. Models are data. No fat controllers, no logic in templates. Every layer has one job.',
//   },
//   {
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
//       </svg>
//     ),
//     title: 'Framework Agnostic Thinking',
//     text: 'Django and FastAPI are tools. Understanding both means choosing the right one — not defaulting to familiarity. The problem picks the framework.',
//   },
// ]

// const focusAreas = [
//   { label: 'REST API Design',       icon: '⬡', desc: 'Resource modeling, versioning, error contracts' },
//   { label: 'Authentication Systems', icon: '⬡', desc: 'JWT, refresh rotation, RBAC, session security' },
//   { label: 'Database Architecture', icon: '⬡', desc: 'Normalization, indexing, query optimization' },
//   { label: 'SaaS Backend Systems',  icon: '⬡', desc: 'Multi-tenant, role management, financial flows' },
//   { label: 'AI Integration',        icon: '⬡', desc: 'OpenAI SDK, agent loops, structured prompting' },
//   { label: 'Performance Design',    icon: '⬡', desc: 'Caching strategy, async workers, profiling' },
// ]

// const currentlyLearning = [
//   'Docker & containerization workflows',
//   'AWS fundamentals (EC2, RDS, S3)',
//   'System design at scale — load balancing, sharding',
//   'Advanced async patterns in FastAPI',
// ]

// // ─────────────────────────────────────────────────────────────
// // SKILL BAR
// // ─────────────────────────────────────────────────────────────
// function SkillBar({ name, level, color, badge, note, delay }) {
//   const ref = useRef(null)
//   const visible = useInView(ref, 0.1)
//   const [animated, setAnimated] = useState(false)

//   useEffect(() => {
//     if (visible && !animated) {
//       setTimeout(() => setAnimated(true), delay)
//     }
//   }, [visible, delay, animated])

//   return (
//     <div ref={ref} className="group">
//       <div className="flex items-center justify-between mb-1.5">
//         <div className="flex items-center gap-2">
//           <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${badge}`}>{name}</span>
//         </div>
//         <span className="text-xs font-mono text-gray-600">{level}%</span>
//       </div>
//       <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
//         <div
//           className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
//           style={{ width: animated ? `${level}%` : '0%' }}
//         />
//       </div>
//       <p className="text-xs font-mono text-gray-700 mt-1 leading-relaxed group-hover:text-gray-500 transition-colors">{note}</p>
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────
// // MAIN
// // ─────────────────────────────────────────────────────────────
// export default function About({ onNavigate }) {
//   const { mode } = useFramework()

//   const accentColor  = mode === 'django' ? 'text-emerald-400'  : 'text-blue-400'
//   const accentBorder = mode === 'django' ? 'border-emerald-800' : 'border-blue-800'
//   const accentBg     = mode === 'django' ? 'bg-emerald-950/30' : 'bg-blue-950/30'
//   const accentFill   = mode === 'django' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
//   const accentBadge  = `${accentColor} ${accentBorder} ${accentBg}`

//   const [activeStackCategory, setActiveStackCategory] = useState('Backend')

//   return (
//     <div className="page-enter min-h-screen">

//       {/* ── Sticky Page Header ─────────────────────────── */}
//       <div className="sticky top-14 z-30 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between flex-wrap gap-3">
//             <div>
//               <div className="flex items-center gap-2 mb-0.5">
//                 <button onClick={() => onNavigate('home')} className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors">← Home</button>
//                 <span className="text-gray-700">/</span>
//                 <span className="text-xs font-mono text-gray-400">About Engineer</span>
//               </div>
//               <h1 className="text-xl font-mono font-bold text-white">About Engineer</h1>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="flex items-center gap-1.5">
//                 <div className={`w-1.5 h-1.5 rounded-full glow-dot ${mode === 'django' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
//                 <span className={`text-xs font-mono ${accentColor}`}>{mode === 'django' ? 'Django' : 'FastAPI'} Mode</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">

//         {/* ══════════════════════════════════════════════════
//             SECTION 1 — HERO (Photo left, info right)
//         ══════════════════════════════════════════════════ */}
//         <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

//           {/* Left — Photo */}
//           <Reveal direction="left">
//             <div className="flex flex-col items-center lg:items-start gap-6">
//               <div className="relative">
//                 <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-gray-700 bg-gray-900 shadow-2xl shadow-black/60">
//                   <img
//                     src="/src/assets/images/uzair.png"
//                     alt="Uzair Waseem"
//                     className="w-full h-full object-cover"
//                     onError={e => {
//                       e.target.style.display = 'none'
//                       e.target.nextSibling.style.display = 'flex'
//                     }}
//                   />
//                   <div className="w-full h-full absolute inset-0 items-center justify-center bg-gray-900 font-mono text-gray-600 text-xs hidden flex-col gap-2" style={{ display: 'none' }}>
//                     <svg className="w-14 h-14 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     uzair.png
//                   </div>
//                 </div>

//                 {/* Status badge */}
//                 <div className="absolute -bottom-4 -right-4 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 shadow-xl">
//                   <div className="flex items-center gap-2 mb-0.5">
//                     <div className="w-2 h-2 rounded-full bg-emerald-400 glow-dot" />
//                     <span className="text-xs font-mono text-emerald-400 font-semibold">Available to Work</span>
//                   </div>
//                   <p className="text-xs font-mono text-gray-600 pl-4">Backend Engineer</p>
//                 </div>
//               </div>

//               {/* Quick links under photo */}
//               <div className="flex items-center gap-3 mt-6">
//                 <a href="https://github.com/Uzair-Waseem-390" target="_blank" rel="noreferrer"
//                   className="footer-link flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-all">
//                   <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
//                   </svg>
//                   GitHub
//                 </a>
//                 <a href="https://www.linkedin.com/in/uzair-waseem-digital/" target="_blank" rel="noreferrer"
//                   className="footer-link flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-blue-400 border border-gray-800 hover:border-blue-800 px-3 py-1.5 rounded-lg transition-all">
//                   <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
//                   </svg>
//                   LinkedIn
//                 </a>
//                 <a href="/src/assets/images/Uzair Waseem – Backend Developer Resume.pdf" target="_blank" rel="noreferrer"
//                   className="footer-link flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-emerald-400 border border-gray-800 hover:border-emerald-800 px-3 py-1.5 rounded-lg transition-all">
//                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                   Resume
//                 </a>
//               </div>
//             </div>
//           </Reveal>

//           {/* Right — Info */}
//           <Reveal direction="right" delay={80}>
//             <div className="space-y-5">
//               {/* Name + role */}
//               <div>
//                 <div className={`inline-flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-lg border mb-3 ${accentBadge}`}>
//                   <div className={`w-1.5 h-1.5 rounded-full ${mode === 'django' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
//                   Backend Engineer
//                 </div>
//                 <h2 className="text-3xl sm:text-4xl font-mono font-bold text-white mb-1">Uzair Waseem</h2>
//                 <p className="text-sm font-mono text-gray-500">
//                   Building backend systems that are designed to last — not just to ship.
//                 </p>
//               </div>

//               {/* Bio */}
//               <div className="space-y-3 text-sm font-mono text-gray-400 leading-relaxed">
//                 <p>
//                   I'm a backend-focused developer who builds with{' '}
//                   <span className="text-green-400">Django</span> and{' '}
//                   <span className="text-blue-400">FastAPI</span> — choosing the right tool based on the problem, not habit.
//                 </p>
//                 <p>
//                   My work centers on API design, authentication systems, and database architecture. I care about
//                   clean contracts, secure defaults, and performance that's measured — not assumed.
//                 </p>
//                 <p>
//                   This portfolio is itself a backend simulation tool — not a typical "hi I'm Uzair" page. It demonstrates
//                   the way I think about systems: layers, contracts, tradeoffs, and visibility.
//                 </p>
//               </div>

//               {/* Mode-specific framing */}
//               <div className={`border rounded-xl p-4 ${accentBorder} ${accentBg}`}>
//                 <p className="text-xs font-mono text-gray-500 mb-1">
//                   {mode === 'django' ? 'Django-first perspective' : 'FastAPI-first perspective'}
//                 </p>
//                 <p className={`text-sm font-mono ${accentColor}`}>
//                   {mode === 'django'
//                     ? '"Django taught me structure. Convention over configuration means fewer decisions on things that don\'t matter — so I can focus on the ones that do."'
//                     : '"FastAPI taught me explicitness. When every dependency is injected and every type is declared, there\'s nowhere to hide bad design."'
//                   }
//                 </p>
//               </div>

//               {/* Stats row */}
//               <div className="grid grid-cols-3 gap-3">
//                 {[
//                   { val: '4+',  label: 'Projects Shipped' },
//                   { val: '2',   label: 'Frameworks Mastered' },
//                   { val: '18',  label: 'API Endpoints Built' },
//                 ].map(s => (
//                   <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center metric-card">
//                     <div className={`text-2xl font-mono font-bold ${accentColor}`}>{s.val}</div>
//                     <div className="text-xs font-mono text-gray-500 mt-0.5 leading-tight">{s.label}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </Reveal>
//         </section>

//         {/* ══════════════════════════════════════════════════
//             SECTION 2 — TECH STACK
//         ══════════════════════════════════════════════════ */}
//         <section>
//           <Reveal>
//             <div className="flex items-center gap-3 mb-6">
//               <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Tech Stack</h2>
//               <div className="flex-1 h-px bg-gray-800" />
//             </div>
//           </Reveal>

//           {/* Category tabs */}
//           <Reveal delay={60}>
//             <div className="flex gap-2 mb-7 flex-wrap">
//               {Object.keys(techStack).map(cat => (
//                 <button
//                   key={cat}
//                   onClick={() => setActiveStackCategory(cat)}
//                   className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-200 ${
//                     activeStackCategory === cat
//                       ? `${accentColor} ${accentBorder} ${accentBg}`
//                       : 'text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300'
//                   }`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//           </Reveal>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
//             {techStack[activeStackCategory].map((skill, i) => (
//               <Reveal key={skill.name} delay={i * 60}>
//                 <SkillBar {...skill} delay={i * 80} />
//               </Reveal>
//             ))}
//           </div>
//         </section>

//         {/* ══════════════════════════════════════════════════
//             SECTION 3 — ENGINEERING FOCUS
//         ══════════════════════════════════════════════════ */}
//         <section>
//           <Reveal>
//             <div className="flex items-center gap-3 mb-6">
//               <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Engineering Focus</h2>
//               <div className="flex-1 h-px bg-gray-800" />
//             </div>
//           </Reveal>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {focusAreas.map((area, i) => (
//               <Reveal key={area.label} delay={i * 55}>
//                 <div className="metric-card bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 group">
//                   <div className="flex items-center gap-2 mb-2">
//                     <span className={`text-lg ${accentColor} transition-transform duration-200 group-hover:scale-110`}>⬡</span>
//                     <span className="text-sm font-mono font-semibold text-white">{area.label}</span>
//                   </div>
//                   <p className="text-xs font-mono text-gray-500 leading-relaxed">{area.desc}</p>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </section>

//         {/* ══════════════════════════════════════════════════
//             SECTION 4 — ENGINEERING PHILOSOPHY
//         ══════════════════════════════════════════════════ */}
//         <section>
//           <Reveal>
//             <div className="flex items-center gap-3 mb-6">
//               <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Engineering Philosophy</h2>
//               <div className="flex-1 h-px bg-gray-800" />
//             </div>
//           </Reveal>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {philosophyPoints.map((pt, i) => (
//               <Reveal key={pt.title} delay={i * 50}>
//                 <div className="metric-card bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 group h-full">
//                   <div className="flex items-start gap-3">
//                     <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 transition-colors duration-200 ${
//                       mode === 'django'
//                         ? 'text-emerald-400 border-emerald-900 bg-emerald-950/40 group-hover:border-emerald-700'
//                         : 'text-blue-400 border-blue-900 bg-blue-950/40 group-hover:border-blue-700'
//                     }`}>
//                       {pt.icon}
//                     </div>
//                     <div>
//                       <h3 className="text-sm font-mono font-semibold text-white mb-1.5">{pt.title}</h3>
//                       <p className="text-xs font-mono text-gray-500 leading-relaxed">{pt.text}</p>
//                     </div>
//                   </div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </section>

//         {/* ══════════════════════════════════════════════════
//             SECTION 5 — CURRENTLY LEARNING
//         ══════════════════════════════════════════════════ */}
//         <section>
//           <Reveal>
//             <div className="flex items-center gap-3 mb-6">
//               <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Currently Learning</h2>
//               <div className="flex-1 h-px bg-gray-800" />
//               <span className="text-xs font-mono text-gray-700 italic">always in progress</span>
//             </div>
//           </Reveal>

//           <Reveal delay={60}>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               {currentlyLearning.map((item, i) => (
//                 <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 metric-card hover:border-gray-700">
//                   <div className="w-5 h-5 rounded-full border border-dashed border-gray-600 flex items-center justify-center shrink-0">
//                     <div className={`w-1.5 h-1.5 rounded-full ${accentColor.replace('text-', 'bg-')} animate-pulse`} />
//                   </div>
//                   <span className="text-xs font-mono text-gray-300">{item}</span>
//                 </div>
//               ))}
//             </div>
//           </Reveal>
//         </section>

//         {/* ══════════════════════════════════════════════════
//             SECTION 6 — RESUME + LINKS CARD
//         ══════════════════════════════════════════════════ */}
//         <section>
//           <Reveal>
//             <div className="flex items-center gap-3 mb-6">
//               <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Get In Touch</h2>
//               <div className="flex-1 h-px bg-gray-800" />
//             </div>
//           </Reveal>

//           <Reveal delay={60}>
//             <div className={`border rounded-2xl overflow-hidden ${accentBorder}`}>
//               {/* Top accent bar */}
//               <div className={`h-1 w-full ${mode === 'django' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`} />

//               <div className="p-8 sm:p-10">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

//                   {/* Left text */}
//                   <div>
//                     <h3 className="text-xl font-mono font-bold text-white mb-3">Open to Backend Roles</h3>
//                     <p className="text-sm font-mono text-gray-400 leading-relaxed mb-4">
//                       I'm actively looking for backend engineering opportunities — full-time, contract, or freelance.
//                       If you're building something that needs clean API design, solid auth, or database-first thinking, let's talk.
//                     </p>
//                     <div className="space-y-2">
//                       {[
//                         'Backend Developer (Django / FastAPI)',
//                         'API Engineer',
//                         'Full Stack with Backend Focus',
//                         'Remote or On-site — Karachi, PK',
//                       ].map(role => (
//                         <div key={role} className="flex items-center gap-2 text-xs font-mono text-gray-400">
//                           <svg className={`w-3.5 h-3.5 shrink-0 ${accentColor}`} fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
//                           </svg>
//                           {role}
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Right links */}
//                   <div className="space-y-3">
//                     <a
//                       href="/src/assets/images/Uzair Waseem – Backend Developer Resume.pdf"
//                       target="_blank"
//                       rel="noreferrer"
//                       className={`btn-primary flex items-center justify-between gap-3 w-full px-5 py-4 ${accentFill} text-white rounded-xl shadow-lg group`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                         <div className="text-left">
//                           <p className="text-sm font-mono font-semibold">Download Resume</p>
//                           <p className="text-xs font-mono opacity-70">PDF — Backend Developer</p>
//                         </div>
//                       </div>
//                       <svg className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
//                       </svg>
//                     </a>

//                     <a
//                       href="https://www.linkedin.com/in/uzair-waseem-digital/"
//                       target="_blank"
//                       rel="noreferrer"
//                       className="btn-outline flex items-center justify-between gap-3 w-full px-5 py-4 border border-gray-700 hover:border-blue-700 text-gray-300 hover:text-blue-400 rounded-xl group transition-all duration-200"
//                     >
//                       <div className="flex items-center gap-3">
//                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                           <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
//                         </svg>
//                         <div className="text-left">
//                           <p className="text-sm font-mono font-semibold">LinkedIn Profile</p>
//                           <p className="text-xs font-mono opacity-50">uzair-waseem-digital</p>
//                         </div>
//                       </div>
//                       <svg className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
//                       </svg>
//                     </a>

//                     <a
//                       href="https://github.com/Uzair-Waseem-390"
//                       target="_blank"
//                       rel="noreferrer"
//                       className="btn-outline flex items-center justify-between gap-3 w-full px-5 py-4 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl group transition-all duration-200"
//                     >
//                       <div className="flex items-center gap-3">
//                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                           <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
//                         </svg>
//                         <div className="text-left">
//                           <p className="text-sm font-mono font-semibold">GitHub</p>
//                           <p className="text-xs font-mono opacity-50">Uzair-Waseem-390</p>
//                         </div>
//                       </div>
//                       <svg className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
//                       </svg>
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </Reveal>
//         </section>

//         {/* ── Bottom nav ───────────────────────────────── */}
//         <div className="border-t border-gray-800 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
//           <p className="text-xs font-mono text-gray-700">
//             Built with React + Tailwind v4 · Simulated backend — no real server
//           </p>
//           <div className="flex gap-3">
//             <button onClick={() => onNavigate('playground')} className={`btn-primary text-xs font-mono px-4 py-2 ${accentFill} text-white rounded-lg`}>
//               Try API Playground
//             </button>
//             <button onClick={() => onNavigate('projects')} className="btn-outline text-xs font-mono px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-lg">
//               View Projects
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }