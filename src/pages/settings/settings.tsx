import { IonIcon, IonRadioGroup } from '@ionic/react';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import { AboutUsCaret } from '../../components/settings/about-us';
import {
  PageHeader,
  SettingsWrapper,
} from '../../components/settings/base-components';
import { DownArrow } from '../../components/settings/down-arrow';
import type { SettingItemProps } from '../../components/settings/setting-item';
import { SettingItem } from '../../components/settings/setting-item';
import { SettingsRadio } from '../../components/settings/setting-radio';
import { urls } from '../../constants/urls';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  selectAutoLockTime,
  selectTheme,
  setAutoLockTime,
} from '../../redux/slices/preferenceSlice';
import { akashicPayPath } from '../../routing/navigation-tabs';
import { themeType } from '../../theme/const';
import { useCurrentAppInfo } from '../../utils/hooks/useCurrentAppInfo';
import { getImageIconUrl } from '../../utils/url-utils';

const autoLockTimeMap: AutoLockProp[] = [
  {
    label: '10 minutes',
    value: 10,
  },
  {
    label: '30 minutes',
    value: 30,
  },
  {
    label: '1 hour',
    value: 60,
  },
  {
    label: '2 hours',
    value: 60 * 2,
  },
  {
    label: '4 hours',
    value: 60 * 4,
  },
  {
    label: '8 hours',
    value: 60 * 8,
  },
];

const AutoLockTextCaret = ({ autoLockTime }: { autoLockTime: string }) => {
  return (
    <>
      <h5
        className="ion-no-margin ion-text-size-xs"
        style={{ marginRight: '8px' }}
      >
        {autoLockTime}
      </h5>
      <DownArrow />
    </>
  );
};
type AutoLockProp = {
  label: string;
  value: number;
};
const AutoLockAccordion = ({
  autoLock,
  setAutoLock,
}: {
  autoLock: AutoLockProp;
  setAutoLock: Dispatch<SetStateAction<AutoLockProp>>;
}) => {
  const dispatch = useAppDispatch();
  return (
    <IonRadioGroup value={autoLock.value} style={{ padding: '0px 8px' }}>
      {autoLockTimeMap.map((item, i) => {
        return (
          <>
            <SettingsRadio
              key={i}
              labelPlacement="end"
              justify="start"
              value={item.value}
              onClick={() => {
                setAutoLock(item);
                dispatch(setAutoLockTime(item.value));
              }}
              width={'33.33%'}
              mode="md"
            >
              <h5 className="ion-no-margin">{item.label}</h5>
            </SettingsRadio>
          </>
        );
      })}
    </IonRadioGroup>
  );
};

export function Settings() {
  const history = useHistory();
  const { t } = useTranslation();
  const autoLockTime = useAppSelector(selectAutoLockTime);
  const info = useCurrentAppInfo();
  const [autoLock, setAutoLock] = useState<AutoLockProp>(
    autoLockTimeMap.find((e) => {
      if (e.value == autoLockTime) {
        return e;
      }
    }) || autoLockTimeMap[0]
  );
  const storedTheme = useAppSelector(selectTheme);

  const menuItems: SettingItemProps[] = [
    {
      header: t('General'),
      iconUrl: getImageIconUrl('settings.svg'),
      onClick: () => {
        history.push(akashicPayPath(urls.settingsGeneral));
      },
    },
    {
      header: t('Security'),
      iconUrl: getImageIconUrl('security.svg'),
      onClick: () => {
        history.push(akashicPayPath(urls.settingsSecurity));
      },
    },
    {
      header: t('AutoLock'),
      iconUrl: getImageIconUrl('lock-light.svg'),
      endComponent: <AutoLockTextCaret autoLockTime={autoLock.label} />,
      isAccordion: true,
      children: (
        <AutoLockAccordion autoLock={autoLock} setAutoLock={setAutoLock} />
      ),
    },
    {
      header: t('AboutUs'),
      iconUrl: getImageIconUrl('people.svg'),
      onClick: () => {
        history.push(akashicPayPath(urls.settingsAboutUs));
      },
      endComponent: <AboutUsCaret appVersion={info.version ?? '0.0.0'} />,
    },
    {
      header: t('Support'),
      iconUrl: getImageIconUrl('support_agent.svg'),
      endComponent: (
        <IonIcon
          style={{ marginLeft: '8px' }}
          className="ion-no-margin"
          size="45px"
          src={getImageIconUrl(
            storedTheme === themeType.DARK
              ? 'speech-bubbles-dark.svg'
              : 'speech-bubbles.svg'
          )}
        />
      ),
    },
  ];
  return (
    <DashboardLayout showSwitchAccountBar>
      <SettingsWrapper>
        <PageHeader>{t('Settings')}</PageHeader>
        <div
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {menuItems.map((menuItem, index) => {
            return (
              <SettingItem
                key={index}
                iconUrl={menuItem.iconUrl}
                backgroundColor={'var(--ion-background)'}
                header={menuItem.header}
                onClick={menuItem.onClick}
                endComponent={menuItem.endComponent}
                isAccordion={menuItem.isAccordion}
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
