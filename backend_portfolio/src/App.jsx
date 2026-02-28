import { useState } from 'react'
import { FrameworkProvider } from './context/FrameworkContext'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Dashboard from './pages/Dashboard/Dashboard'
import ApiPlayground from './pages/ApiPlayground/ApiPlayground'
import Architecture from './pages/Architecture/Architecture'
import Projects from './pages/Projects/Projects'
import About from './pages/About/About'
import './App.css'

function App() {
  const [page, setPage] = useState('home')

  return (
    <FrameworkProvider>
      <div className="app-shell">
        <Header page={page} setPage={setPage} />
        <main className="main-content">
          {page === 'home'         && <Dashboard setPage={setPage} />}
          {page === 'playground'   && <ApiPlayground />}
          {page === 'architecture' && <Architecture />}
          {page === 'projects'     && <Projects />}
          {page === 'about'        && <About />}
        </main>
        <Footer />
      </div>
    </FrameworkProvider>
  )
}

export default App