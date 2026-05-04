import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { translate, LANG_KEYS } from '../utils/i18n';

const STORAGE = 'smartkhata_lang';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const s = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE);
    return LANG_KEYS.includes(s) ? s : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = lang === 'gu' ? 'gu' : 'en';
    localStorage.setItem(STORAGE, lang);
  }, [lang]);

  const setLang = (next) => {
    if (LANG_KEYS.includes(next)) setLangState(next);
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key) => translate(lang, key),
    }),
    [lang]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
