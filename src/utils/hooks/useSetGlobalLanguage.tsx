import { LANGUAGE_LIST } from '@helium-pay/common-i18n/src/locales/supported-languages';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalStorage } from './useLocalStorage';

const getLocalisationLanguage = (): string => {
  const browserLanguage = window.navigator.language;
  for (const lang of LANGUAGE_LIST)
    if (lang.locale === browserLanguage) return lang.locale;

  return LANGUAGE_LIST[0].locale;
};

export const useSetGlobalLanguage = (): [
  string,
  (newValue: string) => Promise<void>
] => {
  const { i18n } = useTranslation();
  const localLanguage = getLocalisationLanguage();
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage(
    'language',
    localLanguage
  );

  useEffect(() => {
    if (selectedLanguage !== '' && selectedLanguage !== i18n.language) {
      i18n.changeLanguage(selectedLanguage);
    }
  }, [selectedLanguage, i18n]);

  return [selectedLanguage, setSelectedLanguage];
};
