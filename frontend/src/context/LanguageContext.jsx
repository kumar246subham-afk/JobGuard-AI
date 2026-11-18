import React, { createContext, useContext, useState } from 'react';
import { en } from '../translations/en';
import { hi } from '../translations/hi';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('jobguard_lang') || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('jobguard_lang', nextLang);
  };

  const t = language === 'hi' ? hi : en;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
