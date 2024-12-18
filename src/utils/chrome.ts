export const EXTENSION_EVENT = {
  USER_CLOSED_POPUP: 'USER_CLOSED_POPUP',
  POPUP_READY: 'POPUP_READY',
  USER_LOCKED_WALLET: 'USER_LOCKED_WALLET',
  WALLET_AUTO_LOCKED: 'WALLET_AUTO_LOCKED',
};

export const EXTENSION_ERROR = {
  UNKNOWN: 'UNKNOWN',
  RECEIVING_END_DOES_NOT_EXIST:
    'Could not establish connection. Receiving end does not exist.', // chrome error string
  WC_SESSION_NOT_FOUND: 'WC_SESSION_NOT_FOUND',
  REQUEST_EXPIRED: 'REQUEST_EXPIRED',
  COULD_NOT_READ_ADDRESS: 'COULD_NOT_READ_ADDRESS',
};

export const ETH_METHOD = {
  PERSONAL_SIGN: 'personal_sign',
  REQUEST_ACCOUNTS: 'eth_requestAccounts',
  SIGN_TYPED_DATA: 'eth_signTypedData_v4',
};

export const WALLET_METHOD = {
  UNLOCK_WALLET: 'UNLOCK_WALLET',
  LOCK_WALLET: 'LOCK_WALLET',
};

export const TYPED_DATA_PRIMARY_TYPE = {
  AUTHORIZE_ACTION: 'AuthorizeAction',
  PAYOUT: 'Payout',
  GENERATE_SECONDARY_OTK: 'generateSecondaryOtk',
};

export const closePopup = async () => {
  const current = await window?.chrome?.windows?.getCurrent();
  current.id && (await window?.chrome?.windows?.remove(current.id));
};

export const closeAllPopup = async () => {
  try {
    const context = await chrome?.runtime?.getContexts({
      // @ts-ignore
      contextTypes: ['TAB'],
    });

    // @ts-ignore
    context?.forEach((ctx) => {
      chrome.windows.remove(ctx.windowId);
    });
  } catch (e) {
    console.warn(e);
  }
};

export const responseToSite = async (response: unknown) => {
  try {
    // Message is forwarded via serviceWorker
    await chrome?.runtime?.sendMessage(chrome?.runtime?.id, response);
  } catch (e) {
    console.warn(e);
  }
};
