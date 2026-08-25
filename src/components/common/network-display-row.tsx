import { NetworkDictionary } from '@akashic/as-backend';
import type { CoinSymbol } from '@akashic/core-lib';
import { IonItem, IonText } from '@ionic/react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { L2Icon } from './chain-icon/l2-icon';
import { NetworkIcon } from './chain-icon/network-icon';

export const NetworkDisplayRow: FC<{
  isL2: boolean;
  coinSymbol: CoinSymbol;
  isL2Bonded?: boolean;
}> = ({ isL2, coinSymbol, isL2Bonded }) => {
  const { t } = useTranslation();

  const displayName = (chain: CoinSymbol) =>
    NetworkDictionary[chain].displayName.replace(/Chain/g, '');

  return (
    <IonItem className={'ion-margin-bottom-xs'}>
      {isL2 ? (
        <L2Icon size={24} />
      ) : (
        <NetworkIcon size={24} chain={coinSymbol} />
      )}
      <IonText>
        <h3 className={'ion-text-size-md ion-margin-0 ion-margin-left-xs'}>
          {isL2 ? t('Chain.AkashicChain') : displayName(coinSymbol)}
        </h3>
      </IonText>
      {isL2Bonded && (
        <div
          className={
            'ion-display-flex ion-align-items-center ion-gap-xxs ion-margin-left-xs'
          }
        >
          <IonText className={'ion-text-size-xs'}>{t('Via')}</IonText>
          <NetworkIcon size={16} chain={coinSymbol} />
          <IonText className={'ion-text-size-xs ion-text-bold'}>
            {displayName(coinSymbol)}
          </IonText>
        </div>
      )}
    </IonItem>
  );
};
