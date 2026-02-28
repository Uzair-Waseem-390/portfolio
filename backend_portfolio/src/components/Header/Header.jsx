import { useFramework } from '../../context/FrameworkContext'

export default function Header({ page, setPage }) {
  const { mode, toggleMode } = useFramework()

  const navItems = [
    { id: 'home',         label: 'Backend Lab' },
    { id: 'playground',   label: 'API Playground' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'projects',     label: 'Projects' },
    { id: 'about',        label: 'About' },
  ]

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo">
          <span className="logo-bracket">[</span>
          <span className="logo-text">Uzair Backend Lab</span>
          <span className="logo-bracket">]</span>
        </div>

        <nav className="header-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header-right">
          <div className="framework-toggle">
            <span className="toggle-label">Mode:</span>
            <div className="toggle-buttons">
              <button
                className={`toggle-btn ${mode === 'django' ? 'active' : ''}`}
                onClick={() => mode !== 'django' && toggleMode()}
              >Django</button>
              <button
                className={`toggle-btn ${mode === 'fastapi' ? 'active' : ''}`}
                onClick={() => mode !== 'fastapi' && toggleMode()}
              >FastAPI</button>
            </div>
          </div>

          <div className="status-badge">
            <span className="status-dot"></span>
            <span className="status-text">Online</span>
          </div>

          <div className="api-version">v1.0</div>
        </div>
      </div>
    </header>
  )
}