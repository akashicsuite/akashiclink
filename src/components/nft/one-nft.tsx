import { Clipboard } from '@capacitor/clipboard';
import styled from '@emotion/styled';
import type { INft } from '@helium-pay/backend';
import { IonContent, IonIcon, IonImg, IonPopover, IonRow } from '@ionic/react';
import { t } from 'i18next';
import { useRef, useState } from 'react';

import { displayLongText } from '../../utils/long-text';
import { getNftImage } from '../../utils/nft-image-link';
interface Props {
  nft: INft;
  select?: () => void;
  style?: React.CSSProperties;
  isBig?: boolean;
  isAASDarkStyle?: boolean;
  isAASBackgroundDark?: boolean;
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
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  padding: '8px',
  borderRadius: props.isBig ? '24px' : '8px',
  borderTopRightRadius: props.isAASLinked
    ? '0px'
    : props.isBig
    ? '24px'
    : '8px',
  marginTop: props.isAASLinked ? '0px' : '20px',
  background: props.isAASDarkStyle
    ? 'var(--ion-modal-nft)'
    : 'var(--ion-modal-background)',
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
  background: '#FFF',
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
      >
        <IonImg
          alt={props.nft?.description}
          src={getNftImage(props.nft?.ledgerId)}
          class={
            props.isBig
              ? 'nft-image-big nft-img-size'
              : 'nft-image-small nft-img-size'
          }
        />
        <AccountNameWrapper>
          <h5
            style={{
              color: props.isAASDarkStyle
                ? 'var(--ion-color-primary-dark)'
                : '#ffffff',
            }}
            title={props.nft?.account}
            className={'ion-no-margin ion-text-size-sm'}
          >
            {displayLongText(props.nft?.account, 32)}
          </h5>
          <IonIcon
            slot="icon-only"
            className="copy-icon"
            style={{
              marginLeft: '4px',
              width: '20px',
              height: '20px',
            }}
            src={`/shared-assets/images/${
              props.isAASDarkStyle
                ? `copy-icon-only-dark.svg`
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
              background: props.isAASDarkStyle
                ? 'var(--ion-modal-nft)'
                : 'var(--ion-modal-background)',
            }}
            className={'ion-text-size-xs'}
          >
            {props.nft?.name}
          </NftName>
        </IonRow>
      </NtfWrapper>
    </OneNFTContainer>
  );
}
