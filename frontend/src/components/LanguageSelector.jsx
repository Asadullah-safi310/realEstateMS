import React from 'react';
import useTranslation from '../hooks/useTranslation';

const LanguageSelector = () => {
  const { t, language, setLanguage, languages } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <label className="text-gray-700 font-semibold text-sm">{t('language.selectLanguage')}:</label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded bg-white cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
