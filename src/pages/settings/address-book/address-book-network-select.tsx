import styled from '@emotion/styled';
import { IonIcon } from '@ionic/react';
import { chevronDown, chevronUp } from 'ionicons/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { DepositChainOption } from '../../../utils/hooks/useAccountL1Address';

const SelectWrapper = styled.div({
  width: '100%',
});

const SelectLabel = styled.label({
  display: 'block',
  fontFamily: "'Nunito Sans', serif",
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--ion-color-primary-10)',
  marginBottom: '8px',
});

const SelectTrigger = styled.button<{ isOpen: boolean }>(({ isOpen }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  background: 'transparent',
  border: '1px solid #958e99',
  borderRadius: isOpen ? '8px 8px 0 0' : '8px',
  cursor: 'pointer',
  color: 'var(--ion-color-primary-10)',
  fontSize: '0.75rem',
  fontWeight: 700,
  minHeight: '40px',
}));

const Placeholder = styled.span({
  fontWeight: 400,
  color: 'var(--ion-color-step-400)',
});

const OptionsList = styled.div({
  background: 'var(--ion-background-color)',
  border: '1px solid #958e99',
  borderTop: 'none',
  borderRadius: '0 0 8px 8px',
  overflow: 'hidden',
});

const OptionItem = styled.button({
  width: '100%',
  padding: '12px 16px',
  background: 'none',
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  color: 'var(--ion-color-primary-10)',
  fontSize: '0.75rem',
  fontWeight: 700,
  '&:hover': {
    background: 'var(--ion-color-step-50)',
  },
});

interface NetworkSelectProps {
  options: DepositChainOption[];
  value?: DepositChainOption;
  onChange: (network: DepositChainOption) => void;
}

/**
 * Network picker shown when an address matches more than one chain and the
 * user has to disambiguate.
 */
export function NetworkSelect({
  options,
  value,
  onChange,
}: NetworkSelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectWrapper>
      <SelectLabel>{t('Chain.Title')}</SelectLabel>
      <SelectTrigger isOpen={isOpen} onClick={() => setIsOpen((prev) => !prev)}>
        {value ? (
          t(`Chain.${value}`)
        ) : (
          <Placeholder>{t('SelectNetwork')}</Placeholder>
        )}
        <IonIcon
          icon={isOpen ? chevronUp : chevronDown}
          style={{ fontSize: '1rem', flexShrink: 0 }}
        />
      </SelectTrigger>
      {isOpen && (
        <OptionsList>
          {options.map((chain) => (
            <OptionItem
              key={chain}
              onClick={() => {
                onChange(chain);
                setIsOpen(false);
              }}
            >
              {t(`Chain.${chain}`)}
            </OptionItem>
          ))}
        </OptionsList>
      )}
    </SelectWrapper>
  );
}
