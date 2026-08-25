import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const AddressBookNameRow: FC<{ name?: string }> = ({ name }) => {
  const { t } = useTranslation();

  if (!name) return null;

  return (
    <span className={'ion-text-size-xs'}>
      {`${t('AddressBookName')}: `}
      <span className={'ion-text-bold'}>{name}</span>
    </span>
  );
};
