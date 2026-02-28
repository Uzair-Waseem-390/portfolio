





import { useState, useEffect } from 'react'
import { useFramework } from '../../context/FrameworkContext'

export default function Header({ currentPage, onNavigate }) {
  const { mode, toggleMode } = useFramework()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { label: 'Backend Lab', page: 'home' },
    { label: 'API Playground', page: 'playground' },
    { label: 'Architecture', page: 'architecture' },
    { label: 'Projects', page: 'projects' },
    { label: 'About', page: 'about' },
  ]

  function handleNav(page) {
    onNavigate(page)
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className={`sticky top-0 z-50 animate-header-down transition-all duration-300 ${scrolled ? 'bg-gray-950/95 backdrop-blur-md border-b border-gray-800 shadow-lg shadow-black/40' : 'bg-gray-950 border-b border-gray-800/60'}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14">

          <button onClick={() => handleNav('home')} className="flex items-center gap-1.5 sm:gap-2 shrink-0 group">
            <div className="w-2 h-2 rounded-full bg-emerald-400 glow-dot group-hover:scale-125 transition-transform duration-200" />
            <span className="text-xs sm:text-sm font-mono font-semibold text-white tracking-tight group-hover:text-emerald-50 transition-colors duration-200 whitespace-nowrap">
              Uzair<span className="text-emerald-400">Backend</span>Lab
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
            {navLinks.map((link, i) => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                style={{ animationDelay: `${i * 60 + 100}ms` }}
                className={`nav-link animate-fade-in text-xs font-mono px-2 lg:px-3 py-1.5 rounded transition-colors duration-200 whitespace-nowrap ${currentPage === link.page ? 'text-emerald-400 active' : 'text-gray-400 hover:text-white'}`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <div className="flex items-center gap-0.5 bg-gray-900 border border-gray-700 rounded-md p-0.5 animate-fade-in delay-300">
              <button
                onClick={() => toggleMode('django')}
                className={`framework-btn text-[10px] sm:text-xs font-mono px-1.5 sm:px-2.5 py-1 rounded whitespace-nowrap ${mode === 'django' ? 'active bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-500 hover:text-gray-200'}`}
              >
                Django
              </button>
              <button
                onClick={() => toggleMode('fastapi')}
                className={`framework-btn text-[10px] sm:text-xs font-mono px-1.5 sm:px-2.5 py-1 rounded whitespace-nowrap ${mode === 'fastapi' ? 'active bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-200'}`}
              >
                FastAPI
              </button>
            </div>

            <div className="hidden xs:flex sm:flex items-center gap-1.5 text-xs font-mono text-emerald-400 animate-fade-in delay-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-dot" />
              <span className="hidden sm:inline">Online</span>
            </div>

            <span className="hidden xs:inline sm:block text-[10px] sm:text-xs font-mono text-gray-500 border border-gray-800 px-1.5 sm:px-2 py-0.5 rounded animate-fade-in delay-400">v1</span>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-400 hover:text-white transition-colors p-1">
              <svg className="w-5 h-5 transition-transform duration-200" style={{ transform: mobileOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-gray-800 py-2 space-y-0.5">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className={`w-full text-left px-3 py-2.5 text-sm font-mono rounded transition-colors duration-150 ${currentPage === link.page ? 'text-emerald-400 bg-emerald-950/30' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}




// import { useState, useEffect } from 'react'
// import { useFramework } from '../../context/FrameworkContext'

// export default function Header({ currentPage, onNavigate }) {
//   const { mode, toggleMode } = useFramework()
//   const [mobileOpen, setMobileOpen] = useState(false)
//   const [scrolled, setScrolled] = useState(false)

//   useEffect(() => {
//     const handler = () => setScrolled(window.scrollY > 8)
//     window.addEventListener('scroll', handler, { passive: true })
//     return () => window.removeEventListener('scroll', handler)
//   }, [])

//   const navLinks = [
//     { label: 'Backend Lab', page: 'home' },
//     { label: 'API Playground', page: 'playground' },
//     { label: 'Architecture', page: 'architecture' },
//     { label: 'Projects', page: 'projects' },
//     { label: 'About', page: 'about' },
//   ]

//   function handleNav(page) {
//     onNavigate(page)
//     setMobileOpen(false)
//     window.scrollTo({ top: 0, behavior: 'smooth' })
//   }

//   return (
//     <header className={`sticky top-0 z-50 animate-header-down transition-all duration-300 ${scrolled ? 'bg-gray-950/95 backdrop-blur-md border-b border-gray-800 shadow-lg shadow-black/40' : 'bg-gray-950 border-b border-gray-800/60'}`}>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-14">

//           <button onClick={() => handleNav('home')} className="flex items-center gap-2 shrink-0 group">
//             <div className="w-2 h-2 rounded-full bg-emerald-400 glow-dot group-hover:scale-125 transition-transform duration-200" />
//             <span className="text-sm font-mono font-semibold text-white tracking-tight group-hover:text-emerald-50 transition-colors duration-200">
//               Uzair<span className="text-emerald-400">Backend</span>Lab
//             </span>
//           </button>

//           <nav className="hidden md:flex items-center gap-1">
//             {navLinks.map((link, i) => (
//               <button
//                 key={link.page}
//                 onClick={() => handleNav(link.page)}
//                 style={{ animationDelay: `${i * 60 + 100}ms` }}
//                 className={`nav-link animate-fade-in text-xs font-mono px-3 py-1.5 rounded transition-colors duration-200 ${currentPage === link.page ? 'text-emerald-400 active' : 'text-gray-400 hover:text-white'}`}
//               >
//                 {link.label}
//               </button>
//             ))}
//           </nav>

//           <div className="flex items-center gap-2 sm:gap-3">
//             <div className="flex items-center gap-0.5 bg-gray-900 border border-gray-700 rounded-md p-0.5 animate-fade-in delay-300">
//               <button
//                 onClick={() => toggleMode('django')}
//                 className={`framework-btn text-xs font-mono px-2.5 py-1 rounded ${mode === 'django' ? 'active bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-500 hover:text-gray-200'}`}
//               >
//                 Django
//               </button>
//               <button
//                 onClick={() => toggleMode('fastapi')}
//                 className={`framework-btn text-xs font-mono px-2.5 py-1 rounded ${mode === 'fastapi' ? 'active bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-200'}`}
//               >
//                 FastAPI
//               </button>
//             </div>

//             <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-emerald-400 animate-fade-in delay-400">
//               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 glow-dot" />
//               <span>Online</span>
//             </div>

//             <span className="hidden sm:block text-xs font-mono text-gray-500 border border-gray-800 px-2 py-0.5 rounded animate-fade-in delay-400">v1</span>

//             <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-400 hover:text-white transition-colors p-1">
//               <svg className="w-5 h-5 transition-transform duration-200" style={{ transform: mobileOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 {mobileOpen
//                   ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 }
//               </svg>
//             </button>
//           </div>
//         </div>

//         <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
//           <div className="border-t border-gray-800 py-2 space-y-0.5">
//             {navLinks.map((link) => (
//               <button
//                 key={link.page}
//                 onClick={() => handleNav(link.page)}
//                 className={`w-full text-left px-3 py-2.5 text-sm font-mono rounded transition-colors duration-150 ${currentPage === link.page ? 'text-emerald-400 bg-emerald-950/30' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
//               >
//                 {link.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </header>
//   )
// }