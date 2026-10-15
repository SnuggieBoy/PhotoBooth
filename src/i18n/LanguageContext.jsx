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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-pink-100 hover:border-pink-300 text-xs font-bold text-[#29252C] transition shadow-xs backdrop-blur-sm active:scale-95 cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-sm">{currentLangObj.flag}</span>
        <span className="hidden sm:inline font-bold">{currentLangObj.short}</span>
        <ChevronDown size={13} className={`text-pink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-white border border-pink-100 shadow-xl shadow-pink-500/10 py-1.5 z-50 backdrop-blur-md animate-fade-in">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                  language === lang.code
                    ? 'bg-pink-50 text-[#FF3D96] font-bold'
                    : 'text-[#29252C] hover:bg-pink-50/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {language === lang.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF3D96]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
