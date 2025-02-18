import styled from '@emotion/styled';
import { NetworkDictionary } from '@helium-pay/backend';
import type { InputCustomEvent } from '@ionic/react';
import {
  IonButton,
  IonCol,
  IonIcon,
  IonItem,
  IonLabel,
  IonRow,
  IonText,
} from '@ionic/react';
import axios from 'axios';
import { closeOutline } from 'ionicons/icons';
import { debounce } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ALLOWED_NETWORK_FOR_ADDRESS_SCREENING } from '../../constants/currencies';
import { unpackRequestErrorMessage } from '../../utils/unpack-request-error-message';
import {
  AlertBox,
  errorAlertShell,
  formAlertResetState,
} from '../common/alert/alert';
import { StyledInput } from '../common/input/styled-input';
import type { ValidatedScanAddress } from './types';

const LockedAddress = styled(IonItem)({
  ['&::part(native)']: {
    color: 'var(--ion-color-primary)',
    borderColor: 'var(--ion-color-primary)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
    fontSize: '0.75rem',
    '--inner-padding-end': '8px',
  },
});

export const AddressScreeningAddressInput = ({
  validatedScanAddress,
  onAddressValidated,
  onAddressReset,
}: {
  validatedScanAddress: ValidatedScanAddress;
  onAddressValidated: (addresses: ValidatedScanAddress) => void;
  onAddressReset: () => void;
}) => {
  const { t } = useTranslation();

  const [alert, setAlert] = useState(formAlertResetState);

  const validateAddress = debounce(async (input: string) => {
    setAlert(formAlertResetState);

    const userInput = input.trim();

    if (!userInput) return;

    const scanAddressChain = ALLOWED_NETWORK_FOR_ADDRESS_SCREENING.find(
      (symbol) =>
        RegExp(NetworkDictionary[symbol].regex.address).exec(userInput)
    );

    try {
      if (!!scanAddressChain) {
        onAddressValidated({
          scanAddress: userInput,
          scanChain: scanAddressChain,
        });
        return;
      }

      setAlert(errorAlertShell('AddressHelpText'));
    } catch (error) {
      setAlert(
        errorAlertShell(
          axios.isAxiosError(error)
            ? unpackRequestErrorMessage(error)
            : 'GenericFailureMsg'
        )
      );
    }
  }, 500);

  const onAddressChange = (e: InputCustomEvent) => {
    if (typeof e.target?.value === 'string') {
      validateAddress(e.target.value);
    }
  };

  const onAddressClear = () => {
    onAddressReset();
  };

  return (
    <IonRow className={'ion-center ion-grid-row-gap-xxs'}>
      <IonCol className={'ion-text-align-center'} size={'12'}>
        <IonText>
          <p className="ion-text-align-center ion-margin-horizontal">
            {t('AddressScanDesc')}
          </p>
        </IonText>
      </IonCol>
      <IonCol size={'12'}>
        {validatedScanAddress.scanAddress === '' && (
          <>
            <div className="ion-text-center">
              <IonLabel className="ion-text-bold ion-text-center ion-text-size-xxs">
                {t('AddressScanHint')}
              </IonLabel>
            </div>
            <StyledInput
              placeholder={t('EnterAnAddress')}
              type={'text'}
              onIonInput={onAddressChange}
            />
          </>
        )}
        {validatedScanAddress.scanAddress !== '' && (
          <LockedAddress lines="full">
            <IonLabel className="ion-text-bold">
              {validatedScanAddress.scanAddress}
            </IonLabel>
            <IonButton onClick={onAddressClear} fill="clear" slot="end">
              <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
            </IonButton>
          </LockedAddress>
        )}
      </IonCol>
      {alert.visible && (
        <IonCol size={'12'}>
          <AlertBox state={alert} />
        </IonCol>
      )}
    </IonRow>
  );
};
