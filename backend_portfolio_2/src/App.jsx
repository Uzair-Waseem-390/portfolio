import { useState, useCallback } from 'react'
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

function App() {
  const [loaded, setLoaded] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')
  const [pageKey, setPageKey] = useState(0)

  const navigate = useCallback((page) => {
    if (page === currentPage) return
    setCurrentPage(page)
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
    </FrameworkProvider>
  )
}

export default App