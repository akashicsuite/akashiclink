import styled from '@emotion/styled';
import { IonIcon, IonItem, IonLabel, IonText } from '@ionic/react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Divider } from '../common/divider';
import { ForwardArrow } from './forward-arrow';

const Header = styled(IonText)`
  font-size: 1rem;
  color: var(--ion-color-primary-10);
  line-height: 20px;
  font-weight: 700;
`;
const SubHeader = styled(IonText)`
  font-size: 0.75rem;
  color: #b0a9b3;
  line-height: 20px;
  font-weight: 700;
`;
const StyledIonItem = styled(IonItem)<{ backgroundColor?: string }>`
  width: 100%;
  --min-height: 36px;
  --inner-border-width: 0px;
  --inner-padding-end: 8px;
  --inner-padding-start: 8px;
  --background-hover: var(--ion-current-selection);
  --background-hover-opacity: var(--ion-current-selection-opacity);
  --border-radius: 8px;
  --background: ${(props) =>
    props.backgroundColor ? props.backgroundColor : ''};
  cursor: pointer;
`;

export type SettingItemProps = {
  header: string;
  iconUrl?: string;
  onClick?: () => void;
  isAccordion?: boolean;
  children?: ReactNode;
  endComponent?: ReactNode;
  isDivider?: boolean;
  backgroundColor?: string;
  subHeading?: string;
  ripple?: boolean;
};
export function SettingItem({
  iconUrl,
  header,
  isAccordion = false,
  endComponent,
  children,
  isDivider,
  onClick,
  backgroundColor,
  subHeading,
  ripple = true,
}: SettingItemProps) {
  const [showAccordionItem, setShowAccordionItem] = useState(false);
  return (
    <>
      <StyledIonItem
        backgroundColor={backgroundColor}
        button={ripple}
        detail={false}
        className="ion-no-padding"
        onClick={
          !isAccordion
            ? onClick
            : () => {
                setShowAccordionItem(!showAccordionItem);
              }
        }
      >
        {iconUrl && (
          <IonIcon
            className="ion-no-margin ion-margin-left-xxs"
            slot="start"
            size="24px"
            src={iconUrl}
          />
        )}
        <IonLabel
          className="ion-no-margin"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <Header>{header}</Header>
          {subHeading && <SubHeader>{subHeading}</SubHeader>}
        </IonLabel>
        {endComponent ? endComponent : <ForwardArrow />}
      </StyledIonItem>
      {isAccordion && showAccordionItem && children}
      {isDivider && <Divider />}
    </>
  );
}
