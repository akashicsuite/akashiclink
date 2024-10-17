import { IonGrid } from '@ionic/react';
import { useState } from 'react';

import { SendAddressInput } from './send-address-input';
import { SendAmountInputAndDetail } from './send-amount-input-and-detail';
import type { ValidatedAddressPair } from './types';
import { validatedAddressPairInitialState } from './types';

export const SendForm = () => {
  // [L1 / converted L2 address, user input address]
  const [validatedAddressPair, setValidatedAddressPair] =
    useState<ValidatedAddressPair>(validatedAddressPairInitialState);

  const onAddressValidated = (address: ValidatedAddressPair) => {
    setValidatedAddressPair(address);
  };

  const onAddressReset = () => {
    setValidatedAddressPair(validatedAddressPairInitialState);
  };

  return (
    <IonGrid
      className={
        'ion-padding-top-xxs ion-padding-bottom-xxs ion-padding-left-md ion-padding-right-md'
      }
    >
      <SendAddressInput
        validatedAddressPair={validatedAddressPair}
        onAddressValidated={onAddressValidated}
        onAddressReset={onAddressReset}
      />
      {validatedAddressPair.userInputToAddress !== '' && (
        <SendAmountInputAndDetail
          validatedAddressPair={validatedAddressPair}
          onAddressReset={onAddressReset}
        />
      )}
    </IonGrid>
  );
};
