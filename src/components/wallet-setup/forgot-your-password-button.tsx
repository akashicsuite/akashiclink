import { IonButton, IonIcon, IonModal } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { urls } from '../../constants/urls';
import { akashicPayPath } from '../../routing/navigation-tabs';
import { OutlineButton, PrimaryButton, TextButton } from '../common/buttons';

type Step = 'forgotPassword' | 'lostKeypairOrSecretPhrase';

export function ForgotYourPasswordButton() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('forgotPassword');
  const modal = useRef<HTMLIonModalElement>(null);

  const openModal = () => {
    setStep('forgotPassword');
    setIsOpen(true);
  };

  const forgotYourPasswordColor = 'var(--ion-text-color-alt)';

  return (
    <>
      <TextButton
        onClick={openModal}
        fill="clear"
        className="ion-margin-top-0"
        style={{
          display: 'block',
          width: '100%',
          '--color': forgotYourPasswordColor,
          textDecoration: 'none',
        }}
      >
        {t('ForgotPassword')}
      </TextButton>

      <IonModal
        className="popup-modal"
        ref={modal}
        isOpen={isOpen}
        onIonModalDidDismiss={() => {
          setIsOpen(false);
        }}
        style={{
          '--border-radius': '16px',
        }}
      >
        <div
          className="popup-modal-wrapper"
          style={{ position: 'relative', maxWidth: '320px' }}
        >
          <IonButton
            onClick={() => setIsOpen(false)}
            fill="clear"
            style={{
              position: 'absolute',
              top: '1px',
              right: '1px',
            }}
          >
            <IonIcon
              icon={closeOutline}
              style={{ fontSize: '24px', color: 'var(--ion-color-outline)' }}
            />
          </IonButton>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <IonIcon
              className={'ion-text-size-xxxxl'}
              src="assets/images/alert.svg"
            />

            {step === 'forgotPassword' ? (
              <>
                <h3
                  className="ion-margin-top-sm ion-margin-bottom-sm"
                  style={{
                    color: forgotYourPasswordColor,
                  }}
                >
                  {t('ForgotPassword')}
                </h3>

                <h5
                  className="ion-margin-top-xs ion-margin-bottom-lg"
                  style={{
                    color: forgotYourPasswordColor,
                  }}
                >
                  {t('ForgotPasswordDescription')}
                </h5>

                <PrimaryButton
                  onClick={() => setIsOpen(false)}
                  routerLink={akashicPayPath(urls.importWalletSelectMethod)}
                  routerOptions={{ unmount: true }}
                  style={{ width: '100%', marginBottom: '12px' }}
                  expand="block"
                >
                  {t('ImportWallet')}
                </PrimaryButton>

                <OutlineButton
                  onClick={() => setStep('lostKeypairOrSecretPhrase')}
                  style={{ width: '100%' }}
                  expand="block"
                >
                  {t('LostKeyPairOrSecretPhrase')}
                </OutlineButton>
              </>
            ) : (
              <>
                <h3
                  className="ion-margin-top-sm ion-margin-bottom-sm"
                  style={{
                    color: forgotYourPasswordColor,
                  }}
                >
                  {t('ForgotPassword')}
                </h3>

                <h3
                  className="ion-margin-top-xs ion-margin-bottom-xs"
                  style={{
                    color: forgotYourPasswordColor,
                  }}
                >
                  {t('LostKeypairOrSecretPhraseDescription')}
                </h3>

                <h5
                  className="ion-margin-top-xs ion-margin-bottom-lg"
                  style={{ color: 'var(--ion-color-outline)', fontWeight: 500 }}
                >
                  {t('ResetWalletDescription')}
                </h5>

                <PrimaryButton
                  onClick={() => setIsOpen(false)}
                  routerLink={akashicPayPath(urls.createWalletPassword)}
                  routerOptions={{ unmount: true }}
                  style={{ width: '100%', marginBottom: '12px' }}
                  expand="block"
                >
                  {t('CreateWallet')}
                </PrimaryButton>

                <OutlineButton
                  onClick={() => setIsOpen(false)}
                  routerLink={akashicPayPath(urls.importWalletSelectMethod)}
                  routerOptions={{ unmount: true }}
                  style={{ width: '100%' }}
                  expand="block"
                >
                  {t('ImportWallet')}
                </OutlineButton>
              </>
            )}
          </div>
        </div>
      </IonModal>
    </>
  );
}
