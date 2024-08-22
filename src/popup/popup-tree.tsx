import { Spinner } from '../components/common/loader/spinner';
import { ETH_METHOD } from '../utils/chrome';
import { useOwner } from '../utils/hooks/useOwner';
import { PopupUnlockOrCreateAndImportWallet } from './popup-unlock-create-import-wallet';
import { SignTypedData } from './sign-typed-data';
import { WalletConnection } from './wallet-connection';

export function PopupTree() {
  const query = new URLSearchParams(window.location.search);
  const method = query.get('method');

  // TODO: update with new unlock mechanism
  const { isLoading, authenticated } = useOwner();

  if (isLoading) {
    return <Spinner />;
  }

  if (!authenticated) {
    return <PopupUnlockOrCreateAndImportWallet />;
  }

  if (method === ETH_METHOD.REQUEST_ACCOUNTS) {
    return <WalletConnection />;
  }

  // TODO: possible different layout for typed data
  if (method === ETH_METHOD.SIGN_TYPED_DATA) {
    return <SignTypedData />;
  }

  // TODO: handle invalid request
  return null;
}
