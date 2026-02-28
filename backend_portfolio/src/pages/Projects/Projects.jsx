import { useState, useEffect } from 'react'

const projects = [
  {
    id: 1,
    title: 'School Management System',
    subtitle: 'SaaS Architecture · Multi-Branch · Role-Based Access Control',
    stack: ['Django', 'PostgreSQL', 'Redis', 'Celery', 'DRF'],
    stackIcons: [
      { label: 'Django', color: '#4ade80' },
      { label: 'PostgreSQL', color: '#60a5fa' },
      { label: 'Redis', color: '#f87171' },
      { label: 'Celery', color: '#f59e0b' },
      { label: 'DRF', color: '#a78bfa' },
    ],
    image: '/src/assets/images/School Management System.png',
    overview: 'A fully functional SaaS-based School Management System designed to manage multi-branch institutions under a single platform. Focuses heavily on financial intelligence, institutional workflows, and structured role management.',
    highlights: [
      'Multi-branch SaaS architecture with tenant isolation',
      'Role-Based Access Control (Admin, Teacher, Parent, Student)',
      'Financial module: fee management, invoicing, payment tracking',
      'Institutional workflow engine for admissions and enrollment',
    ],
    architecture: 'Monolithic Django application with modular app structure. Each role has separate permission sets enforced at the view and serializer level. Multi-branch data isolation via scoped querysets.',
    github: 'https://github.com/Uzair-Waseem-390/SMS',
    linkedin: 'https://www.linkedin.com/posts/uzair-waseem-digital_%F0%9D%98%BC%F0%9D%99%A8%F0%9D%99%A8%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%A2%F0%9D%99%AA%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%9E%F0%9D%99%A0%F0%9D%99%AA%F0%9D%99%A2-this-one-activity-7430745190128046080-sDeg',
    imageRight: true,
  },
  {
    id: 2,
    title: 'Datavo',
    subtitle: 'AI-Powered Database Schema Architect',
    stack: ['FastAPI', 'React', 'OpenAI SDK', 'PostgreSQL', 'Pydantic'],
    stackIcons: [
      { label: 'FastAPI', color: '#60a5fa' },
      { label: 'React', color: '#4ade80' },
      { label: 'OpenAI', color: '#a78bfa' },
      { label: 'PostgreSQL', color: '#60a5fa' },
      { label: 'Pydantic', color: '#fb923c' },
    ],
    image: '/src/assets/images/Datavo.png',
    overview: 'An AI-powered system that generates clean, structured database schemas after refining requirements through structured clarification. Unlike generic LLM schema generators, Datavo asks questions, refines step-by-step, and avoids blind assumptions.',
    highlights: [
      'Multi-step clarification agent before schema generation',
      'Avoids assumption-based schema generation',
      'Structured schema output in SQL and ERD format',
      'Built from real architectural failures in a large-scale project',
    ],
    architecture: 'FastAPI backend with OpenAI SDK agent pipeline. Pydantic models enforce schema structure at every stage. React frontend for interactive requirement gathering flow.',
    github: 'https://github.com/Uzair-Waseem-390/Datavo',
    linkedin: 'https://www.linkedin.com/posts/uzair-waseem-digital_%F0%9D%98%BC%F0%9D%99%A8%F0%9D%99%A8%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%A2%F0%9D%99%AA%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%9E%F0%9D%99%A0%F0%9D%99%AA%F0%9D%99%A2-some-projects-activity-7433219597077700608-KByW',
    imageRight: false,
  },
  {
    id: 3,
    title: 'UzairMart',
    subtitle: 'Django eCommerce Application',
    stack: ['Django', 'PostgreSQL', 'JWT', 'Celery', 'SMTP'],
    stackIcons: [
      { label: 'Django', color: '#4ade80' },
      { label: 'PostgreSQL', color: '#60a5fa' },
      { label: 'JWT', color: '#f59e0b' },
      { label: 'Celery', color: '#f59e0b' },
      { label: 'Email', color: '#a78bfa' },
    ],
    image: '/src/assets/images/UzairMart.png',
    overview: 'A Django-based eCommerce web application simulating a real-world online store. Focused heavily on backend logic, user authentication security, and real-world cart handling complexity.',
    highlights: [
      'Secure email verification on registration',
      'Password reset with tokenized secure links',
      'Multi-item cart with quantity management',
      'Full checkout flow with order history',
    ],
    architecture: 'Classic Django monolith with session-based cart management. Email flows handled via Celery async worker. JWT auth for API endpoints alongside Django session auth for web views.',
    github: 'https://github.com/Uzair-Waseem-390/uzairmart',
    linkedin: 'https://www.linkedin.com/posts/uzair-waseem-digital_%F0%9D%98%BC%F0%9D%99%A8%F0%9D%99%A8%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%A2%F0%9D%99%AA%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%9E%F0%9D%99%A0%F0%9D%99%AA%F0%9D%99%A2-another-activity-7420964103248039936-AHLP',
    imageRight: true,
  },
  {
    id: 4,
    title: 'BusinessPulse',
    subtitle: 'AI Decision Support System for Startups',
    stack: ['Next.js', 'JavaScript', 'OpenAI', 'PostgreSQL', 'Vercel'],
    stackIcons: [
      { label: 'Next.js', color: '#e2eaf4' },
      { label: 'JavaScript', color: '#f59e0b' },
      { label: 'OpenAI', color: '#a78bfa' },
      { label: 'PostgreSQL', color: '#60a5fa' },
      { label: 'Vercel', color: '#e2eaf4' },
    ],
    image: '/src/assets/images/BusinessPulse.png',
    overview: 'A SaaS-based decision support system designed specifically for low-budget startups and small business owners. Built with a marketing-first mindset — structured business data, scenario-based decision testing, pattern & trend identification.',
    highlights: [
      'Scenario-based decision testing engine',
      'Business pattern and trend identification',
      'Actionable AI insights (not generic chat)',
      'Designed for non-technical business owners',
    ],
    architecture: 'Next.js full-stack application with OpenAI API integration. Data-driven AI prompts with structured business context injection. Marketing-oriented UX design over feature-packed complexity.',
    github: null,
    linkedin: 'https://www.linkedin.com/posts/uzair-waseem-digital_%F0%9D%98%BC%F0%9D%99%A8%F0%9D%99%A8%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%A2%F0%9D%99%AA%F0%9D%99%96%F0%9D%99%A1%F0%9D%99%96%F0%9D%99%9E%F0%9D%99%A0%F0%9D%99%AA%F0%9D%99%A2-today-activity-7408600825926742016-G7oU',
    imageRight: false,
  },
]

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

