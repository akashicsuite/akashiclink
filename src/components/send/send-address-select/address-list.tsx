import styled from '@emotion/styled';
import { IonList } from '@ionic/react';
import { type ReactNode } from 'react';

import { AddressListItem } from './address-list-item';

export const AddressListContainer = styled.div({
  flex: 1,
  overflowY: 'auto',
  maxHeight: 'calc(92vh - 240px)',
});

export const EmptyState = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  color: 'var(--ion-color-medium)',
  fontSize: '0.75rem',
});

type AddressListProps<T> = {
  items: T[];
  keyExtractor: (item: T) => string;
  onSelectItem: (item: T) => void;
  renderContent: (item: T) => ReactNode;
  /** Optional slot rendered at the end of each row (e.g. a save button). */
  renderTrailing?: (item: T) => ReactNode;
  emptyStateMessage?: string;
  isLoading?: boolean;
  loadingMessage?: string;
};

export const AddressList = <T,>({
  items,
  keyExtractor,
  onSelectItem,
  renderContent,
  renderTrailing,
  emptyStateMessage,
  isLoading,
  loadingMessage,
}: AddressListProps<T>): JSX.Element => {
  if (isLoading && items.length === 0 && loadingMessage) {
    return (
      <AddressListContainer>
        <EmptyState>{loadingMessage}</EmptyState>
      </AddressListContainer>
    );
  }

  if (items.length === 0 && emptyStateMessage) {
    return (
      <AddressListContainer>
        <EmptyState>{emptyStateMessage}</EmptyState>
      </AddressListContainer>
    );
  }

  return (
    <AddressListContainer>
      <IonList lines="none" style={{ padding: 0, background: 'transparent' }}>
        {items.map((item) => (
          <AddressListItem
            key={keyExtractor(item)}
            onSelect={() => onSelectItem(item)}
            trailing={renderTrailing?.(item)}
          >
            {renderContent(item)}
          </AddressListItem>
        ))}
      </IonList>
    </AddressListContainer>
  );
};
