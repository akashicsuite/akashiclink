import ReactGA from 'react-ga4';

export const initGA = () => {
  const gaId = process.env.REACT_APP_GA_MEASUREMENT_ID;
  if (!gaId) return;
  if (
    process.env.REACT_APP_ENV === 'dev' &&
    !process.env.REACT_APP_DEBUG_TRACKING
  )
    return;
  ReactGA.initialize(gaId, {
    gaOptions: {
      user_properties: { environment: process.env.REACT_APP_ENV ?? 'unknown' },
    },
  });
};

export const acceptConsentGA = () => {
  ReactGA.gtag('consent', 'update', { analytics_storage: 'granted' });
};
export const denyConsentGA = () => {
  ReactGA.gtag('consent', 'update', { analytics_storage: 'denied' });
};
