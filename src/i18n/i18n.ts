import {
  DEFAULT_LANGUAGE,
  Language,
} from '@helium-pay/common-i18n/src/locales/supported-languages';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './translation/en_US.json';
import translationCN from './translation/zh_CN.json';
import translationTW from './translation/zh_TW.json';

type Translation = typeof translationEN;

const resources: { [key in Language]: { translation: Translation } } = {
  [Language.enUS]: {
    translation: translationEN,
  },
  [Language.zhTW]: {
    translation: translationTW,
  },
  [Language.zhCN]: {
    translation: translationCN,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  keySeparator: '.',
});

export default i18n;
