import { Preferences } from '@capacitor/preferences';
import styled from '@emotion/styled';
import { IonPage } from '@ionic/react';
import { type ReactNode, useEffect } from 'react';

import { LAST_HISTORY_ENTRIES } from '../../constants';
import { history } from '../../routing/history';
import { Footer } from '../layout/footer';
import { PublicHeader } from '../layout/public-header';
import { VersionUpdateAlert } from '../layout/version-update-alert';

const StyledLayout = styled.div({
  ['& > .content']: {
    padding: '0 24px',
    overflow: 'scroll',
  },
  ['& > .footer']: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});

export function PublicLayout({
  className,
  children,
  contentStyle,
}: {
  className?: string;
  children: ReactNode;
  contentStyle?: React.CSSProperties;
}) {
  useEffect(() => {
    const updateLastLocation = async () => {
      await Preferences.set({
        key: LAST_HISTORY_ENTRIES,
        value: JSON.stringify(history.entries),
      });
    };

    updateLastLocation();
  }, [history.entries]);

  return (
    <IonPage>
      <StyledLayout className="vertical public-layout">
        {/* Keep header within layout for space when virtual keyboard comes up */}
        <PublicHeader />
        <div className={`content ${className ?? ''}`} style={contentStyle}>
          {children}
        </div>
        {process.env.REACT_APP_SKIP_UPDATE_CHECK !== 'true' && (
          <VersionUpdateAlert />
        )}
      </StyledLayout>
      <Footer />
    </IonPage>
  );
}
