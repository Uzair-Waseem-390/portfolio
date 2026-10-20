import { useState, useCallback, useEffect } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { FrameworkProvider } from './context/FrameworkContext'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import Dashboard from './pages/Dashboard/Dashboard'
import ApiPlayground from './pages/ApiPlayground/ApiPlayground'
import Architecture from './pages/Architecture/Architecture'
import Projects from './pages/Projects/Projects'
import About from './pages/About/About'

const PAGES = {
  home:         (props) => <Dashboard {...props} />,
  playground:   (props) => <ApiPlayground {...props} />,
  architecture: (props) => <Architecture {...props} />,
  projects:     (props) => <Projects {...props} />,
  about:        (props) => <About {...props} />,
}

const PAGE_META = {
  home: {
    title: 'Uzair Waseem | Backend Developer, AI & Flutter Engineer',
    path: '/',
  },
  playground: {
    title: 'API Playground | Uzair Waseem - Simulated Backend',
    path: '/playground',
  },
  architecture: {
    title: 'Architecture Decisions | Uzair Waseem - System Design',
    path: '/architecture',
  },
  projects: {
    title: 'Projects | Uzair Waseem - Django, FastAPI & AI Portfolio',
    path: '/projects',
  },
  about: {
    title: 'About Uzair Waseem | Backend & AI Systems Engineer',
    path: '/about',
  },
}

function getInitialPage() {
  if (typeof window === 'undefined') return 'home'
  const path = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase()
  if (PAGES[path]) return path
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  if (PAGES[hash]) return hash
  return 'home'
}

function App() {
  const [loaded, setLoaded] = useState(false)
  const [currentPage, setCurrentPage] = useState(getInitialPage)
  const [pageKey, setPageKey] = useState(0)

  // Sync document title and canonical URL whenever currentPage changes
  useEffect(() => {
    const meta = PAGE_META[currentPage] || PAGE_META.home
    document.title = meta.title

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = `https://uzair-waseem.vercel.app${meta.path === '/' ? '' : meta.path}`
  }, [currentPage])

  // Handle browser back and forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const page = getInitialPage()
      setCurrentPage(page)
      setPageKey(k => k + 1)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((page) => {
    const target = PAGES[page] ? page : 'home'
    if (target === currentPage) return

    const meta = PAGE_META[target] || PAGE_META.home
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', meta.path)
    }

    setCurrentPage(target)
    setPageKey(k => k + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const PageComponent = PAGES[currentPage] || PAGES.home

  return (
    <FrameworkProvider>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
      {loaded && (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
          <Header currentPage={currentPage} onNavigate={navigate} />
          <main className="flex-1">
            <PageComponent key={pageKey} onNavigate={navigate} onBack={navigate} />
          </main>
          <Footer onNavigate={navigate} />
        </div>
      )}
      <SpeedInsights />
    </FrameworkProvider>
  )
}

export default App
