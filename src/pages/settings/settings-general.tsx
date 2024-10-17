import { LANGUAGE_LIST } from '@helium-pay/common-i18n/src/locales/supported-languages';
import { IonRadioGroup } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import { Toggle } from '../../components/common/toggle/toggle';
import { ThemeSelect } from '../../components/layout/toolbar/theme-select';
import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import {
  PageHeader,
  SettingsWrapper,
} from '../../components/settings/base-components';
import { DownArrow } from '../../components/settings/down-arrow';
import { SettingItem } from '../../components/settings/setting-item';
import { SettingsRadio } from '../../components/settings/setting-radio';
import { useLocalStorage } from '../../utils/hooks/useLocalStorage';
import { useSetGlobalLanguage } from '../../utils/hooks/useSetGlobalLanguage';
import { getImageIconUrl } from '../../utils/url-utils';

function getLanguageTitle(locale: string) {
  const language = LANGUAGE_LIST.find((l) => l.locale === locale);
  return language?.title;
}
const LanguageRadio = ({
  selectedLanguage,
  setSelectedLanguage,
}: {
  selectedLanguage: string;
  setSelectedLanguage: (newValue: string) => Promise<void>;
}) => {
  return (
    <IonRadioGroup
      value={selectedLanguage}
      className="ion-padding-top-0 ion-padding-bottom-0 ion-padding-left-xs ion-padding-right-xs"
    >
      {LANGUAGE_LIST.map((item, i) => {
        return (
          <SettingsRadio
            key={i}
            labelPlacement="end"
            justify="start"
            value={item.locale}
            onClick={(_) => setSelectedLanguage(item.locale)}
            width={'100%'}
            mode="md"
          >
            <h5 className="ion-no-margin">{item.title}</h5>
          </SettingsRadio>
        );
      })}
    </IonRadioGroup>
  );
};

const LanguageTextCaret = ({
  selectedLanguage,
}: {
  selectedLanguage: string;
}) => {
  return (
    <>
      <h5 className="ion-no-margin ion-text-size-xs ion-margin-right-xs">
        {getLanguageTitle(selectedLanguage)}
      </h5>
      <DownArrow />
    </>
  );
};

export function SettingsGeneral() {
  const [hideSmallTransactions, setHideSmallTransactions] = useLocalStorage(
    'hide-small-balances',
    true
  );
  const { t } = useTranslation();
  const [globalLanguage, setGlobalLanguage] = useSetGlobalLanguage();

  const generalMenuItems = [
    {
      header: t('Languages'),
      iconUrl: getImageIconUrl('language.svg'),
      children: (
        <LanguageRadio
          selectedLanguage={globalLanguage}
          setSelectedLanguage={setGlobalLanguage}
        />
      ),
      endComponent: <LanguageTextCaret selectedLanguage={globalLanguage} />,
      isAccordion: true,
    },
    {
      header: t('Theme'),
      iconUrl: '/shared-assets/images/theme.svg',
      endComponent: <ThemeSelect />,
    },
    {
      header: t('HideSmallBalances'),
      iconUrl: getImageIconUrl('visibility-off.svg'),
      endComponent: (
        <div style={{ width: '60px' }}>
          <Toggle
            currentState={hideSmallTransactions ? 'active' : 'inActive'}
            onClickHandler={async () => {
              setHideSmallTransactions(!hideSmallTransactions);
            }}
          />
        </div>
      ),
    },
  ];
  return (
    <DashboardLayout showSwitchAccountBar>
      <SettingsWrapper>
        <PageHeader>{t('General')}</PageHeader>
        <div
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {generalMenuItems.map((gMenuItems, index) => {
            return (
              <SettingItem
                key={index}
                backgroundColor="var(--ion-background)"
                header={gMenuItems.header}
                iconUrl={gMenuItems.iconUrl}
                isAccordion={gMenuItems.isAccordion}
                endComponent={gMenuItems.endComponent}
              >
                {gMenuItems.children}
              </SettingItem>
            );
          })}
        </div>
      </SettingsWrapper>
    </DashboardLayout>
  );
}
