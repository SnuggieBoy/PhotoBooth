import { createContext, useContext, useState, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { translations, LANGUAGES } from './translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('photobooth_lang') || 'vi'
  })

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang)
      localStorage.setItem('photobooth_lang', lang)
    }
  }

  const t = (key) => {
    const dict = translations[language] || translations.vi
    return dict[key] || translations.en?.[key] || key
  }

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLangObj, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export function LanguageSelector() {
  const { language, setLanguage, currentLangObj, LANGUAGES } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block text-left z-50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-neutral-200 transition shadow-xs"
        aria-expanded={isOpen}
      >
        <span className="text-sm">{currentLangObj.flag}</span>
        <span className="hidden sm:inline">{currentLangObj.short}</span>
        <ChevronDown size={13} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl py-1.5 z-50 animate-fade-in backdrop-blur-md">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition ${
                  language === lang.code
                    ? 'bg-pink-500/15 text-pink-400 font-bold'
                    : 'text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {language === lang.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
