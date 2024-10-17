import './one-nft.css';

import { Clipboard } from '@capacitor/clipboard';
import styled from '@emotion/styled';
import type { INft } from '@helium-pay/backend';
import { IonContent, IonIcon, IonImg, IonPopover, IonRow } from '@ionic/react';
import { t } from 'i18next';
import { useEffect, useMemo, useRef, useState } from 'react';

import { displayLongText } from '../../utils/long-text';
import { getNftImage } from '../../utils/nft-image-link';
interface Props {
  nft: INft;
  select?: () => void;
  style?: React.CSSProperties;
  isBig?: boolean;
  isAASDarkStyle?: boolean;
  isAASBackgroundDark?: boolean;
  nftImgWrapper?: string;
  screen?: string;
}

const AccountNameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 16px;
  padding-bottom: 8px;
`;
const NtfWrapper = styled.div<{
  isAASLinked: boolean;
  isAASDarkStyle?: boolean;
  isBig?: boolean;
}>((props) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-end',
  padding: '8px',
  borderRadius: props.isBig ? '24px' : '8px',
  borderTopRightRadius: props.isAASLinked
    ? '0px'
    : props.isBig
    ? '24px'
    : '8px',
  marginTop: props.isAASLinked ? '0px' : '20px',
  background: 'var(--nft-background)',
  boxShadow: '6px 6px 20px rgba(0,0,0,0.10000000149011612)',
  ['& ion-img::part(image)']: {
    borderRadius: props.isBig ? '20px' : '10px',
  },
}));

const OneNFTContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  alignItems: 'flex-end',
  cursor: 'pointer',
});
const NftName = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#000',
  fontFamily: 'Nunito Sans',
  fontStyle: 'normal',
  fontWeight: 700,
  textAlign: 'center',
  lineHeight: '16px',
  cursor: 'pointer',
  paddingBottom: '8px',
});

const AASListTag = styled.div({
  color: 'var(--ion-color-primary-dark)',
  background: 'var(--ion-color-primary-70)',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  float: 'right',
  maxWidth: '80%',
  padding: '4px 20px',
});

export function OneNft(props: Props) {
  const handleCopy = async (accountName: string) => {
    await Clipboard.write({
      string: accountName,
    });
    setPopoverOpen(true);
    setTimeout(() => {
      setPopoverOpen(false);
    }, 1000);
  };
  const popover = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [nftUrl, setNftUrl] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    async function getNft() {
      const nftUrl = await getNftImage(props.nft?.ledgerId);
      setNftUrl(nftUrl);
    }
    getNft();
  }, [props.nft?.ledgerId]);

  const placeholderSrc = useMemo(() => {
    if (props.isAASDarkStyle) {
      return '/shared-assets/images/img-placeholder-dark.svg';
    }
    return '/shared-assets/images/img-placeholder-light.svg';
  }, [props.isAASDarkStyle]);

  const imageClass = useMemo(() => {
    if (props.isBig) {
      return 'nft-image-big nft-img-size';
    }
    return 'nft-image-small nft-img-size';
  }, [props.isBig]);

  return (
    <OneNFTContainer>
      {props.nft?.acns?.value && (
        <div style={{ width: '100%' }}>
          <AASListTag>
            <h5
              className="ion-no-margin .ion-text-size-sm"
              style={
                props.isAASDarkStyle
                  ? { color: 'var(--ion-color-white)' }
                  : { color: '#202020' }
              }
            >
              {t('AALinked')}
            </h5>
          </AASListTag>
        </div>
      )}
      <NtfWrapper
        isAASLinked={!!props.nft?.acns?.value}
        style={props.style}
        onClick={props.select}
        isAASDarkStyle={props.isAASDarkStyle}
        isBig={props.isBig}
        className={props.nftImgWrapper}
      >
        <IonImg
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20%',
            height: '20%',
          }}
          alt="image-loading"
          src={placeholderSrc}
          class={imageClass}
        />

        {nftUrl && (
          <IonImg
            style={{
              position: 'relative',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
            }}
            alt={props.nft?.description}
            src={nftUrl}
            class={imageClass}
            onIonImgDidLoad={() => setImageLoaded(true)}
          />
        )}
        <AccountNameWrapper>
          <h5
            style={{
              color: props.isAASDarkStyle
                ? 'var(--ion-color-primary-dark)'
                : 'var(--ion-color-primary-light)',
            }}
            title={props.nft?.account}
            className={`ion-no-margin ${
              props.screen === 'transfer'
                ? 'ion-text-size-xs'
                : 'ion-text-size-sm'
            }`}
          >
            {displayLongText(props.nft?.account, 32)}
          </h5>
          <IonIcon
            slot="icon-only"
            className="copy-icon ion-margin-left-xxs"
            style={{
              width: '20px',
              height: '20px',
            }}
            src={`/shared-assets/images/${
              props.isAASDarkStyle
                ? `copy-icon-light.svg`
                : `copy-icon-white.svg`
            }`}
            onClick={async (e) => {
              e.stopPropagation();
              handleCopy(props.nft?.account);
            }}
          />
          <IonPopover
            side="top"
            alignment="center"
            ref={popover}
            isOpen={popoverOpen}
            className={'copied-popover'}
            onDidDismiss={() => setPopoverOpen(false)}
          >
            <IonContent class="ion-padding">{t('Copied')}</IonContent>
          </IonPopover>
        </AccountNameWrapper>
        <IonRow>
          <NftName
            style={{
              color: '#958E99',
              fontWeight: '700',
              width: '100%',
            }}
            className={`${
              props.screen === 'transfer'
                ? 'ion-text-size-xxs'
                : 'ion-text-size-xs'
            }`}
          >
            {props.nft?.name}
          </NftName>
        </IonRow>
      </NtfWrapper>
    </OneNFTContainer>
  );
}
