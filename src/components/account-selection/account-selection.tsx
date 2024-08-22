import './account-selection.scss';
import '../page-layout/layout-with-activity-tab.scss';

import type { IonSelectCustomEvent } from '@ionic/core/dist/types/components';
import type { SelectChangeEventDetail } from '@ionic/react';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { urls } from '../../constants/urls';
import { akashicPayPath } from '../../routing/navigation-tabs';
import type { LocalAccount } from '../../utils/hooks/useLocalAccounts';
import { useAccountStorage } from '../../utils/hooks/useLocalAccounts';
import { displayLongText } from '../../utils/long-text';

const ACCOUNT_OPERATION_OPTIONS = [
  {
    tKey: 'CreateWallet',
    url: urls.createWalletPassword,
  },
  {
    tKey: 'ImportWallet',
    url: urls.importWalletSelectMethod,
  },
  {
    tKey: 'ManageAccounts',
    url: urls.manageAccounts,
  },
];

export function AccountSelection({
  currentSelectedAccount,
  onSelectAccount,
  size = 'lg',
  isPopup = false,
}: {
  currentSelectedAccount?: LocalAccount;
  onSelectAccount?: (selectedAccount: LocalAccount) => void;
  size?: 'md' | 'lg';
  isPopup?: boolean;
}) {
  const history = useHistory();
  const { t } = useTranslation();

  const { localAccounts } = useAccountStorage();

  const onSelect = ({
    detail: { value },
  }: IonSelectCustomEvent<SelectChangeEventDetail>) => {
    if (ACCOUNT_OPERATION_OPTIONS.map((option) => option.url).includes(value)) {
      history.push(akashicPayPath(value));
      return;
    }

    const accountSelectedByUser = localAccounts.find(
      (account) => account.identity === value
    );

    // When new account is selected trigger callback
    if (accountSelectedByUser && value !== currentSelectedAccount?.identity) {
      onSelectAccount && onSelectAccount(accountSelectedByUser);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <IonSelect
        className="account-selections-options"
        style={{
          flexGrow: 1,
          padding: '0px 8px 0px 16px',
          height: size === 'lg' ? 40 : 32,
          minHeight: size === 'lg' ? 40 : 32,
          minWidth: '0',
        }}
        value={currentSelectedAccount?.identity ?? localAccounts?.[0]?.identity}
        onIonChange={onSelect}
        interface="popover"
        interfaceOptions={{
          className: 'account-selection',
          side: 'bottom',
          size: 'cover',
        }}
      >
        {[
          ...localAccounts.map((account) => (
            <IonSelectOption key={account.identity} value={account.identity}>
              {`${
                account.aasName ?? account?.accountName ?? `Wallet`
              } - ${displayLongText(account.identity, 20)}`}
            </IonSelectOption>
          )),
          ...(isPopup ? [] : ACCOUNT_OPERATION_OPTIONS).map((option, i) => (
            <IonSelectOption
              className={i === 0 || i === 2 ? 'option-divider-top' : ''}
              key={option.tKey}
              value={option.url}
            >
              {t(option.tKey)}
            </IonSelectOption>
          )),
        ]}
      </IonSelect>
    </div>
  );
}
