import { Language } from '@helium-pay/common-i18n/src/locales/supported-languages';

import { useSetGlobalLanguage } from '../utils/hooks/useSetGlobalLanguage';

const INFO_SITE_LINKS = {
  [Language.enUS]: 'https://www.akashiclink.com/en',
  [Language.zhCN]: 'https://www.akashiclink.com/zh-TW',
  [Language.zhTW]: 'https://www.akashiclink.com/zh-TW',
};

const TERMS_OF_USE_LINKS = {
  [Language.enUS]:
    'https://docs.akashiclink.com/terms-of-use-and-privacy-policy',
  [Language.zhCN]:
    'https://docs.akashiclink.com/traditionalchinese/shi-yong-tiao-kuan-yu-yin-si-quan-zheng-ce',
  [Language.zhTW]:
    'https://docs.akashiclink.com/traditionalchinese/shi-yong-tiao-kuan-yu-yin-si-quan-zheng-ce',
};

const PRIVACY_POLICY_LINKS = {
  [Language.enUS]:
    'https://docs.akashiclink.com/terms-of-use-and-privacy-policy',
  [Language.zhCN]:
    'https://docs.akashiclink.com/traditionalchinese/shi-yong-tiao-kuan-yu-yin-si-quan-zheng-ce',
  [Language.zhTW]:
    'https://docs.akashiclink.com/traditionalchinese/shi-yong-tiao-kuan-yu-yin-si-quan-zheng-ce',
};

const QUICK_GUIDE_LINKS = {
  [Language.enUS]: 'https://docs.akashiclink.com/',
  [Language.zhCN]: 'https://docs.akashiclink.com/traditionalchinese',
  [Language.zhTW]: 'https://docs.akashiclink.com/traditionalchinese',
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
