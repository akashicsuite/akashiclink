import { ACEnvironment, getNodePings } from '@akashic/nitr0gen';
import styled from '@emotion/styled';
import { IonAlert, IonIcon } from '@ionic/react';
import { checkmark, ellipse } from 'ionicons/icons';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SquareWhiteButton } from '../../components/common/buttons';
import { DashboardLayout } from '../../components/page-layout/dashboard-layout';
import {
  PageHeader,
  SettingsWrapper,
} from '../../components/settings/base-components';
import { SettingItem } from '../../components/settings/setting-item';
import { PREFERRED_NODE_KEY } from '../../utils/cookies-keys';

type Node = {
  key: string;
  ping: number;
};

// Sentinel for the "Auto" selection — no persisted preferred node, nitr0gen
// resolves the fastest reachable node at operation time.
const AUTO = 'auto';

const env =
  process.env.REACT_APP_ENV === 'prod'
    ? ACEnvironment.MAINNET
    : process.env.REACT_APP_ENV === 'preprod'
      ? ACEnvironment.TESTNET
      : ACEnvironment.STAGING;

const PingStatus = styled.span`
  gap: 4px;
`;

export function SettingsNetwork() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [unreachableNode, setUnreachableNode] = useState<Node | null>(null);
  // Currently selected: a node key, or AUTO when nothing is persisted.
  const [selectedKey, setSelectedKey] = useState<string>(
    Cookies.get(PREFERRED_NODE_KEY) || AUTO
  );

  const loadNodes = async () => {
    const nodesList = await getNodePings(env, true);
    setNodes(nodesList);
    // Clear a stale preferred-node cookie that no longer maps to a node, so the
    // api singleton resolves Auto instead of an invalid preference.
    const preferred = Cookies.get(PREFERRED_NODE_KEY);
    if (preferred && !nodesList.some((node) => node.key === preferred)) {
      Cookies.remove(PREFERRED_NODE_KEY);
      setSelectedKey(AUTO);
    }
  };

  const updatePreferredNodeKey = (key: string) => {
    if (key === AUTO) {
      Cookies.remove(PREFERRED_NODE_KEY);
    } else {
      Cookies.set(PREFERRED_NODE_KEY, key);
    }
    setSelectedKey(key);
    // The api singleton resolves the preference live on the next operation — no
    // rebuild needed.
  };

  const handleNodeSelect = (node: Node) => {
    if (node.ping === 0) {
      setUnreachableNode(node);
      setShowModal(true);
    } else {
      updatePreferredNodeKey(node.key);
    }
  };

  useEffect(() => {
    loadNodes();
  }, []);

  return (
    <DashboardLayout>
      <SettingsWrapper>
        <div style={{ position: 'relative' }}>
          <SquareWhiteButton
            className="icon-button"
            id="refresh-button"
            onClick={loadNodes}
            style={{ position: 'absolute', bottom: 0, right: 0 }}
            borderRadius="8px"
          >
            <IonIcon
              slot="icon-only"
              className="icon-button"
              src={`/assets/images/refresh.svg`}
              style={{ width: '24px', height: '24px' }}
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
          {[{ key: AUTO }, ...nodes].map((item, index) => {
            // Auto is the first row (no ping); real nodes carry a ping.
            const node = 'ping' in item ? item : undefined;
            const selected = selectedKey === item.key;
            return (
              <SettingItem
                key={item.key}
                backgroundColor="var(--ion-background)"
                header={
                  node
                    ? `${t('Node')} ${index} ${selected ? t('Preferred') : ''}`
                    : t('Auto')
                }
                onClick={() =>
                  node ? handleNodeSelect(node) : updatePreferredNodeKey(AUTO)
                }
                EndComponent={
                  node
                    ? () => (
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
                          <span
                            style={{ color: 'var(--ion-color-secondary-text)' }}
                          >
                            {node.ping === 0
                              ? t('Unreachable')
                              : `${node.ping}ms`}
                          </span>
                        </PingStatus>
                      )
                    : undefined
                }
                isAccordion={false}
                icon={selected ? checkmark : ''}
                headerStyle={{
                  color: 'var(--ion-color-secondary-text)',
                  fontSize: '0.875rem',
                }}
                iconStyle={{ color: 'var(--ion-color-primary-10)' }}
              />
            );
          })}
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
