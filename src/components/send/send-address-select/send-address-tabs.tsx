import styled from '@emotion/styled';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AddressBookList } from './address-book-list';
import { MyAccountList } from './my-account-list';
import { RecentAddressList } from './recent-address-list';

type TabValue = 'recent' | 'myAccount' | 'addressBook';

const TabsContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  marginTop: '12px',
});

const TabsHeader = styled.div({
  display: 'flex',
  gap: '24px',
  marginBottom: '16px',
});

const Tab = styled.button<{ isActive: boolean }>(({ isActive }) => ({
  background: 'none',
  border: 'none',
  padding: '8px 0',
  fontSize: '0.875rem',
  fontWeight: isActive ? 600 : 400,
  color: isActive ? 'var(--ion-color-primary)' : '#666666',
  cursor: 'pointer',
  position: 'relative',
  transition: 'color 0.2s ease',

  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-1px',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: isActive ? 'var(--ion-color-primary)' : 'transparent',
    transition: 'background-color 0.2s ease',
  },

  '&:hover': {
    color: 'var(--ion-color-primary)',
  },
}));

interface SendAddressTabsProps {
  onSelectAddress: (address: string) => void;
}

export const SendAddressTabs: FC<SendAddressTabsProps> = ({
  onSelectAddress,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabValue>('recent');

  const handleTabChange = (value: TabValue) => {
    setActiveTab(value);
  };

  return (
    <TabsContainer>
      <TabsHeader>
        <Tab
          isActive={activeTab === 'recent'}
          onClick={() => handleTabChange('recent')}
        >
          {t('Recent')}
        </Tab>
        {process.env.REACT_APP_ENABLE_ADDRESS_BOOK === 'true' && (
          <Tab
            isActive={activeTab === 'addressBook'}
            onClick={() => handleTabChange('addressBook')}
          >
            {t('AddressBook')}
          </Tab>
        )}
        <Tab
          isActive={activeTab === 'myAccount'}
          onClick={() => handleTabChange('myAccount')}
        >
          {t('MyAccount')}
        </Tab>
      </TabsHeader>
      {activeTab === 'recent' && (
        <RecentAddressList onSelectAddress={onSelectAddress} />
      )}
      {activeTab === 'myAccount' && (
        <MyAccountList onSelectAddress={onSelectAddress} />
      )}
      {process.env.REACT_APP_ENABLE_ADDRESS_BOOK === 'true' &&
        activeTab === 'addressBook' && (
          <AddressBookList onSelectAddress={onSelectAddress} />
        )}
    </TabsContainer>
  );
};
