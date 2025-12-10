import { useState, useEffect } from 'react';
import i18n from '../i18n/i18n';

const useTranslation = () => {
  const [, setLanguage] = useState(i18n.getLanguage());

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(i18n.getLanguage());
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  return {
    t: (key) => i18n.t(key),
    language: i18n.getLanguage(),
    setLanguage: (lang) => i18n.setLanguage(lang),
    languages: i18n.getAvailableLanguages(),
  };
};

export default useTranslation;
