/** Declaration of supported locales */
export enum Language {
  enUS = 'en-US',
  zhCN = 'zh-CN',
  zhTW = 'zh-TW',
  bnBD = 'bn-BD',
  esES = 'es-ES',
}

/**  Metadata for locale */
export type LanguageObject = {
  title: string;
  shortTitle: string;
  locale: Language;
};

export const LANGUAGE_LIST: LanguageObject[] = [
  {
    title: 'English',
    shortTitle: 'EN',
    locale: Language.enUS,
  },
  {
    title: '繁體中文',
    shortTitle: 'TW',
    locale: Language.zhTW,
  },
  {
    title: '简体中文',
    shortTitle: 'CN',
    locale: Language.zhCN,
  },
  {
    title: 'বাংলা',
    shortTitle: 'BD',
    locale: Language.bnBD,
  },
  {
    title: 'Español',
    shortTitle: 'ES',
    locale: Language.esES,
  },
];

export const DEFAULT_LANGUAGE = Language.enUS;
