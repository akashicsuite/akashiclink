import 'vanilla-cookieconsent/dist/cookieconsent.css';
import './cookieconsent-custom.css';

import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as CookieConsent from 'vanilla-cookieconsent';

import bnBD from '../../i18n/translation/bn_BD.json';
import enUS from '../../i18n/translation/en_US.json';
import esES from '../../i18n/translation/es_ES.json';
import zhCN from '../../i18n/translation/zh_CN.json';
import zhTW from '../../i18n/translation/zh_TW.json';
import {
  acceptConsentClarity,
  denyConsentClarity,
  initClarity,
} from './clarity';
import {
  acceptConsentDatadog,
  denyConsentDatadog,
  initDatadog,
} from './datadog';
import { acceptConsentGA, denyConsentGA, initGA } from './ga';

const CONSENT_COOKIE_NAME = 'akashic-al-cc-cookie';

const translations = {
  'bn-BD': bnBD.cookieConsent,
  'en-US': enUS.cookieConsent,
  'es-ES': esES.cookieConsent,
  'zh-CN': zhCN.cookieConsent,
  'zh-TW': zhTW.cookieConsent,
};

export default function TrackingConsentManager() {
  const { i18n } = useTranslation();

  const initAnalytics = useCallback(() => {
    initGA();
    initClarity();
  }, []);

  const grantAnalytics = useCallback(() => {
    acceptConsentGA();
    acceptConsentDatadog();
    acceptConsentClarity();
  }, []);

  const denyAnalytics = useCallback(() => {
    denyConsentGA();
    denyConsentDatadog();
    denyConsentClarity();
  }, []);

  useEffect(() => {
    initDatadog().catch(console.error);

    CookieConsent.run({
      cookie: {
        name: CONSENT_COOKIE_NAME,
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          autoClear: {
            cookies: [
              { name: /^_ga/ },
              { name: '_gid' },
              { name: /^_cl/ },
              { name: 'CLID' },
              { name: 'MUID' },
            ],
          },
        },
      },
      language: {
        default: i18n.language,
        translations,
      },
      onModalShow: ({ modalName }) => {
        if (modalName !== 'consentModal') return;
        document.querySelector('#cc-main .cm__btn--close')?.addEventListener(
          'click',
          (e) => {
            e.stopImmediatePropagation();
            CookieConsent.hide();
          },
          { capture: true, once: true }
        );
      },
      onConsent: () => {
        if (CookieConsent.acceptedCategory('analytics')) {
          initAnalytics();
          grantAnalytics();
        }
      },
      onChange: ({ changedCategories }) => {
        if (!changedCategories.includes('analytics')) return;

        if (CookieConsent.acceptedCategory('analytics')) {
          initAnalytics();
          grantAnalytics();
        } else {
          denyAnalytics();
          window.location.reload();
        }
      },
    }).catch(console.error);

    return () => {
      CookieConsent.reset();
    };
  }, [i18n.language, initAnalytics, grantAnalytics, denyAnalytics]);

  return null;
}
