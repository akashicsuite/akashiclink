import styled from '@emotion/styled';
import { IonCol, IonRow } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../../components/common/buttons';
import { SuccessfulIconWithTitle } from '../../components/common/state-icon-with-title/successful-icon-with-title';
import { ContactSupportText } from '../../components/common/text/contact-support-text';
import { MainGrid } from '../../components/layout/main-grid';
import { PublicLayout } from '../../components/page-layout/public-layout';
import { useAppDispatch } from '../../redux/app/hooks';
import { onClear } from '../../redux/slices/importWalletSlice';
import { historyResetStackAndRedirect } from '../../routing/history';
import { useFetchAndRemapAASToAddress } from '../../utils/hooks/useFetchAndRemapAASToAddress';
import { useOwner } from '../../utils/hooks/useOwner';

export const StyledSpan = styled.span({
  fontSize: '12px',
  fontWeight: '700',
  color: 'var(--ion-color-primary-10)',
  marginTop: '4px',
  lineHeight: '16px',
});
export const ImportWalletSuccessful = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { mutateOwner, owner } = useOwner();
  const fetchAndRemapAASToAddress = useFetchAndRemapAASToAddress();

  const handleOnConfirm = async () => {
    dispatch(onClear());
    await mutateOwner();
    if (owner?.ownerIdentity) {
      await fetchAndRemapAASToAddress(owner.ownerIdentity);
    }
    // migration flow is finished, completely reset router history
    historyResetStackAndRedirect();
  };

  return (
    <PublicLayout className="vertical-center">
      <MainGrid>
        <IonRow className={'ion-grid-row-gap-md ion-center'}>
          <IonCol size={'12'} className={'ion-center'}>
            <SuccessfulIconWithTitle title={t('ImportSuccessful')} />
          </IonCol>
          <IonCol size={'6'}>
            <PrimaryButton expand="block" onClick={handleOnConfirm}>
              {t('Confirm')}
            </PrimaryButton>
            {/** TODO: Re-enable with different flow at later stage */}
            {/* <Divider/>>
            <StyledSpan>{t('YouHaveOptionTo')}</StyledSpan>
            <WhiteButton
              onClick={() => {
                history.push(akashicPayPath(urls.changePasswordAfterImport));
              }}
            >
              {t('ChangePassword')}
            </WhiteButton> */}
          </IonCol>
        </IonRow>
        <ContactSupportText />
      </MainGrid>
    </PublicLayout>
  );
};
