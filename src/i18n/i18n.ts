import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE, Language } from './supported-languages';
import translationBD from './translation/bn_BD.json';
import translationEN from './translation/en_US.json';
import translationES from './translation/es_ES.json';
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
  [Language.bnBD]: {
    translation: translationBD,
  },
  [Language.esES]: {
    translation: translationES,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  keySeparator: '.',
});

export default i18n;
