import { IonImg } from '@ionic/react';

export const ErrorIconWithTitle = ({
  title,
  className,
  size = 40,
  isHorizontal = false,
}: {
  title: string;
  className?: string;
  size?: number;
  isHorizontal?: boolean;
}) => {
  return (
    <div
      className={`ion-display-flex ion-center ${
        isHorizontal
          ? 'ion-flex-direction-row ion-gap-xxs'
          : 'ion-flex-direction-column'
      } ${className ?? ''}`}
    >
      <IonImg
        alt={''}
        src={'/shared-assets/images/failed.png'}
        style={{ width: size, height: size }}
      />
      <h2
        className={`ion-text-align-center ion-text-size-md ion-margin-bottom-0 ${
          isHorizontal ? '' : 'ion-margin-top-sm'
        }`}
      >
        {title}
      </h2>
    </div>
  );
};
