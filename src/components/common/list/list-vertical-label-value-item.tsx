import { IonItem, IonText } from '@ionic/react';
import type { FC, ReactNode } from 'react';

type ListLabelValueRowProps = {
  label: string | number | ReactNode;
  value: string | number | ReactNode;
};

export const ListVerticalLabelValueItem: FC<ListLabelValueRowProps> = ({
  label,
  value,
}) => {
  return (
    <IonItem
      className={
        'ion-align-items-start ion-margin-top-xxs ion-margin-bottom-xxs'
      }
    >
      <IonText
        className={`w-100 ion-text-color-primary-10 ion-display-flex ion-flex-direction-column ion-text-wrap`}
      >
        <span
          className={'ion-text-size-xs ion-text-bold ion-margin-bottom-xxs'}
        >
          {label}
        </span>
        <p className={'ion-text-size-sm ion-text-color-grey'}>{value}</p>
      </IonText>
    </IonItem>
  );
};
