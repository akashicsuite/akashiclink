import { datadogRum } from '@datadog/browser-rum';
import styled from '@emotion/styled';
import {
  type INft,
  type IVerifyNftResponse,
  L2Regex,
  nftErrors,
} from '@helium-pay/backend';
import { IonCol, IonImg, IonRow, IonSpinner, isPlatform } from '@ionic/react';
import { debounce } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import {
  CustomAlert,
  errorAlertShell,
  formAlertResetState,
} from '../../components/common/alert/alert';
import { PrimaryButton, WhiteButton } from '../../components/common/buttons';
import { AlertIcon } from '../../components/common/icons/alert-icon';
import {
  StyledInput,
  StyledInputErrorPrompt,
} from '../../components/common/input/styled-input';
import { OneNft } from '../../components/nft/one-nft';
import { NftLayout } from '../../components/page-layout/nft-layout';
import { errorMsgs } from '../../constants/error-messages';
import { urls } from '../../constants/urls';
import { useAppSelector } from '../../redux/app/hooks';
import { selectCacheOtk } from '../../redux/slices/accountSlice';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import {
  type LocationState,
  historyGoBackOrReplace,
} from '../../routing/history';
import { akashicPayPath } from '../../routing/navigation-tabs';
import { themeType } from '../../theme/const';
import { OwnersAPI } from '../../utils/api';
import { useNftTransfer } from '../../utils/hooks/nitr0gen';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { useNftMe } from '../../utils/hooks/useNftMe';
import { displayLongText } from '../../utils/long-text';
import { Nitr0genApi, signTxBody } from '../../utils/nitr0gen/nitr0gen-api';
import type { FullOtk } from '../../utils/otk-generation';
import { unpackRequestErrorMessage } from '../../utils/unpack-request-error-message';
import { NftWrapper } from './nft';
import { NoNtfText, NoNtfWrapper } from './nfts';

const SendWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 0,
  width: '270px',
  height: '90px',
});

const AddressWrapper = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0',
  gap: '16px',
  width: '270px',
  height: '28px',
});

const AddressBox = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  width: '270px',
  height: '40px',
  borderRadius: '8px',
  fontFamily: 'Nunito Sans',
  fontWeight: '700',
  fontSize: '12px',
  lineHeight: '16px',
  color: 'var(--ion-color-primary-10)',
  border: '1px solid #958e99',
});
export const NftContainer = styled.div`
  width: 180px;
  position: relative;
  margin: 0 auto;
`;
enum SearchResult {
  Layer2 = 'Layer2',
  AcnsName = 'AcnsName',
  NoResult = 'NoResult',
  NoInput = 'NoInput',
  IsSelfAddress = 'isSelfAddress',
  SendBpByAlias = 'SendBpByAlias',
}

