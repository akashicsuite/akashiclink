import styled from '@emotion/styled';
import {
  type IAcns,
  type INft,
  nftErrors,
  userConst,
} from '@helium-pay/backend';
import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../redux/app/hooks';
import { selectCacheOtk } from '../../redux/slices/accountSlice';
import { useUpdateAcns } from '../../utils/hooks/nitr0gen';
import { useFetchAndRemapAASToAddress } from '../../utils/hooks/useFetchAndRemapAASToAddress';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { useNftMe } from '../../utils/hooks/useNftMe';
import { Nitr0genApi, signTxBody } from '../../utils/nitr0gen/nitr0gen-api';
import type { FormAlertState } from '../common/alert/alert';
import { errorAlertShell } from '../common/alert/alert';
import { Toggle } from '../common/toggle/toggle';

const AASListSwitchContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 16px;
`;

/* In minutes. 72hrs on prod, 1 min else */
const AAS_LINK_RESTRICT_TIME = process.env.REACT_APP_ENV === 'prod' ? 4320 : 1;

const validateLinkRestriction = (acnsDocument: IAcns) => {
  // For legacy-reasons this prop is "linkedAt", while in the current logic it
  // actually represents time of de-linking
  if (acnsDocument.linkedAt) {
    // Difference in ms between when aas can be linked again (linkedAt + 72hrs) and now
    const timeUntilLinkAllowed =
      // HACK bc dates get turned into strings going from BE -> FE
      new Date(acnsDocument.linkedAt).getTime() +
      AAS_LINK_RESTRICT_TIME * 60 * 1000 -
      Date.now();

    // Convert milliseconds to minutes, seconds, or hours
    const minutesDifference = Math.floor(timeUntilLinkAllowed / (1000 * 60));
    const secondsDifference = Math.floor(timeUntilLinkAllowed / 1000);
    const hoursDifference = Math.floor(timeUntilLinkAllowed / (1000 * 60 * 60));
    // If time is positive, means user still has to wait, if negative it means new link may happen
    if (timeUntilLinkAllowed > 0) {
      // The exception throws the hours, minute or seconds remaining as in the frontend the whole description is rendered.
      throw new Error(
        hoursDifference
          ? hoursDifference + ' hours'
          : minutesDifference
          ? minutesDifference + ' minutes'
          : secondsDifference + ' seconds'
      );
    }
  }
};

const verifyUpdateAcns = (
  ownerIdentity: string,
  acns: IAcns,
  nfts: INft[],
  newValue?: string
) => {
  if (newValue && ownerIdentity !== newValue)
    throw new Error(userConst.acnsOwnershipError);

  if (acns.ownerIdentity !== ownerIdentity) {
    throw new Error(nftErrors.ownerIdentityShouldBeSame);
  }

  if (!!newValue && nfts.some((nft) => nft.acns?.value)) {
    throw new Error(nftErrors.onlyOneAASLinkingAllowed);
  }

  validateLinkRestriction(acns);
};

export const AasListingSwitch = ({
  aas,
  setAlert,
}: {
  aas: IAcns;
  setAlert: React.Dispatch<React.SetStateAction<FormAlertState>>;
}) => {
  const cacheOtk = useAppSelector(selectCacheOtk);
  const { activeAccount } = useAccountStorage();
  const { nfts, mutateNftMe } = useNftMe();
  const { t } = useTranslation();
  const [isListed, setIsListed] = useState<boolean>(!!aas.value);
  const [isLoading, setIsLoading] = useState(false);
  const fetchAndRemapAASToAddress = useFetchAndRemapAASToAddress();
  const nitr0genApi = new Nitr0genApi();
  const { trigger: triggerUpdateAcns } = useUpdateAcns();

  const updateAASList = async () => {
    try {
      if (!cacheOtk) {
        throw new Error('GenericFailureMsg');
      }
      setIsLoading(true);
      if (aas.name && activeAccount?.identity && cacheOtk) {
        const newValue = !isListed ? activeAccount.identity : undefined;
        verifyUpdateAcns(cacheOtk.identity, aas, nfts, newValue);

        const txToSign = await nitr0genApi.aasSwitchTransaction(
          cacheOtk,
          aas.ledgerId,
          aas.recordType,
          aas.recordKey,
          newValue
        );

        // "Hack" used when signing nft transactions, identity must be something else than the otk identity
        const signerOtk = {
          ...cacheOtk,
          identity: aas.ledgerId,
        };

        const signedTx = await signTxBody(txToSign, signerOtk);

        await triggerUpdateAcns({ signedTx, name: aas.name });

        await fetchAndRemapAASToAddress(activeAccount.identity);
      }
      await mutateNftMe();
      setIsListed(!isListed);
    } catch (error) {
      const errorMsg = axios.isAxiosError(error)
        ? error?.response?.data?.message
        : error instanceof Error // From time-link-restriction
        ? error.message
        : '';

      if (errorMsg === nftErrors.onlyOneAASLinkingAllowed) {
        setAlert(errorAlertShell('OnlyOneAAS'));
      } else {
        setAlert(
          errorAlertShell('AASLinkingFailed', {
            name,
            timeRemaining: errorMsg.split(' ')[0],
            timeUnit: t(errorMsg.split(' ')[1]),
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AASListSwitchContainer>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h5 className="ion-no-margin ion-text-size-xxs">{t('linkAlias')}</h5>
        <p className={'ion-text-color-grey ion-text-bold ion-text-size-xxs'}>
          {t('unlinkNftWarning')}
        </p>
      </div>
      <Toggle
        switchStyle={{ width: '60px' }}
        isLoading={isLoading}
        onClickHandler={updateAASList}
        currentState={isListed ? 'active' : 'inActive'}
      />
    </AASListSwitchContainer>
  );
};
