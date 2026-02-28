import { createContext, useContext, useState } from 'react'

const FrameworkContext = createContext()

export function FrameworkProvider({ children }) {
  const [mode, setMode] = useState('django')

  const toggleMode = () => {
    setMode(prev => prev === 'django' ? 'fastapi' : 'django')
  }

  return (
    <FrameworkContext.Provider value={{ mode, toggleMode }}>
      {children}
    </FrameworkContext.Provider>
  )
}

export function useFramework() {
  return useContext(FrameworkContext)
}