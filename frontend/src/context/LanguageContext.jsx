import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../constants/translations';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem('leafiq_lang') || 'en'
  );

  const setLanguage = (lang) => {
    if (TRANSLATIONS[lang]) {
      setLanguageState(lang);
      localStorage.setItem('leafiq_lang', lang);
    }
  };

  const t = (key, params = {}) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let text = dict[key] || TRANSLATIONS.en[key] || key;

    // Interpolate dynamic parameters like {crop}, {confidence}, {date}
    if (typeof text === 'string' && params && typeof params === 'object') {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
      });
    }

    return text;
  };

  const translateCrop = (cropName) => {
    if (!cropName) return t('crop_Crop');
    const cleanKey = `crop_${cropName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[cleanKey] || TRANSLATIONS.en[cleanKey] || cropName;
  };

  const translateCondition = (conditionName) => {
    if (!conditionName) return t('cond_Healthy');
    const cleanKey = `cond_${conditionName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[cleanKey] || TRANSLATIONS.en[cleanKey] || conditionName;
  };

  const translateConcern = (concernLevel) => {
    if (!concernLevel) return t('concern_attention');
    const cleanKey = `concern_${concernLevel.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}`;
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[cleanKey] || TRANSLATIONS.en[cleanKey] || concernLevel;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateCrop,
        translateCondition,
        translateConcern,
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
