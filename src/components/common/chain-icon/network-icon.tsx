import type { CoinSymbol } from '@helium-pay/backend';
import { IonImg } from '@ionic/react';

import { SUPPORTED_CURRENCIES_FOR_EXTENSION } from '../../../constants/currencies';
import { useAppSelector } from '../../../redux/app/hooks';
import { selectTheme } from '../../../redux/slices/preferenceSlice';

export const NetworkIcon = ({
  chain: targetChain,
  size = 24,
}: {
  chain: CoinSymbol;
  size?: number;
}) => {
  const storedTheme = useAppSelector(selectTheme);

  const currency = SUPPORTED_CURRENCIES_FOR_EXTENSION.list.find(
    ({ walletCurrency: { chain } }) => chain === targetChain
  );

  const icon =
    storedTheme === 'dark'
      ? currency?.darkCurrencyIcon
      : currency?.currencyIcon;

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
      }}
    >
      <IonImg src={icon} style={{ width: 'auto', height: '100%' }} />
    </span>
  );
};
