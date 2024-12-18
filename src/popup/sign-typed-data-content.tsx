import { IonCol, IonRow, IonSpinner } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import { BorderedBox } from '../components/common/box/border-box';
import { OutlineButton, PrimaryButton } from '../components/common/buttons';
import { List } from '../components/common/list/list';
import { ListVerticalLabelValueItem } from '../components/common/list/list-vertical-label-value-item';
import { PopupLayout } from '../components/page-layout/popup-layout';

export function SignTypedDataContent({
  isWaitingRequestContent,
  requestContent,
  isProcessingRequest,
  onClickSign,
  onClickReject,
}: {
  isWaitingRequestContent: boolean;
  requestContent: {
    id: number;
    method: string;
    topic: string;
    primaryType: string;
    message: Record<string, string>;
    toSign: { identity: string; expires: string } & Record<
      string,
      string | Record<string, string>
    >;
    secondaryOtk: { oldPubKeyToRemove?: string };
    response: Record<string, unknown>;
  };
  isProcessingRequest: boolean;
  onClickSign: () => Promise<void>;
  onClickReject: () => Promise<void>;
}) {
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(window.location.search);

  return (
    <PopupLayout>
      <IonRow>
        <IonCol size={'8'} offset={'2'}>
          <BorderedBox lines="full" compact>
            <h4 className="w-100 ion-justify-content-center ion-margin-0">
              {searchParams.get('appUrl') ?? '-'}
            </h4>
          </BorderedBox>
        </IonCol>
        <IonCol size={'12'}>
          <h2 className="ion-justify-content-center ion-margin-top-lg ion-margin-bottom-xs">
            {t('SignatureRequest')}
          </h2>
          <p className="ion-justify-content-center ion-margin-bottom-sm ion-text-align-center">
            {t('OnlySignThisMessageIfYouFullyUnderstand')}
          </p>
        </IonCol>
        <IonCol
          size={'12'}
          className={'ion-justify-content-center ion-align-items-center'}
        >
          {isWaitingRequestContent && (
            <IonSpinner
              className={'w-100 ion-margin-top-xl'}
              color="secondary"
              name="circular"
            />
          )}
          <List lines={'none'}>
            {/* // TODO: prepare array of display to do render */}
            {Object.entries(
              requestContent?.message?.toDisplay ??
                requestContent?.message ??
                {}
            ).map(([key, value]) => {
              if (Array.isArray(value)) {
                return value.map((v) =>
                  Object.entries(v).map(([key, value]) => {
                    if (value) {
                      return (
                        <ListVerticalLabelValueItem
                          key={key}
                          label={t(`Popup.${key}`)}
                          value={(value as string) ?? '-'}
                        />
                      );
                    }
                  })
                );
              } else if (typeof value === 'object') {
                return Object.entries(value).map(([key, value]) => {
                  if (value) {
                    return (
                      <ListVerticalLabelValueItem
                        key={key}
                        label={t(`Popup.${key}`)}
                        value={(value as string) ?? '-'}
                      />
                    );
                  }
                });
              } else if (value !== '') {
                return (
                  <ListVerticalLabelValueItem
                    key={key}
                    label={t(`Popup.${key}`)}
                    value={value ?? '-'}
                  />
                );
              }
            })}
          </List>
        </IonCol>
      </IonRow>
      <IonRow className={'ion-margin-top-auto'}>
        <IonCol size={'6'}>
          <OutlineButton
            expand="block"
            disabled={isWaitingRequestContent || isProcessingRequest}
            onClick={onClickReject}
          >
            {t('Deny')}
          </OutlineButton>
        </IonCol>
        <IonCol size={'6'}>
          <PrimaryButton
            expand="block"
            isLoading={isWaitingRequestContent || isProcessingRequest}
            onClick={onClickSign}
          >
            {t('Confirm')}
          </PrimaryButton>
        </IonCol>
      </IonRow>
    </PopupLayout>
  );
}