const verifyNftTransaction = async (
  nft: INft,
  cacheOtk: FullOtk | null,
  toAddress: string
): Promise<IVerifyNftResponse> => {
  if (!cacheOtk || !nft.acns?.ledgerId) {
    throw new Error('GenericFailureMsg');
  }

  const nitr0genApi = new Nitr0genApi();
  if (nft.acns?.value) {
    throw new Error(nftErrors.acnsValueShouldBeDeleted);
  }
  if (nft.ownerIdentity === toAddress) {
    throw new Error(nftErrors.toAddressIsAlreadyOwner);
  }

  const txToSign = await nitr0genApi.transferNftTransaction(
    cacheOtk,
    nft.acns?.ledgerId,
    toAddress
  );

  return {
    nftOwnerIdentity: nft.ownerIdentity,
    nftAcnsStreamId: nft.acns.ledgerId,
    txToSign,
  };
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function NftTransfer() {
  const { t } = useTranslation();
  const isMobile = isPlatform('mobile');
  const { nfts, isLoading, mutateNftMe } = useNftMe();
  const history = useHistory<LocationState>();
  const state = history.location.state?.nft;
  const currentNft = nfts.find((nft) => nft.name === state?.nftName) ?? nfts[0];
  const [inputValue, setInputValue] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>('');
  const [searched, setSearched] = useState(false);
  const [searchedResultType, setSearchedResultType] = useState(
    SearchResult.NoInput
  );
  const { activeAccount } = useAccountStorage();
  const { trigger: triggerNftTransfer } = useNftTransfer();

  const [alert, setAlert] = useState(formAlertResetState);
  const [loading, setLoading] = useState(false);
  const cacheOtk = useAppSelector(selectCacheOtk);
  const storedTheme = useAppSelector(selectTheme);
  const isDarkMode = storedTheme === themeType.DARK;

  // input username to address
  // TODO: we need to add more check constraint in the future, like l2 address start with "AS"
  const inputToAddress = debounce(async (value: string) => {
    if (!value || value === '') {
      setToAddress('');
      setSearched(false);
      setSearchedResultType(SearchResult.NoInput);
      return;
    }
    // Not allow sending to self address
    if (value === activeAccount?.identity || value === activeAccount?.aasName) {
      setToAddress('');
      setSearched(false);
      setSearchedResultType(SearchResult.IsSelfAddress);
      return;
    }
    const { l2Address, acnsAlias, isBp } = await OwnersAPI.lookForL2Address({
      to: value,
    });

    // Not allow sending BP by alias
    if (acnsAlias === value && isBp) {
      setToAddress('');
      setSearched(false);
      setSearchedResultType(SearchResult.SendBpByAlias);
      return;
    }

    if (l2Address && value.match(L2Regex)) {
      setToAddress(l2Address);
      setSearchedResultType(SearchResult.Layer2);
      setSearched(true);
    } else {
      setSearched(false);
      setSearchedResultType(SearchResult.NoResult);
    }
  }, 500);

  const transferNft = async () => {
    setLoading(true);
    try {
      if (!cacheOtk) {
        throw new Error('GenericFailureMsg');
      }

      const verifiedNft = await verifyNftTransaction(
        currentNft,
        cacheOtk,
        toAddress
      );

      // "Hack" used when signing nft transactions, identity must be something else than the otk identity
      const signerOtk = {
        ...cacheOtk,
        identity: verifiedNft.nftAcnsStreamId,
      };
      const signedTx = await signTxBody(verifiedNft.txToSign, signerOtk);

      const response = await triggerNftTransfer({
        signedTx,
        nftName: currentNft.name,
        toAddress: toAddress,
      });

      const result = {
        sender: activeAccount?.identity,
        receiver: toAddress,
        nftName: currentNft.name,
        acnsAlias: currentNft.acns?.name || '',
        txHash: response.txHash,
      };
      history.push({
        pathname: akashicPayPath(urls.nftTransferResult),
        state: {
          nftTransferResult: {
            transaction: result,
            errorMsg: errorMsgs.NoError,
          },
        },
      });
    } catch (error) {
      datadogRum.addError(error);
      setAlert(errorAlertShell(unpackRequestErrorMessage(error)));
    } finally {
      setInputValue('');
      await mutateNftMe();
      setLoading(false);
    }
  };

  return (
    <>
      <CustomAlert state={alert} />
      {isLoading && (
        <NoNtfWrapper>
          <IonSpinner name="circular"></IonSpinner>
        </NoNtfWrapper>
      )}
      <NftLayout>
        {isLoading ? (
          <NoNtfWrapper>
            <IonSpinner name="circular"></IonSpinner>
          </NoNtfWrapper>
        ) : nfts.length === 0 ? (
          <NoNtfWrapper>
            <AlertIcon />
            <NoNtfText>{t('DoNotOwnNfts')}</NoNtfText>
          </NoNtfWrapper>
        ) : (
          <NftWrapper>
            <IonRow className="w-100">
              <NftContainer>
                <OneNft
                  nft={currentNft}
                  isBig={false}
                  isAASDarkStyle={!isDarkMode}
                />
              </NftContainer>
            </IonRow>
            <IonRow>
              <IonCol class="ion-center">
                <SendWrapper style={{ gap: isMobile ? '24px' : '16px' }}>
                  <StyledInput
                    className={'ion-text-size-sm'}
                    isHorizontal={true}
                    label={t('SendTo')}
                    placeholder={t('EnterAddress')}
                    type={'text'}
                    errorPrompt={StyledInputErrorPrompt.Address}
                    onIonInput={({ target: { value } }) => {
                      !value && setSearchedResultType(SearchResult.NoInput);
                      typeof value === 'string' && inputToAddress(value);
                      typeof value === 'string' && setInputValue(value);
                    }}
                    value={inputValue}
                  />
                  {inputValue && searchedResultType !== SearchResult.NoInput && (
                    <AddressWrapper>
                      <AddressBox>
                        {searchedResultType === SearchResult.AcnsName &&
                          `${inputValue} = ${displayLongText(toAddress)}`}
                        {searchedResultType === SearchResult.Layer2 &&
                          `${displayLongText(toAddress)}`}
                        {searchedResultType === SearchResult.NoResult &&
                          t('NoSearchResult')}
                        {searchedResultType === SearchResult.IsSelfAddress &&
                          t('NoSelfSend')}
                      </AddressBox>

                      <IonImg
                        alt={''}
                        src={
                          searched
                            ? '/shared-assets/images/right.png'
                            : '/shared-assets/images/wrong.png'
                        }
                        style={{ width: '40px', height: '40px' }}
                      />
                    </AddressWrapper>
                  )}
                </SendWrapper>
              </IonCol>
            </IonRow>
            <IonRow
              class="ion-justify-content-between"
              style={{
                width: '280px',
              }}
            >
              <IonCol>
                <PrimaryButton
                  expand="block"
                  disabled={!inputValue || !searched}
                  onClick={transferNft}
                >
                  {t('Send')}
                  {loading ? (
                    <IonSpinner style={{ marginLeft: '10px' }}></IonSpinner>
                  ) : null}
                </PrimaryButton>
              </IonCol>
              <IonCol>
                <WhiteButton
                  expand="block"
                  onClick={() =>
                    historyGoBackOrReplace(urls.nft, { nft: state })
                  }
                >
                  {t('Cancel')}
                </WhiteButton>
              </IonCol>
            </IonRow>
          </NftWrapper>
        )}
      </NftLayout>
    </>
  );
}
