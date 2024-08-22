import { IonImg } from '@ionic/react';

export const L2Icon = ({ size = 24 }: { size?: number }) => {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
      }}
    >
      <IonImg
        src={'/shared-assets/icons/L2_icon.svg'}
        style={{ width: 'auto ', height: '100%' }}
      />
    </span>
  );
};