export default function Projects() {
  const [loaded, setLoaded] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`projects-page ${loaded ? 'page-loaded' : ''}`}>

      <div className="projects-header anim-item" style={{ '--delay': '0.05s' }}>
        <div className="section-tag">PROJECTS</div>
        <h1 className="pg-title">Engineering Case Studies</h1>
        <p className="pg-subtitle">Real-world backend systems built from scratch. Click any project to explore the architecture.</p>
      </div>

      <div className="projects-list">
        {projects.map((project, idx) => (
          <article
            key={project.id}
            className={`project-card anim-item ${project.imageRight ? 'img-right' : 'img-left'}`}
            style={{ '--delay': `${0.1 + idx * 0.08}s` }}
          >
            {/* Image side */}
            <div className="project-image-col">
              <div className="project-image-frame">
                <img
                  src={project.image}
                  alt={project.title}
                  className="project-image"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="project-image-fallback" style={{ display: 'none' }}>
                  <span className="fallback-num">0{project.id}</span>
                  <span className="fallback-title">{project.title}</span>
                </div>
                <div className="project-image-overlay">
                  <div className="project-index">Project {String(project.id).padStart(2,'0')}</div>
                </div>
              </div>
            </div>

            {/* Content side */}
            <div className="project-content-col">
              <div className="project-stack-icons">
                {project.stackIcons.map((icon, i) => (
                  <span
                    key={i}
                    className="stack-icon-badge"
                    style={{ borderColor: icon.color, color: icon.color }}
                  >
                    {icon.label}
                  </span>
                ))}
              </div>

              <h2 className="project-title">{project.title}</h2>
              <p className="project-subtitle-text">{project.subtitle}</p>
              <p className="project-overview">{project.overview}</p>

              <div className="project-highlights">
                {project.highlights.map((h, i) => (
                  <div key={i} className="project-highlight">
                    <span className="highlight-bullet">▸</span>
                    {h}
                  </div>
                ))}
              </div>

              {/* Expandable architecture section */}
              <button
                className={`arch-toggle-btn ${expandedId === project.id ? 'open' : ''}`}
                onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
              >
                <span>Architecture Notes</span>
                <span className="arch-toggle-chevron">{expandedId === project.id ? '▲' : '▼'}</span>
              </button>

              {expandedId === project.id && (
                <div className="project-arch-note">
                  <p>{project.architecture}</p>
                </div>
              )}

              <div className="project-links">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="project-link"
                  >
                    <GitHubIcon />
                    View Source
                  </a>
                )}
                <a
                  href={project.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="project-link linkedin"
                >
                  <LinkedInIcon />
                  LinkedIn Post
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}