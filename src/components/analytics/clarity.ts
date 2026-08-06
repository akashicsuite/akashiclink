import Clarity from '@microsoft/clarity';

export const initClarity = () => {
  const projectId = process.env.REACT_APP_CLARITY_PROJECT_ID;
  if (!projectId) return;
  if (
    process.env.REACT_APP_ENV === 'dev' &&
    !process.env.REACT_APP_DEBUG_TRACKING
  )
    return;
  Clarity.init(projectId);
  Clarity.setTag('env', process.env.REACT_APP_ENV ?? 'unknown');
};

export const acceptConsentClarity = () => {
  Clarity.consent(true);
};
export const denyConsentClarity = () => {
  Clarity.consent(false);
};
