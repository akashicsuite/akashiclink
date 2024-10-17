import './settings.scss';

import styled from '@emotion/styled';
import { IonContent, IonIcon, IonItem, IonPopover } from '@ionic/react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { akashicPayPath } from '../../routing/navigation-tabs';
import { useLogout } from '../../utils/hooks/useLogout';
import { getImageIconUrl } from '../../utils/url-utils';
import { SettingsModal } from './setting-modal';

const SettingsDropDownItem = styled(IonItem)`
  --min-height: 32px;
  --inner-border-width: 0px;
  padding: 4px 0;
`;
export function SettingSelect({ loggedIn }: { loggedIn: boolean }) {
  const logout = useLogout();
  const settingPopoverRef = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const history = useHistory();
  const modal = useRef<HTMLIonModalElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <IonIcon
        className="ion-padding-top-xs ion-padding-bottom-xs ion-padding-left-xs ion-padding-right-xs"
        style={{
          height: '24px',
          width: '24px',
          cursor: 'pointer',
          marginRight: -8,
        }}
        src={
          loggedIn
            ? getImageIconUrl('setting-menu.svg')
            : getImageIconUrl('setting-menu-primary.svg')
        }
        onClick={(e) => {
          if (loggedIn && settingPopoverRef.current) {
            settingPopoverRef.current.event = e;
            setPopoverOpen(!popoverOpen);
          } else {
            setModalOpen(!modalOpen);
          }
        }}
      />
      <IonPopover ref={settingPopoverRef} isOpen={popoverOpen}>
        <IonContent
          className="ion-padding-left"
          style={{ backgroundColor: 'var(--ion-modal-background)' }}
        >
          <SettingsDropDownItem
            className="ion-no-margin"
            button
            onClick={() => {
              history.push(akashicPayPath('settings'));
              setPopoverOpen(false);
            }}
          >
            <div className="ion-align-items-center ion-display-flex ion-gap-xs">
              <IonIcon
                style={{ height: '16px', width: '16px' }}
                src={getImageIconUrl('setting-icon-primary.svg')}
              />
              <h3 className="ion-no-margin ion-text-size-sm">
                {t('Settings')}
              </h3>
            </div>
          </SettingsDropDownItem>
          <SettingsDropDownItem
            className="ion-no-margin"
            button
            onClick={logout}
            detail={false}
          >
            <div
              className="ion-align-items-center"
              style={{ display: 'flex', gap: '8px' }}
            >
              <IonIcon
                style={{ height: '16px', width: '16px' }}
                src={getImageIconUrl('lock.svg')}
              />
              <h3 className="ion-no-margin ion-text-size-sm ion-text-align-left">
                {t('LockAkashicWallet')}
              </h3>
            </div>
          </SettingsDropDownItem>
        </IonContent>
      </IonPopover>
      <SettingsModal
        modal={modal}
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
      />
    </>
  );
}
