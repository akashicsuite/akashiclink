import type { CoinSymbol } from '@helium-pay/backend';
import { NetworkDictionary } from '@helium-pay/backend';
import { IonImg } from '@ionic/react';

export const NetworkIcon = ({
  chain,
  size = 24,
}: {
  chain: CoinSymbol;
  size?: number;
}) => {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
      }}
    >
      <IonImg
        src={NetworkDictionary[chain].networkIcon}
        style={{ width: 'auto', height: '100%' }}
      />
    </span>
  );
};
