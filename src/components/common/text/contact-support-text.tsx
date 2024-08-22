import { IonText } from '@ionic/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const ContactSupportText = () => {
  const { t } = useTranslation();

  return (
    <IonText
      className={'ion-text-size-xs ion-text-bold'}
      color={'dark'}
      style={{
        position: 'absolute',
        bottom: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
      }}
    >
      <p className={'ion-text-align-center ion-margin-top-xs'}>
        {t('NeedHelp')}{' '}
        <a
          href="support@akashiclink.com"
          target={'_blank'}
          style={{
            textDecoration: 'none',
          }}
          rel="noreferrer"
        >
          {t('AkashicLinkSupport')}
        </a>
      </p>
    </IonText>
  );
};
