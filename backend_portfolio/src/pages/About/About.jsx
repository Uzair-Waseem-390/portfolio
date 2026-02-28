import { useState, useEffect } from 'react'

const techStack = {
  Backend: [
    { name: 'Django',      level: 90, color: '#4ade80' },
    { name: 'FastAPI',     level: 82, color: '#60a5fa' },
    { name: 'PostgreSQL',  level: 80, color: '#60a5fa' },
    { name: 'Redis',       level: 65, color: '#f87171' },
    { name: 'Celery',      level: 70, color: '#f59e0b' },
    { name: 'JWT / Auth',  level: 85, color: '#a78bfa' },
  ],
  Frontend: [
    { name: 'React',       level: 75, color: '#4ade80' },
    { name: 'Next.js',     level: 60, color: '#e2eaf4' },
    { name: 'JavaScript',  level: 72, color: '#f59e0b' },
  ],
  AI: [
    { name: 'OpenAI SDK',  level: 78, color: '#a78bfa' },
    { name: 'LLM Agents',  level: 72, color: '#a78bfa' },
    { name: 'Prompt Eng.', level: 80, color: '#fb923c' },
  ],
}

const engineeringFocus = [
  {
    icon: '⬡',
    color: '#60a5fa',
    title: 'Clean API Contracts',
    body: 'RESTful design, consistent status codes, structured error responses. APIs that are intuitive without reading the docs.'
  },
  {
    icon: '⬡',
    color: '#4ade80',
    title: 'Secure Authentication',
    body: 'JWT with refresh rotation, bcrypt hashing, RBAC, rate limiting. Security built in from day one, not patched on later.'
  },
  {
    icon: '⬡',
    color: '#a78bfa',
    title: 'Performance-Aware Design',
    body: 'Redis caching, query optimization, N+1 prevention, async workers. Performance considered at the design stage, not after slowness appears.'
  },
  {
    icon: '⬡',
    color: '#f59e0b',
    title: 'Structured Error Handling',
    body: 'Consistent error envelopes, domain-specific error codes, validation at every layer. Errors that are debuggable and client-friendly.'
  },
  {
    icon: '⬡',
    color: '#fb923c',
    title: 'System Thinking',
    body: 'Understanding the full request lifecycle from client to DB and back. Designing for failure, scale, and maintainability from the start.'
  },
  {
    icon: '⬡',
    color: '#f87171',
    title: 'Documentation Mindset',
    body: 'Code and APIs should be self-documenting. Architecture decisions should be written down. Future engineers (and future-me) deserve context.'
  },
]

const philosophyLines = [
  'Backend engineering is about building systems that are correct before they are fast, and maintainable before they are clever.',
  'Every decision has a trade-off. Acknowledging those trade-offs is more valuable than pretending the "best" solution exists in a vacuum.',
  'The best API is the one that requires the least documentation because the design makes the intent obvious.',
  'I would rather write 50 lines of clear, explicit code than 20 lines of clever code that needs a comment to explain it.',
]

function SkillBar({ name, level, color }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="skill-bar-item">
      <div className="skill-bar-top">
        <span className="skill-name">{name}</span>
        <span className="skill-pct" style={{ color }}>{level}%</span>
      </div>
      <div className="skill-bar-track">
        <div
          className="skill-bar-fill"
          style={{
            width: animated ? `${level}%` : '0%',
            background: color,
            transition: 'width 0.9s ease',
            boxShadow: `0 0 8px ${color}40`
          }}
        ></div>
      </div>
    </div>
  )
}

export default function About() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`about-page ${loaded ? 'page-loaded' : ''}`}>

      {/* Header */}
      <div className="about-header anim-item" style={{ '--delay': '0.05s' }}>
        <div className="section-tag">ABOUT ENGINEER</div>
        <h1 className="pg-title">Uzair Waseem</h1>
        <p className="pg-subtitle">Backend Developer · Django · FastAPI · PostgreSQL · OpenAI SDK</p>
      </div>

      {/* Main 2-col */}
      <div className="about-layout">

        {/* LEFT — tech stack */}
        <div className="about-left anim-item" style={{ '--delay': '0.12s' }}>

          {/* Profile image */}
          <div className="about-image-frame">
            <img
              src="/src/assets/images/uzair.png"
              alt="Uzair Waseem"
              className="about-image"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="about-image-placeholder" style={{ display: 'none' }}>
              <span className="placeholder-initials">UW</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="about-quick-links">
            <a
              href="https://github.com/Uzair-Waseem-390"
              target="_blank" rel="noreferrer"
              className="about-link-btn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/uzair-waseem-digital/"
              target="_blank" rel="noreferrer"
              className="about-link-btn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <a
              href="/src/assets/images/Uzair Waseem – Backend Developer Resume.pdf"
              target="_blank" rel="noreferrer"
              className="about-link-btn resume-btn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
              </svg>
              Resume PDF
            </a>
          </div>

          {/* Tech Stack */}
          {Object.entries(techStack).map(([category, skills]) => (
            <div key={category} className="skill-category">
              <div className="skill-category-label">{category.toUpperCase()}</div>
              <div className="skill-bars">
                {skills.map(skill => (
                  <SkillBar key={skill.name} {...skill} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT — content */}
        <div className="about-right anim-item" style={{ '--delay': '0.2s' }}>

          {/* Engineering Focus */}
          <div className="about-section">
            <div className="about-section-tag">ENGINEERING FOCUS</div>
            <div className="focus-grid">
              {engineeringFocus.map((f, i) => (
                <div key={i} className="focus-card" style={{ '--focus-color': f.color }}>
                  <div className="focus-icon" style={{ color: f.color }}>⬡</div>
                  <div className="focus-content">
                    <div className="focus-title">{f.title}</div>
                    <p className="focus-body">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Summary */}
          <div className="about-section">
            <div className="about-section-tag">PROJECTS SUMMARY</div>
            <div className="projects-summary-grid">
              <div className="summary-stat">
                <div className="summary-num">4</div>
                <div className="summary-label">Projects Built</div>
              </div>
              <div className="summary-stat">
                <div className="summary-num">2</div>
                <div className="summary-label">Frameworks Mastered</div>
              </div>
              <div className="summary-stat">
                <div className="summary-num">3</div>
                <div className="summary-label">AI-Powered Systems</div>
              </div>
              <div className="summary-stat">
                <div className="summary-num">∞</div>
                <div className="summary-label">Still Learning</div>
              </div>
            </div>
          </div>

          {/* Philosophy */}
          <div className="about-section">
            <div className="about-section-tag">ENGINEERING PHILOSOPHY</div>
            <div className="philosophy-lines">
              {philosophyLines.map((line, i) => (
                <div key={i} className="philosophy-line">
                  <span className="philosophy-num">{String(i + 1).padStart(2, '0')}</span>
                  <p className="philosophy-text">{line}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}