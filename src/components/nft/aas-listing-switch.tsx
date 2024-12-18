import styled from '@emotion/styled';
import { type INft, nftErrors, userConst } from '@helium-pay/backend';
import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUpdateAas } from '../../utils/hooks/nitr0gen';
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

const validateLinkRestriction = (nftDocument: INft) => {
  if (nftDocument.aas.unLinkedAt) {
    // Difference in ms between when aas can be linked again (linkedAt + 72hrs) and now
    const timeUntilLinkAllowed =
      // HACK bc dates get turned into strings going from BE -> FE
      new Date(nftDocument.aas.unLinkedAt).getTime() +
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

const verifyUpdateAas = (
  ownerIdentity: string,
  nft: INft,
  nfts: INft[],
  newValue?: string
) => {
  // Show generic error
  if (newValue && ownerIdentity !== newValue)
    throw new Error(userConst.aasOwnershipError);

  if (nft.ownerIdentity !== ownerIdentity) {
    throw new Error(nftErrors.ownerIdentityShouldBeSame);
  }

  if (!!newValue && nfts.some((nft) => nft.aas?.linked)) {
    throw new Error(nftErrors.onlyOneAASLinkingAllowed);
  }

  validateLinkRestriction(nft);
};

export const AasListingSwitch = ({
  nft,
  setAlert,
  setParentLinkage,
}: {
  nft: INft;
  setAlert: React.Dispatch<React.SetStateAction<FormAlertState>>;
  setParentLinkage: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { activeAccount, cacheOtk } = useAccountStorage();
  const { nfts, mutateNftMe } = useNftMe();
  const { t } = useTranslation();
  const [isLinked, setIsLinked] = useState<boolean>(!!nft.aas.linked);
  const [isLoading, setIsLoading] = useState(false);
  const { addAasToAccountByIdentity, removeAasFromAccountByIdentity } =
    useAccountStorage();
  const nitr0genApi = new Nitr0genApi();
  const { trigger: triggerUpdateAas } = useUpdateAas();

  // We use these functions directly instead of `fetchAndRemap..` as
  // backend might not be aware of the aas-event yet and so fetching data
  // from backend is not guaranteed to match the correct state
  const addOrRemoveAasToAccount = async (
    linking: boolean,
    alias?: string,
    nftLedgerId?: string
  ) => {
    if (!activeAccount) return;
    if (linking && alias && nftLedgerId) {
      await addAasToAccountByIdentity(
        nft.alias,
        activeAccount.identity,
        nft.ledgerId
      );
    } else if (!linking) {
      await removeAasFromAccountByIdentity(activeAccount?.identity);
    }
  };

  const updateAASList = async () => {
    try {
      if (!cacheOtk) {
        throw new Error('GenericFailureMsg');
      }
      setIsLoading(true);
      if (nft.alias && activeAccount?.identity && cacheOtk) {
        const newValue = !isLinked ? activeAccount.identity : undefined;
        verifyUpdateAas(cacheOtk.identity, nft, nfts, newValue);

        const txToSign = await nitr0genApi.aasSwitchTransaction(
          cacheOtk,
          nft.aas.ledgerId,
          newValue
        );

        // "Hack" used when signing nft transactions, identity must be something else than the otk identity
        const signerOtk = {
          ...cacheOtk,
          identity: nft.aas.ledgerId,
        };

        const signedTx = await signTxBody(txToSign, signerOtk);

        await triggerUpdateAas(signedTx);

        // If not linked before, it will now get linked
        await addOrRemoveAasToAccount(!isLinked, nft.alias, nft.ledgerId);
      }
      await mutateNftMe();
      setIsLinked(!isLinked);
      setParentLinkage(!isLinked);
    } catch (error) {
      const errorMsg = axios.isAxiosError(error)
        ? error?.response?.data?.message
        : error instanceof Error // From time-link-restriction
          ? error.message
          : '';
      const timeUnits = ['hours', 'minutes', 'seconds'];
      if (errorMsg === nftErrors.onlyOneAASLinkingAllowed) {
        setAlert(errorAlertShell('OnlyOneAAS'));
      } else if (timeUnits.includes(errorMsg.split(' ')[1])) {
        setAlert(
          errorAlertShell('AASLinkingFailed', {
            name: nft.alias,
            timeRemaining: errorMsg.split(' ')[0],
            timeUnit: t(errorMsg.split(' ')[1]),
          })
        );
      } else {
        setAlert(errorAlertShell('GenericFailureMsg'));
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
        currentState={isLinked ? 'active' : 'inActive'}
      />
    </AASListSwitchContainer>
  );
};
