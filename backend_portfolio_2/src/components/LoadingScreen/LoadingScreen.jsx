import { useState, useEffect } from 'react'

export default function LoadingScreen({ onDone }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    let minTimePassed = false
    let imageLoaded = false
    
    // Fallback maximum timeout to prevent infinite loading
    const maxTimeout = setTimeout(() => {
      if (!exiting) triggerExit()
    }, 6000)

    const triggerExit = () => {
      setExiting(true)
      setTimeout(() => {
        onDone()
        clearTimeout(maxTimeout)
      }, 550) // wait for exit animation
    }

    // Check when minimum time is passed (to show animation)
    const minTimer = setTimeout(() => {
      minTimePassed = true
      if (imageLoaded) triggerExit()
    }, 1700)

    // Preload the main hero image
    const img = new Image()
    img.src = '/images/uzair.webp'
    img.onload = () => {
      imageLoaded = true
      if (minTimePassed) triggerExit()
    }
    img.onerror = () => {
      imageLoaded = true // proceed anyway if image fails
      if (minTimePassed) triggerExit()
    }

    return () => {
      clearTimeout(minTimer)
      clearTimeout(maxTimeout)
      img.onload = null
      img.onerror = null
    }
  }, [onDone])

  return (
    <div className={`loader-screen ${exiting ? 'exiting' : ''}`}>
      {/* Logo */}
      <div className="loader-logo flex flex-col items-center gap-1">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 glow-dot" />
          <span className="text-base font-mono font-bold text-white tracking-tight">
            Uzair<span className="text-emerald-400">Backend</span>Lab
          </span>
        </div>
        <span className="text-xs font-mono text-gray-600">Simulated Production Environment</span>
      </div>

      {/* Progress bar */}
      <div className="loader-bar-track">
        <div className="loader-bar-fill" />
      </div>

      {/* Loading dots */}
      <div className="flex items-center gap-1.5">
        <div className="loader-dot" />
        <div className="loader-dot" />
        <div className="loader-dot" />
      </div>

      {/* Status text */}
      <div className="absolute bottom-10 text-xs font-mono text-gray-700 tracking-widest uppercase">
        Initializing v2.0
      </div>
    </div>
  )
}