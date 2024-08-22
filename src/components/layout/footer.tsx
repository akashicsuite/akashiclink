import styled from '@emotion/styled';
import { IonFooter } from '@ionic/react';

import { useCurrentAppInfo } from '../../utils/hooks/useCurrentAppInfo';

const StyledIonFooter = styled(IonFooter)({
  margin: 'auto',
  paddingBottom: 'var(--ion-safe-area-bottom, 0)',
});

const VersionTag = styled.div({
  textAlign: 'center',
  fontFamily: 'Nunito Sans',
  fontSize: '8px',
  fontStyle: 'normal',
  fontWeight: '700',
  lineHeight: '16px',
  letterSpacing: '0.5px',
  borderRadius: '8px 8px 0px 0px',
  padding: '8px',
  color: 'var(--ion-text-color)',
  margin: 'auto',
});
export function Footer() {
  const info = useCurrentAppInfo();

  return (
    <StyledIonFooter className="ion-no-border">
      <VersionTag>{`(v${info?.version ?? '-'})`}</VersionTag>
    </StyledIonFooter>
  );
}
