import { CapacitorCookies } from '@capacitor/core';
import styled from '@emotion/styled';
import { IonAlert, IonIcon } from '@ionic/react';
import { checkmark, ellipse } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fetchNodesPing } from '../.. /../../utils/nitr0gen/nitr0gen.utils';
import { SquareWhiteButton } from '../../components/common/buttons';
import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import {
  PageHeader,
  SettingsWrapper,
} from '../../components/settings/base-components';
import { SettingItem } from '../../components/settings/setting-item';
import { useAppSelector } from '../../redux/app/hooks';
import { selectTheme } from '../../redux/slices/preferenceSlice';
import { themeType } from '../../theme/const';

type Node = {
  key: string;
  ping: number;
};

const PingStatus = styled.span`
  gap: 4px;
`;

export function SettingsNetwork() {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [unreachableNode, setUnreachableNode] = useState<Node | null>(null);
  const storedTheme = useAppSelector(selectTheme);
  const [preferredNodeKey, setPreferredNodeKey] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { 'preferred-node-key': savedNodeKey = '' } =
        await CapacitorCookies.getCookies();
      setPreferredNodeKey(savedNodeKey);
      const nodesList = await fetchNodesPing(false);
      setNodes(nodesList);
    })();
  }, []);

  useEffect(() => {
    if (nodes.length) {
      const minNode = nodes.reduce((min, node) =>
        node.ping < min.ping ? node : min
      );
      if (!preferredNodeKey) setPreferredNodeKey(minNode.key);
    }
  }, [nodes]);

  const loadNodes = async () => {
    const nodesList = await fetchNodesPing(true);
    setNodes(nodesList);
  };

  const updatePreferredNodeKey = async (key: string) => {
    await CapacitorCookies.setCookie({ key: 'preferred-node-key', value: key });
    setPreferredNodeKey(key);
  };

  const handleNodeSelect = (node: Node) => {
    if (node.ping === 0) {
      setUnreachableNode(node);
      setShowModal(true);
    } else {
      updatePreferredNodeKey(node.key);
    }
  };

  return (
    <DashboardLayout showSwitchAccountBar>
      <SettingsWrapper>
        <div className="ion-margin-top-xl" style={{ position: 'relative' }}>
          <SquareWhiteButton
            className="icon-button ion-padding-top-sm"
            id="refresh-button"
            onClick={loadNodes}
            style={{ position: 'absolute', top: 0, right: 4 }}
            borderRadius="8px"
          >
            <IonIcon
              slot="icon-only"
              className="icon-button-icons"
              src={`/shared-assets/images/${
                storedTheme === themeType.DARK
                  ? 'refresh-dark.svg'
                  : 'refresh-light.svg'
              }`}
            />
          </SquareWhiteButton>
          <PageHeader className="ion-margin-top-xs ion-text-align-center">
            {t('Chain.Title')}
          </PageHeader>
        </div>
        <span className="ion-text-color-primary-10 ion-text-align-center ion-margin-0 ion-text-size-xs">
          {t('SelectYourPreferredNode')}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {nodes.map((node, index) => (
            <SettingItem
              key={node.key}
              backgroundColor="var(--ion-background)"
              header={`${t('Node')}  ${++index} ${
                node.key === preferredNodeKey ? t('Preferred') : ''
              }`}
              onClick={() => handleNodeSelect(node)}
              endComponent={
                <PingStatus className="ion-text-size-xs">
                  <IonIcon
                    className="ion-text-size-xxs"
                    icon={ellipse}
                    style={{
                      color:
                        node.ping === 0
                          ? 'var(--ion-color-warning-text)'
                          : node.ping >= 200
                            ? '#F7931A'
                            : 'var(--ion-color-success)',
                    }}
                  />
                  <span style={{ color: 'var(--ion-color-secondary-text)' }}>
                    {node.ping === 0 ? t('Unreachable') : `${node.ping}ms`}
                  </span>
                </PingStatus>
              }
              isAccordion={false}
              icon={preferredNodeKey === node.key ? checkmark : ''}
              headerStyle={{
                color: 'var(--ion-color-secondary-text)',
                fontSize: '0.875rem',
              }}
              iconStyle={{ color: 'var(--ion-color-primary-10)' }}
            />
          ))}
        </div>
        <h5
          className="ion-text-size-xxs ion-margin-top-xs"
          style={{ color: 'var(--ion-color-warning-text)' }}
        >
          {t('PreferredNodeMsg')}
        </h5>
        <IonAlert
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          header={t('UnreachableNode')}
          message={t('SelectedPreferredNodeWarning')}
          buttons={[
            {
              text: t('Cancel'),
              role: 'cancel',
              handler: () => setShowModal(false),
            },
            {
              text: t('Proceed'),
              handler: () => updatePreferredNodeKey(unreachableNode?.key || ''),
            },
          ]}
        />
      </SettingsWrapper>
    </DashboardLayout>
  );
}
