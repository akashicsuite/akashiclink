import './settings.scss';

import { Browser } from '@capacitor/browser';
import styled from '@emotion/styled';
import { IonButton, IonIcon, IonModal } from '@ionic/react';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LINK_TYPE, useI18nInfoUrls } from '../../i18n/links';
import { useCurrentAppInfo } from '../../utils/hooks/useCurrentAppInfo';
import { useLocalStorage } from '../../utils/hooks/useLocalStorage';
import { getImageIconUrl } from '../../utils/url-utils';
import { PrimaryButton, WhiteButton } from '../common/buttons';
import { ForwardArrow } from './forward-arrow';
import type { SettingItemProps } from './setting-item';
import { SettingItem } from './setting-item';

function UpdateModal({
  modal,
  isOpen,
  setIsOpen,
}: {
  modal: RefObject<HTMLIonModalElement>;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const info = useCurrentAppInfo();
  const [availableVersion] = useLocalStorage('available-app-version', '0.0.0');
  const [updateUrl] = useLocalStorage('update-url', '');
  const [highlights] = useLocalStorage('highlights', ['']);
  const { t } = useTranslation();
  const [isMoreInfo, setIsMoreInfo] = useState(false);
  return (
    <IonModal
      id="update-modal"
      ref={modal}
      isOpen={isOpen}
      onIonModalDidDismiss={() => {
        setIsOpen(false);
      }}
    >
      <div className="update-modal-wrapper">
        <IonIcon
          src={getImageIconUrl('akashic-link-logo.svg')}
          style={{
            height: '56px',
            width: '100%',
            position: 'relative',
            margin: '0 auto',
          }}
        />
        <h4 className="ion-padding-bottom-0">{t('UpdatesAvailable')}</h4>
        <h3
          className="ion-text-size-xxs ion-no-margin"
          style={{ color: '#B0A9B3' }}
        >
          {`${info?.name} v${availableVersion}`}
        </h3>
        {isMoreInfo && (
          <>
            <h4>
              {t('WhatsNewIn', {
                version: availableVersion,
              })}
            </h4>
            <ul>
              {highlights.map((highlight) => {
                return (
                  <li className="ion-text-size-xs" key={highlight}>
                    {highlight}
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <IonButton
          mode="ios"
          fill="clear"
          className="ion-text-size-xxs p-0 m-0 more-info-btn no-ripple"
          onClick={() => {
            setIsMoreInfo(!isMoreInfo);
          }}
        >
          {!isMoreInfo ? t('MoreInfo') : t('LessInfo')}
        </IonButton>
        <PrimaryButton
          className="ion-margin-top-lg"
          style={{ width: '100%' }}
          onClick={async () => {
            setIsOpen(false);
            await Browser.open({
              url: updateUrl,
            });
          }}
        >
          {t('UpdateNow')}
        </PrimaryButton>
      </div>
    </IonModal>
  );
}

export function AboutUsCaret({ appVersion }: { appVersion: string }) {
  return (
    <>
      <h5 className="ion-no-margin ion-text-size-xs ion-margin-right-xs">
        {appVersion}
      </h5>
      <ForwardArrow />
    </>
  );
}
const StyledWhiteButton = styled(WhiteButton)<{ backgroundColor?: string }>`
  ::part(native) {
    padding: 8px 20px;
    background-color: ${(props) => props.backgroundColor || ''};
  }
`;
export function AboutUs({
  backgroundColor,
  isLoggedIn = true,
}: {
  backgroundColor?: string;
  isLoggedIn?: boolean;
}) {
  const { t } = useTranslation();
  const info = useCurrentAppInfo();
  const [availableAppVersion] = useLocalStorage(
    'available-app-version',
    '0.0.0'
  );
  const updateModalRef = useRef<HTMLIonModalElement>(null);
  const [updateModal, setUpdateModal] = useState(false);
  const [updateType] = useLocalStorage('update-type', '');

  const infoUrls = useI18nInfoUrls();

  const aboutUsMenu: SettingItemProps[] = [
    {
      header: t('PrivacyPolicy'),
      onClick: async () => {
        await Browser.open({
          url: infoUrls[LINK_TYPE.PrivacyPolicy],
        });
      },
      endComponent: <ForwardArrow />,
    },
    {
      header: t('TermsOfUse'),
      onClick: async () => {
        await Browser.open({
          url: infoUrls[LINK_TYPE.TermsOfUse],
        });
      },
      endComponent: <ForwardArrow />,
      isDivider: true,
    },
    {
      header: t('VisitOurWebsite'),
      onClick: async () => {
        await Browser.open({
          url: infoUrls[LINK_TYPE.InfoSite],
        });
      },
      endComponent: <ForwardArrow />,
    },
  ];

  return (
    <>
      <UpdateModal
        modal={updateModalRef}
        isOpen={updateModal}
        setIsOpen={setUpdateModal}
      />
      <IonIcon
        src={getImageIconUrl('akashic-link-logo.svg')}
        style={{
          height: '56px',
          width: '100%',
          position: 'relative',
          margin: '0 auto',
        }}
      ></IonIcon>
      <h5 className={!isLoggedIn ? 'ion-margin-bottom-lg' : 'ion-no-margin'}>
        {`${info?.name} v${info?.version}`}
      </h5>
      <div
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {updateType === 'soft' && (
          <SettingItem
            key={1}
            header={t('UpdatesAvailable')}
            ripple={false}
            endComponent={
              <StyledWhiteButton
                backgroundColor={backgroundColor}
                onClick={() => {
                  setUpdateModal(true);
                }}
              >
                {t('UpdateNow')}
              </StyledWhiteButton>
            }
            isAccordion={false}
            isDivider={true}
            backgroundColor={backgroundColor}
            subHeading={`${info?.name} v${availableAppVersion}`}
          />
        )}
        {aboutUsMenu.map((abm, index) => {
          return (
            <SettingItem
              /* eslint-disable-next-line sonarjs/no-array-index-key */
              key={index}
              icon={abm.icon}
              header={abm.header}
              onClick={abm.onClick}
              endComponent={abm.endComponent}
              isAccordion={abm.isAccordion}
              isDivider={abm.isDivider}
              backgroundColor={'var(--ion-background)'}
            >
              {abm.children}
            </SettingItem>
          );
        })}
      </div>
    </>
  );
}
