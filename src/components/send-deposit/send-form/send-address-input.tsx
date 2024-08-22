import styled from '@emotion/styled';
import { L2Regex, NetworkDictionary } from '@helium-pay/backend';
import type { InputChangeEventDetail, InputCustomEvent } from '@ionic/react';
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

import { useAppSelector } from '../../../redux/app/hooks';
import { selectFocusCurrencyDetail } from '../../../redux/slices/preferenceSlice';
import { OwnersAPI } from '../../../utils/api';
import { useAccountStorage } from '../../../utils/hooks/useLocalAccounts';
import { useOwnerKeys } from '../../../utils/hooks/useOwnerKeys';
import { unpackRequestErrorMessage } from '../../../utils/unpack-request-error-message';
import {
  AlertBox,
  errorAlertShell,
  formAlertResetState,
} from '../../common/alert/alert';
import { StyledInput } from '../../common/input/styled-input';
import type { ValidatedAddressPair } from './types';

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

export const SendAddressInput = ({
  validatedAddressPair,
  onAddressValidated,
  onAddressReset,
}: {
  validatedAddressPair: ValidatedAddressPair;
  onAddressValidated: (addresses: ValidatedAddressPair) => void;
  onAddressReset: () => void;
}) => {
  const { t } = useTranslation();

  const [alert, setAlert] = useState(formAlertResetState);
  const { activeAccount } = useAccountStorage();
  const { chain } = useAppSelector(selectFocusCurrencyDetail);
  const addresses = useOwnerKeys(activeAccount?.identity ?? '').keys;

  const walletAddress = addresses.find((k) => k.coinSymbol === chain)?.address;

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const validateAddress = debounce(async (input: string) => {
    setAlert(formAlertResetState);

    const userInput = input.trim();

    if (!userInput) return;

    // Not allow sending to self address
    if (
      userInput === activeAccount?.identity ||
      userInput === walletAddress ||
      userInput === activeAccount?.aasName
    ) {
      setAlert(errorAlertShell('NoSelfSend'));
      return;
    }

    try {
      const { l2Address, acnsAlias, isBp } = await OwnersAPI.lookForL2Address({
        to: userInput,
        coinSymbol: chain,
      });

      // Not allow sending BP by alias
      if (userInput === acnsAlias && isBp) {
        setAlert(errorAlertShell('SendBpByAlias'));
        return;
      }

      if (userInput.match(NetworkDictionary[chain].regex.address)) {
        // Sending by L1 address
        onAddressValidated({
          acnsAlias,
          convertedToAddress: l2Address ?? userInput,
          userInputToAddress: userInput,
          userInputToAddressType: 'l1',
          ...(l2Address && {
            initiatedToNonL2: userInput,
            isL2: true,
          }),
        });
        return;
      } else if (userInput.match(L2Regex)) {
        // Sending L2 by L2 address
        if (!l2Address) {
          setAlert(errorAlertShell('invalidL2Address'));
        } else {
          onAddressValidated({
            acnsAlias,
            convertedToAddress: l2Address,
            userInputToAddress: userInput,
            userInputToAddressType: 'l2',
            isL2: true,
          });
        }
        return;
      } else {
        // Sending by alias
        if (!l2Address) {
          setAlert(errorAlertShell('AddressHelpText'));
          return;
        } else {
          onAddressValidated({
            convertedToAddress: l2Address,
            userInputToAddress: userInput,
            userInputToAddressType: 'alias',
            isL2: true,
            initiatedToNonL2: userInput,
          });
        }
      }
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

  const onAddressChange = (e: InputCustomEvent<InputChangeEventDetail>) => {
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
          <h2 className="ion-margin-0">{t('SendTo')}</h2>
        </IonText>
      </IonCol>
      <IonCol size={'12'}>
        {validatedAddressPair.userInputToAddress === '' && (
          <StyledInput
            placeholder={t('EnterAddress')}
            type={'text'}
            onIonInput={onAddressChange}
          />
        )}
        {validatedAddressPair.userInputToAddress !== '' && (
          <LockedAddress lines="full">
            <IonLabel className="ion-text-bold">
              {validatedAddressPair.userInputToAddress}
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
