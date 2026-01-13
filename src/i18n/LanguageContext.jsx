import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { defaultLanguage, getText } from '../data/texts'

const LANGUAGE_STORAGE_KEY = 'app_language'

const LanguageContext = createContext(null)

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(defaultLanguage || 'fr')

  // Load language from localStorage ONCE
  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (storedLanguage === 'en' || storedLanguage === 'fr') {
      setLanguageState(storedLanguage)
    }
  }, [])

  const setLanguage = lang => {
    if (lang !== 'en' && lang !== 'fr') return
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    setLanguageState(lang)
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: path => getText(path, language)
    }),
    [language]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return context
}
