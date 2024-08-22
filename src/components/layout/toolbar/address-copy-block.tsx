import { Clipboard } from '@capacitor/clipboard';
import styled from '@emotion/styled';
import { IonContent, IonIcon, IonPopover } from '@ionic/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../../redux/app/hooks';
import { selectTheme } from '../../../redux/slices/preferenceSlice';
import { themeType } from '../../../theme/const';
import { displayLongText } from '../../../utils/long-text';
import { SquareWhiteButton } from '../../common/buttons';

const AddressWrapper = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItem: 'center',
  gap: '8px',
  flexGlow: '1px',
  marginTop: '4px',
});
interface Props {
  address: string;
}
export function AddressCopyBlock(props: Props) {
  const copyAddressPopover = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const storedTheme = useAppSelector(selectTheme);
  const { t } = useTranslation();

  const copyAddress = async (e: never) => {
    await Clipboard.write({
      string: props.address,
    });

    if (copyAddressPopover.current) {
      copyAddressPopover.current.event = e;
    }
    setPopoverOpen(true);
    setTimeout(() => {
      setPopoverOpen(false);
    }, 1000);
  };

  return (
    <SquareWhiteButton className={'w-100 icon-button'} onClick={copyAddress}>
      <AddressWrapper>
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            marginTop: '2px',
          }}
        >
          {displayLongText(props.address, 18)}
        </div>
        <IonIcon
          className="icon-button-icon"
          slot="icon-only"
          src={`/shared-assets/images/${
            storedTheme === themeType.DARK
              ? 'copy-icon-white.svg'
              : 'copy-icon-dark.svg'
          }`}
          style={{
            height: '16px',
            width: '16px',
          }}
        />
        <IonPopover
          side="top"
          alignment="center"
          ref={copyAddressPopover}
          isOpen={popoverOpen}
          className={'copied-popover'}
          onDidDismiss={() => setPopoverOpen(false)}
        >
          <IonContent class="ion-padding">{t('Copied')}</IonContent>
        </IonPopover>
      </AddressWrapper>
    </SquareWhiteButton>
  );
}
