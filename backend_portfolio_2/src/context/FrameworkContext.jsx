import { createContext, useContext, useState } from 'react'

const FrameworkContext = createContext()

export function FrameworkProvider({ children }) {
  const [mode, setMode] = useState('django')

  const toggleMode = (newMode) => {
    setMode(newMode)
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