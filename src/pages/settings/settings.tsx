import { IonIcon } from '@ionic/react';
import { exitOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import { AboutUsCaret } from '../../components/settings/about-us';
import {
  AutoLockAccordion,
  AutoLockTextCaret,
} from '../../components/settings/autolock-accordion';
import {
  PageHeader,
  SettingsWrapper,
} from '../../components/settings/base-components';
import type { SettingItemProps } from '../../components/settings/setting-item';
import { SettingItem } from '../../components/settings/setting-item';
import { ADDRESS_BOOK_ENABLED } from '../../constants/feature-flags';
import { SUPPORT_MAIL, urls } from '../../constants/urls';
import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import { akashicPayPath } from '../../routing/navigation-tabs';
import { themeType } from '../../theme/const';
import { useLogout } from '../../utils/hooks/useLogout';
import { getImageIconUrl } from '../../utils/url-utils';

export function Settings() {
  const logout = useLogout();
  const history = useHistory();
  const { t } = useTranslation();

  const storedTheme = useAppSelector(selectTheme);

  const menuItems: SettingItemProps[] = [
    {
      header: t('General'),
      icon: getImageIconUrl('settings.svg'),
      onClick: () => {
        history.push(akashicPayPath(urls.settingsGeneral));
      },
    },
    ...(ADDRESS_BOOK_ENABLED
      ? [
          {
            header: t('AddressBook'),
            icon: getImageIconUrl('library_books.svg'),
            onClick: () => {
              history.push(akashicPayPath(urls.addressBook));
            },
          },
        ]
      : []),
    {
      header: t('Security'),
      icon: getImageIconUrl('security.svg'),
      onClick: () => {
        history.push(akashicPayPath(urls.settingsSecurity));
      },
    },
    {
      header: t('Chain.Title'),
      icon: getImageIconUrl('network.svg'),
      onClick: () => {
        history.push(akashicPayPath(urls.settingsNetwork));
      },
    },
    {
      header: t('AutoLock'),
      icon: getImageIconUrl('lock-light.svg'),
      EndComponent: AutoLockTextCaret,
      isAccordion: true,
      children: <AutoLockAccordion />,
    },
    {
      header: t('AboutUs'),
      icon: getImageIconUrl('people.svg'),
      onClick: () => {
        history.push(akashicPayPath(urls.settingsAboutUs));
      },
      EndComponent: AboutUsCaret,
    },
    {
      header: t('Support'),
      link: SUPPORT_MAIL,
      icon: getImageIconUrl('support_agent.svg'),
      EndComponent: () => (
        <IonIcon
          className="ion-no-margin ion-margin-left-xs"
          size={'large'}
          src={getImageIconUrl(
            storedTheme === themeType.DARK
              ? 'speech-bubbles-dark.svg'
              : 'speech-bubbles.svg'
          )}
        />
      ),
    },
    {
      header: t('LockAkashicWallet'),
      onClick: async () => {
        logout({ isManualLogout: true });
      },
      EndComponent: () => (
        <IonIcon
          icon={exitOutline}
          color="var(--ion-color-primary-shade)"
          className="ion-no-margin ion-margin-left-xs"
        />
      ),
    },
  ];
  return (
    <DashboardLayout>
      <SettingsWrapper>
        <PageHeader>{t('Settings')}</PageHeader>
        <div
          className={
            'ion-display-flex ion-flex-direction-column w-100 ion-gap-sm'
          }
        >
          {menuItems.map((menuItem) => {
            return (
              <SettingItem
                key={menuItem.header}
                icon={menuItem.icon}
                backgroundColor={'var(--ion-background)'}
                header={menuItem.header}
                onClick={menuItem.onClick}
                EndComponent={menuItem.EndComponent}
                isAccordion={menuItem.isAccordion}
                link={menuItem.link}
              >
                {menuItem.children}
              </SettingItem>
            );
          })}
        </div>
      </SettingsWrapper>
    </DashboardLayout>
  );
}
