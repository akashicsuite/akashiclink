import './settings-popover.scss';

import { LANGUAGE_LIST } from '@helium-pay/common-i18n/src/locales/supported-languages';
import { IonIcon, IonItem, IonLabel, IonList, IonPopover } from '@ionic/react';
import { caretBackOutline } from 'ionicons/icons';
import type {
  Dispatch,
  MouseEventHandler,
  ReactNode,
  SetStateAction,
} from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { urls } from '../../../constants/urls';
import { useAppSelector } from '../../../redux/app/hooks';
import { selectTheme } from '../../../redux/slices/preferenceSlice';
import { akashicPayPath } from '../../../routing/navigation-tabs';
import { themeType } from '../../../theme/const';
import { useLogout } from '../../../utils/hooks/useLogout';
import { useSetGlobalLanguage } from '../../../utils/hooks/useSetGlobalLanguage';
import { SquareWhiteButton } from '../../common/buttons';

/** Styling the display text */
function SettingsText({ text, id }: { text: string; id?: string }) {
  return (
    <IonLabel class="ion-text-right settings-text" id={id}>
      {text}
    </IonLabel>
  );
}

/** Container for grouping related settings */
function SettingsList(props: { children: ReactNode; isSubmenu?: boolean }) {
  return (
    <IonList
      class="settings-list"
      lines="none"
      style={{
        // Style margin depending on depth of setting
        marginRight: props.isSubmenu ? '0' : '1px',
      }}
    >
      {props.children}
    </IonList>
  );
}

function SettingsItem({
  routerLink,
  displayText,
  disabled,
  onClick,
  id,
  setShowPopover,
}: {
  routerLink?: string;
  displayText: string;
  disabled?: boolean;
  onClick?: MouseEventHandler;
  id?: string;
  setShowPopover: Dispatch<
    SetStateAction<{ open: boolean; event: Event | undefined }>
  >;
}) {
  return (
    <IonItem
      className="settings-item ion-no-padding"
      button={true}
      detail={false}
      routerLink={routerLink}
      disabled={disabled}
      onClick={(e) => {
        if (onClick) onClick(e);
        setShowPopover({ open: false, event: e.nativeEvent });
      }}
    >
      <SettingsText text={displayText} id={id} />
    </IonItem>
  );
}

function SettingSubmenu({
  displayText,
  id,
  children,
}: {
  children: ReactNode;
  displayText: string;
  id: string;
}) {
  return (
    <>
      <IonItem className="settings-item" button={true} detail={false} id={id}>
        <IonIcon className="settings-icon" icon={caretBackOutline} />
        <SettingsText text={displayText} />
      </IonItem>
      <IonPopover
        className="settings-submenu"
        dismissOnSelect={true}
        side="left"
        alignment="start"
        size="cover"
        trigger={id}
      >
        {children}
      </IonPopover>
    </>
  );
}

/**
 * Popover exposing settings that user can toggle
 */
export function SettingsPopover() {
  const { t } = useTranslation();
  const storedTheme = useAppSelector(selectTheme);
  const logout = useLogout();

  /** Grouping of the settings in the popover menu
   * @param displayText
   * @param unique id to handle clicks and visibility
   */

  const [buttonBackground, setButtonBackground] = useState(false);

  const handleButtonClick = () => {
    setButtonBackground(!buttonBackground);
  };
  const [showPopover, setShowPopover] = useState<{
    open: boolean;
    event: Event | undefined;
  }>({
    open: false,
    event: undefined,
  });

  const [_, setGlobalLanguage] = useSetGlobalLanguage();

  return (
    <>
      <SquareWhiteButton
        className="icon-button"
        onClick={(e) => {
          handleButtonClick();
          setShowPopover({ open: true, event: e.nativeEvent });
        }}
        forceStyle={
          buttonBackground ? { background: '#EDDCFF', transition: 'none' } : {}
        }
      >
        <IonIcon
          slot="icon-only"
          className="icon-button-icons"
          src={`/shared-assets/images/${
            storedTheme === themeType.DARK && !buttonBackground
              ? 'setting-icon-white.svg'
              : 'setting-icon-purple.svg'
          }`}
        />
      </SquareWhiteButton>
      <IonPopover
        className="settings-main"
        backdrop-dismiss={true}
        isOpen={showPopover.open}
        event={showPopover.event}
        onDidDismiss={() => {
          setButtonBackground(false);
          setShowPopover({ open: false, event: undefined });
        }}
        side="bottom"
        alignment="end"
      >
        <SettingsList>
          <SettingSubmenu displayText={t('General')} id="general-menu">
            <SettingsList isSubmenu={true}>
              <IonItem
                style={{
                  '--background': 'var(--ion-color-secondary)',
                }}
              >
                <SettingsText text={t('Languages')} />
              </IonItem>
              {LANGUAGE_LIST.map((l) => (
                <SettingsItem
                  key={l.locale}
                  displayText={l.title}
                  id={l.locale}
                  onClick={(_) => setGlobalLanguage(l.locale)}
                  setShowPopover={setShowPopover}
                />
              ))}
            </SettingsList>
          </SettingSubmenu>
          <SettingSubmenu displayText={t('Security')} id="settings-security">
            <SettingsList isSubmenu={true}>
              <SettingsItem
                displayText={t('KeyPairBackup')}
                routerLink={akashicPayPath(urls.settingsBackup)}
                setShowPopover={setShowPopover}
              />
              <SettingsItem
                displayText={t('ChangePassword')}
                routerLink={akashicPayPath(urls.changePassword)}
                setShowPopover={setShowPopover}
              />
            </SettingsList>
          </SettingSubmenu>

          <SettingSubmenu
            displayText={t('Information')}
            id="settings-information"
          >
            <SettingsList isSubmenu={true}>
              <SettingsItem
                displayText={t('AboutUs')}
                routerLink={akashicPayPath(urls.settingsVersion)}
                setShowPopover={setShowPopover}
              />
            </SettingsList>
          </SettingSubmenu>

          <SettingsItem
            displayText={t('Lock')}
            setShowPopover={setShowPopover}
            onClick={logout}
          />
        </SettingsList>
      </IonPopover>
    </>
  );
}
