import enTranslations from './translations/en.json';
import dariTranslations from './translations/dari.json';
import pashtoTranslations from './translations/pashto.json';

const translations = {
  en: enTranslations,
  dari: dariTranslations,
  pashto: pashtoTranslations,
};

const defaultLanguage = localStorage.getItem('language') || 'en';

class I18n {
  constructor() {
    this.language = defaultLanguage;
    this.translations = translations;
  }

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.language = lang;
      localStorage.setItem('language', lang);
      window.dispatchEvent(new Event('languageChanged'));
    }
  }

  getLanguage() {
    return this.language;
  }

  t(key) {
    const keys = key.split('.');
    let value = this.translations[this.language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return value || key;
  }

  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'dari', name: 'دری' },
      { code: 'pashto', name: 'پښتو' },
    ];
  }
}

export default new I18n();
