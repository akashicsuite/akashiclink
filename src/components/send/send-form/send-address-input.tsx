import { L2Regex, NetworkDictionary } from '@akashic/as-backend';
import styled from '@emotion/styled';
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
import { closeOutline } from 'ionicons/icons';
import debounce from 'lodash.debounce';
import { useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ADDRESS_BOOK_ENABLED } from '../../../constants/feature-flags';
import { OwnersAPI } from '../../../utils/api';
import { getErrorMessageTKey } from '../../../utils/error-utils';
import { useAddressBook } from '../../../utils/hooks/useAddressBook';
import { useAccountStorage } from '../../../utils/hooks/useLocalAccounts';
import { useOwnerKeys } from '../../../utils/hooks/useOwnerKeys';
import {
  AlertBox,
  errorAlertShell,
  formAlertResetState,
} from '../../common/alert/alert';
import { StyledInput } from '../../common/input/styled-input';
import { SendAddressTabs } from '../send-address-select/send-address-tabs';
import { SendFormContext } from '../send-modal-context-provider';
import type { ValidatedAddressPair } from './types';

const LockedAddress = styled(IonItem)({
  ['&::part(native)']: {
    color: 'var(--ion-color-primary)',
    borderColor: 'var(--ion-color-primary)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 40,
    fontSize: '0.75rem',
    '--inner-padding-end': '2px', // Reduce end padding
    '--padding-start': '8px', // Optional: adjust start padding
    '--padding-end': '2px', // Reduce end padding
  },
});

/**
 * Calculate dynamic font size based on address length
 * L2 addresses (~66 chars) will get smaller font
 * L1 addresses (~34-42 chars) will get larger font
 */
const calculateSendAddressFontSize = (address: string): string => {
  const length = address.length;

  // Define size breakpoints
  if (length >= 60) {
    // L2 addresses (very long)
    return '0.48rem';
  } else if (length >= 42) {
    // Ethereum-style L1 addresses
    return '0.78rem';
  } else if (length >= 34) {
    // TRON-style L1 addresses
    return '0.8rem';
  } else {
    // Shorter addresses or aliases
    return '0.75rem';
  }
};

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
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLIonInputElement>(null);
  const { activeAccount } = useAccountStorage();
  const {
    currency: { coinSymbol },
  } = useContext(SendFormContext);
  const addresses = useOwnerKeys(activeAccount?.identity ?? '').keys;
  const { findContactByAddress } = useAddressBook();

  const validateAddressInput = async (input: string) => {
    setAlert(formAlertResetState);

    const userInput = input.trim();

    if (!userInput) return;

    // Not allow sending to self address
    if (
      userInput === activeAccount?.identity ||
      addresses.find((a) => a.address === userInput) ||
      userInput === activeAccount?.alias
    ) {
      setAlert(errorAlertShell('NoSelfSend'));
      return;
    }

    try {
      const { l2Address, alias, isBp, ledgerId } =
        await OwnersAPI.lookForL2Address({
          to: userInput,
          coinSymbol,
        });

      // Not allow sending BP by alias
      if (userInput === alias && isBp) {
        setAlert(errorAlertShell('SendBpByAlias'));
        return;
      }

      if (RegExp(NetworkDictionary[coinSymbol].regex.address).exec(userInput)) {
        // Sending by L1 address
        onAddressValidated({
          alias,
          convertedToAddress: l2Address ?? userInput,
          userInputToAddress: userInput,
          userInputToAddressType: 'l1',
          ...(l2Address && {
            initiatedToNonL2: userInput,
            isL2: true,
          }),
          initiatedToL1LedgerId: ledgerId,
        });
        return;
      } else if (RegExp(L2Regex).exec(userInput)) {
        // Sending L2 by L2 address
        if (!l2Address) {
          setAlert(errorAlertShell('invalidL2Address'));
        } else {
          onAddressValidated({
            alias,
            convertedToAddress: l2Address,
            userInputToAddress: userInput,
            userInputToAddressType: 'l2',
            isL2: true,
          });
        }
        return;
      } else if (!l2Address) {
        // Sending by alias
        setAlert(errorAlertShell('AddressHelpText'));
        return;
      } else {
        onAddressValidated({
          alias,
          convertedToAddress: l2Address,
          userInputToAddress: userInput,
          userInputToAddressType: 'alias',
          isL2: true,
          initiatedToNonL2: userInput,
        });
      }
    } catch (error) {
      setAlert(errorAlertShell(getErrorMessageTKey(error)));
    }
  };

  const validateAddress = debounce(validateAddressInput, 500);

  const onAddressChange = (e: InputCustomEvent) => {
    if (typeof e.target?.value === 'string') {
      setInputValue(e.target.value);
      validateAddress(e.target.value);
    }
  };

  const onAddressClear = () => {
    setInputValue('');
    onAddressReset();
  };

  const handleSelectAddress = (address: string) => {
    setInputValue(address);
    validateAddressInput(address);
  };

  return (
    <IonRow className={'ion-center ion-grid-row-gap-xxs'}>
      <IonCol className={'ion-text-align-center'} size={'12'}>
        <IonText>
          <h2 className="ion-margin-bottom-0 ion-margin-top-md">
            {t('SendTo')}
          </h2>
        </IonText>
      </IonCol>
      <IonCol size={'12'}>
        {validatedAddressPair.userInputToAddress === '' && (
          <StyledInput
            ref={inputRef}
            placeholder={t('EnterAddress')}
            type={'text'}
            value={inputValue}
            onIonInput={onAddressChange}
          />
        )}
        {validatedAddressPair.userInputToAddress !== '' &&
          (() => {
            const contact = ADDRESS_BOOK_ENABLED
              ? findContactByAddress(
                  validatedAddressPair.userInputToAddress,
                  coinSymbol
                )
              : undefined;
            const address = validatedAddressPair.userInputToAddress;

            return (
              <LockedAddress lines="full">
                <IonLabel
                  className="ion-text-bold"
                  style={{ wordBreak: 'break-all' }}
                >
                  {contact && <div>{contact.name}</div>}
                  <div
                    style={{
                      fontSize: calculateSendAddressFontSize(address),
                      ...(contact && { fontWeight: 400 }),
                    }}
                  >
                    {address}
                  </div>
                </IonLabel>
                <IonButton
                  onClick={onAddressClear}
                  fill="clear"
                  slot="end"
                  style={{
                    marginLeft: 0,
                    marginRight: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                  }}
                >
                  <IonIcon
                    slot="icon-only"
                    icon={closeOutline}
                    style={{ width: '16px', height: '16px' }}
                  ></IonIcon>
                </IonButton>
              </LockedAddress>
            );
          })()}
      </IonCol>
      {alert.visible && (
        <IonCol size={'12'}>
          <AlertBox state={alert} />
        </IonCol>
      )}
      {validatedAddressPair.userInputToAddress === '' && (
        <IonCol size={'12'}>
          <SendAddressTabs onSelectAddress={handleSelectAddress} />
        </IonCol>
      )}
    </IonRow>
  );
};
