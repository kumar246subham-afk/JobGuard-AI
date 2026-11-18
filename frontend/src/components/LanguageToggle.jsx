import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react';

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-sm"
      title="Switch interface language (English / हिंदी)"
    >
      <Languages className="w-3.5 h-3.5 text-amber-500" />
      <span>{language === 'en' ? 'EN | हिंदी' : 'हिंदी | EN'}</span>
    </button>
  );
};
