import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonModal,
  IonRow,
  IonText,
  isPlatform,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { AccountList } from '../../components/manage-account/account-list';

export function ManageAccountsModal({
  modal,
  isOpen,
  setIsOpen,
}: {
  modal: RefObject<HTMLIonModalElement>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  const isMobile = isPlatform('ios') || isPlatform('android');

  return (
    <IonModal
      handle={false}
      ref={modal}
      initialBreakpoint={0.92}
      breakpoints={[0, 0.92]}
      isOpen={isOpen}
      onIonModalDidDismiss={() => {
        setIsOpen(false);
      }}
      style={{
        '--border-radius': '24px',
      }}
    >
      <IonContent>
        {isMobile && (
          <div
            style={{
              width: '48px',
              height: '2px',
              borderRadius: '4px',
              margin: '12px auto',
            }}
          />
        )}
        <IonGrid>
          <IonRow className={'ion-grid-row-gap-sm ion-grid-column-gap-xxs'}>
            {!isMobile && (
              <IonButton
                onClick={() => setIsOpen(false)}
                className="close-button"
                fill="clear"
                style={{
                  color: 'var(--ion-color-grey)',
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  zIndex: 1000,
                }}
              >
                <IonIcon icon={closeOutline} className={'ion-text-size-xxl'} />
              </IonButton>
            )}
            <IonCol>
              <h2 className={'ion-margin-bottom-xxs'}>{t('ManageAccounts')}</h2>
              <IonText
                className={'ion-text-align-center ion-text-size-xl'}
                color={'dark'}
              >
                <p className={'ion-text-align-center ion-text-size-xs'}>
                  {t('RemoveDevice')}
                </p>
              </IonText>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <AccountList
                height={`calc(92vh - ${
                  isMobile ? '320px - var(--ion-safe-area-bottom)' : '240px'
                })`}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonModal>
  );
}
