import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { defaultTheme, isThemeId, type ThemeId } from './themes'

type ThemeContextValue = {
  themeId: ThemeId
  setThemeId: (themeId: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const storageKey = 'songlist-studio-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const storedTheme = localStorage.getItem(storageKey)
    return storedTheme && isThemeId(storedTheme) ? storedTheme : defaultTheme
  })

  useEffect(() => {
    document.documentElement.dataset.theme = themeId
    localStorage.setItem(storageKey, themeId)
  }, [themeId])

  const value = useMemo(() => ({ themeId, setThemeId }), [themeId])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)

  if (!value) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return value
}
