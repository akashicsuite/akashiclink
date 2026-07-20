/* eslint-disable sonarjs/no-duplicate-string */
import { useSetGlobalLanguage } from '../utils/hooks/useSetGlobalLanguage';
import { Language } from './supported-languages';

const INFO_SITE_LINKS = {
  [Language.enUS]: 'https://www.akashiclink.com/en-US',
  [Language.zhCN]: 'https://www.akashiclink.com/zh-TW',
  [Language.zhTW]: 'https://www.akashiclink.com/zh-TW',
  [Language.bnBD]: 'https://www.akashiclink.com/bd-BD',
  [Language.esES]: 'https://www.akashiclink.com/es-ES',
};

const TERMS_OF_USE_LINKS = {
  [Language.enUS]:
    'https://docs.akashiclink.com/terms-of-use-and-privacy-policy',
  [Language.zhCN]:
    'https://docs.akashiclink.com/zh-HK/terms-of-use-and-privacy-policy',
  [Language.zhTW]:
    'https://docs.akashiclink.com/zh-HK/terms-of-use-and-privacy-policy',
  [Language.bnBD]:
    'https://docs.akashiclink.com/terms-of-use-and-privacy-policy',
  [Language.esES]:
    'https://docs.akashiclink.com/terms-of-use-and-privacy-policy',
};

const PRIVACY_POLICY_LINKS = {
  [Language.enUS]:
    'https://docs.akashiclink.com/terms-of-use-and-privacy-policy',
  [Language.zhCN]:
    'https://docs.akashiclink.com/zh-HK/terms-of-use-and-privacy-policy',
  [Language.zhTW]:
    'https://docs.akashiclink.com/zh-HK/terms-of-use-and-privacy-policy',
  [Language.bnBD]:
    'https://docs.akashiclink.com/terms-of-use-and-privacy-policy',
  [Language.esES]:
    'https://docs.akashiclink.com/terms-of-use-and-privacy-policy',
};

const QUICK_GUIDE_LINKS = {
  [Language.enUS]:
    'https://docs.akashiclink.com/guides/quick-guide#import-account',
  [Language.zhCN]: 'https://docs.akashiclink.com/zh-HK/guides/quick-guide',
  [Language.zhTW]: 'https://docs.akashiclink.com/zh-HK/guides/quick-guide',
  [Language.bnBD]:
    'https://docs.akashiclink.com/guides/quick-guide#import-account',
  [Language.esES]:
    'https://docs.akashiclink.com/guides/quick-guide#import-account',
};

export const LINK_TYPE = {
  PrivacyPolicy: 'PrivacyPolicy',
  TermsOfUse: 'TermsOfUse',
  InfoSite: 'InfoSite',
  QuickGuide: 'QuickGuide',
};

export const useI18nInfoUrls = (): Record<
  (typeof LINK_TYPE)[keyof typeof LINK_TYPE],
  string
> => {
  const [globalLanguage] = useSetGlobalLanguage();

  return {
    [LINK_TYPE.PrivacyPolicy]: PRIVACY_POLICY_LINKS[globalLanguage],
    [LINK_TYPE.TermsOfUse]: TERMS_OF_USE_LINKS[globalLanguage],
    [LINK_TYPE.InfoSite]: INFO_SITE_LINKS[globalLanguage],
    [LINK_TYPE.QuickGuide]: QUICK_GUIDE_LINKS[globalLanguage],
  };
};
