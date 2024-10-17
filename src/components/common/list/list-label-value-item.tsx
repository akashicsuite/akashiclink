import { IonItem, IonLabel, IonNote } from '@ionic/react';
import type { FC } from 'react';
import { type ReactNode } from 'react';

type ListLabelValueRowProps = {
  label: string | number | ReactNode;
  value: string | number | ReactNode;
  remark?: string;
  labelBold?: boolean;
  valueBold?: boolean;
  labelSize?: 'xs' | 'sm' | 'md' | 'lg';
  valueSize?: 'xs' | 'sm' | 'md' | 'lg';
};

export const ListLabelValueItem: FC<ListLabelValueRowProps> = ({
  label,
  value,
  remark,
  labelBold = false,
  valueBold = false,
  labelSize = 'xs',
  valueSize = 'xs',
}) => {
  return (
    <IonItem className={'ion-align-items-start'}>
      <IonLabel style={{ textWrap: 'nowrap' }}>
        <span
          className={`ion-text-color-primary-10 ion-text-size-${labelSize} ion-padding-right-sm ion-nowrap ion-text-nowrap ion-flex-1 ${
            labelBold ? 'ion-text-bold' : ''
          }`}
        >
          {label}
        </span>
      </IonLabel>
      <IonNote
        className={`ion-text-size-${valueSize} ion-flex-direction-column ion-display-flex ion-align-items-end ${
          valueBold ? 'ion-text-bold' : ''
        } ion-no-margin ion-text-align-right`}
        style={{
          width: '62%',
        }}
        slot={'end'}
      >
        <span className={'ion-text-color-primary-10'}>{value}</span>
        {remark && (
          <span
            style={{ lineHeight: '0.75rem' }}
            className={
              'ion-text-size-xxs ion-margin-left-xxs ion-text-color-grey ion-text-align-right'
            }
          >
            {remark}
          </span>
        )}
      </IonNote>
    </IonItem>
  );
};
