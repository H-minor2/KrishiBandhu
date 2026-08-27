'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../constants/languages';

type LanguageContextType = {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Try to load from localStorage if available, otherwise default to 'en'
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('krishi_bandhu_lang');
    if (saved) setLangState(saved);
  }, []);

  const setLang = (newLang: string) => {
    setLangState(newLang);
    localStorage.setItem('krishi_bandhu_lang', newLang);
    document.cookie = `krishi_bandhu_lang=${newLang}; path=/; max-age=31536000`;
  };

  const t = (key: string) => getTranslation(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
