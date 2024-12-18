import Big from 'big.js';
import type { FC, ReactNode } from 'react';

import { getPrecision } from '../../../utils/formatAmount';
import { useFocusCurrencySymbolsAndBalances } from '../../../utils/hooks/useAggregatedBalances';
import {
  ListLabelValueItem,
  type ListLabelValueRowProps,
} from './list-label-value-item';

type ListLabelValueAmountItemProps = {
  label: string | number | ReactNode;
  value: string | number;
  amount: string;
  fee: string;
} & ListLabelValueRowProps;

export const ListLabelValueAmountItem: FC<ListLabelValueAmountItemProps> = ({
  label,
  amount,
  value,
  fee,
  ...props
}) => {
  const { networkCurrencyCombinedDisplayName } =
    useFocusCurrencySymbolsAndBalances();

  // fee is internal-fee here
  const precision = getPrecision(amount, fee ?? '0');

  return (
    <ListLabelValueItem
      label={label}
      value={
        <span style={{ lineHeight: '1.125rem' }}>
          <span>{Big(value).toFixed(precision)}</span>{' '}
          <span>{networkCurrencyCombinedDisplayName}</span>
        </span>
      }
      labelBold
      {...props}
    />
  );
};
