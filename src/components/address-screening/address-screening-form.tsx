import { IonGrid } from '@ionic/react';
import { useState } from 'react';

import { AddressScreeningAddressInput } from './address-screening-address-input';
import { AddressScreeningSelectCurrency } from './address-screening-select-currency';
import type { ValidatedScanAddress } from './types';
import { validatedScanAddressInitialState } from './types';

export const AddressScreeningForm = () => {
  // [L1 address, user input address]
  const [validatedAddress, setValidatedAddress] =
    useState<ValidatedScanAddress>(validatedScanAddressInitialState);

  const onAddressValidated = (address: ValidatedScanAddress) => {
    setValidatedAddress(address);
  };

  const onAddressReset = () => {
    setValidatedAddress(validatedScanAddressInitialState);
  };

  return (
    <IonGrid
      className={
        'ion-padding-top-0 ion-padding-bottom-xxs ion-padding-left-md ion-padding-right-md'
      }
    >
      <AddressScreeningAddressInput
        validatedScanAddress={validatedAddress}
        onAddressValidated={onAddressValidated}
        onAddressReset={onAddressReset}
      />
      {validatedAddress.scanAddress !== '' && (
        <AddressScreeningSelectCurrency
          validatedScanAddress={validatedAddress}
          onAddressReset={onAddressReset}
        />
      )}
    </IonGrid>
  );
};
