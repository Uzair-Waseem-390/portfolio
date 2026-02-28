import { useState, useEffect } from 'react'

export default function LoadingScreen({ onDone }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Start exit after bar animation completes
    const exitTimer = setTimeout(() => {
      setExiting(true)
    }, 1700)

    // Notify parent after full exit
    const doneTimer = setTimeout(() => {
      onDone()
    }, 2250)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
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
        Initializing v1.0
      </div>
    </div>
  )
}