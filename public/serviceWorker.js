let webPort;

const REQUEST_TYPE = {
  WEB_REQUEST: 'webPageRequest',
  CLOSE_POPUP: 'closePopup',
};

const WALLET_METHOD = {
  UNLOCK_WALLET: 'UNLOCK_WALLET',
  LOCK_WALLET: 'LOCK_WALLET',
};

const ETH_METHOD = {
  PERSONAL_SIGN: 'personal_sign',
  REQUEST_ACCOUNTS: 'eth_requestAccounts',
  SIGN_TYPED_DATA: 'eth_signTypedData_v4',
};

const SHARED_PARAMS = ['type', 'method', 'appName', 'appUrl'];
const ETH_REQUEST_ACCOUNTS_PARAMS = ['uri', 'submittedAt'];
const PERSONAL_SIGN_PARAMS = [];
const SIGN_TYPED_DATA_PARAMS = ['identity'];

//MUTATE query
const appendQuery = (query, request, list) => {
  list.forEach((param) => {
    query.append(param, request[param] ?? '');
  });
};

const closeAllPopup = async () => {
  try {
    const context = await chrome.runtime.getContexts({
      contextTypes: ['TAB'],
    });

    context.forEach((ctx) => {
      chrome.windows.remove(ctx.windowId);
    });
  } catch (e) {
    console.warn(e);
  }
};

// ---- Upon receive single message within extension
chrome.runtime.onMessage.addListener(function (request, sender, _sendResponse) {
  // forward message to AP
  if (webPort && sender.id === chrome.runtime.id) {
    webPort.postMessage(request);
  }
});

// ---- Upon receive single message outside extension
chrome.runtime.onMessageExternal.addListener(
  async function (request, _sender, _sendResponse) {
    if (
      request.type === REQUEST_TYPE.WEB_REQUEST &&
      request.method === WALLET_METHOD.LOCK_WALLET
    ) {
      const query = new URLSearchParams();
      appendQuery(query, request, SHARED_PARAMS);

      await chrome.windows.create({
        state: 'minimized',
        type: 'popup',
        url: `chrome-extension://${
          chrome.runtime.id
        }/index.html?${query.toString()}`,
      });
    }
  }
);

// ---- Upon receive external connection request
chrome.runtime.onConnectExternal.addListener(function (port) {
  webPort = port;

  port.onMessage.addListener(async (request, _sender, _sendResponse) => {
    if (request.type === REQUEST_TYPE.CLOSE_POPUP) {
      await closeAllPopup();
      return;
    }

    if (request.type !== REQUEST_TYPE.WEB_REQUEST) {
      port.postMessage({ received: request });
      return;
    }

    // Build the url for AW to determine which popup page to display
    const query = new URLSearchParams();
    appendQuery(query, request, SHARED_PARAMS);

    if (request.method === ETH_METHOD.REQUEST_ACCOUNTS) {
      appendQuery(query, request, ETH_REQUEST_ACCOUNTS_PARAMS);
    }
    if (request.method === ETH_METHOD.PERSONAL_SIGN) {
      appendQuery(query, request, PERSONAL_SIGN_PARAMS);
    }
    if (request.method === ETH_METHOD.SIGN_TYPED_DATA) {
      appendQuery(query, request, SIGN_TYPED_DATA_PARAMS);
    }

    const activeWindow = await chrome.runtime.getContexts({
      contextTypes: ['TAB'],
    });
    if (activeWindow.length > 0) {
      // TODO: how to use await chrome.tabs.update without trigger popup closed?
      // Do not create a new window but focus on the existing one if there is one
      await chrome.windows.update(activeWindow?.[0].windowId, {
        drawAttention: true,
      });
      return;
    }

    await chrome.windows.create({
      focused: true,
      height: 720,
      width: 360,
      type: 'popup',
      url: `chrome-extension://${
        chrome.runtime.id
      }/index.html?${query.toString()}`,
    });
  });

  port.onDisconnect.addListener(async (_request, _sender, _sendResponse) => {
    try {
      await closeAllPopup();
    } catch (e) {
      console.error(e);
    }
  });
});

// ---- Handle Auto lock event
const ALARM_NAME = 'autoLockAlarm';
const AUTOLOCKBY_KEY = 'autoLockBy';

const informSiteAutoLock = async (_alarm) => {
  const { autoLockBy } = await chrome.storage.session.get(AUTOLOCKBY_KEY);

  if (webPort && Date.now() >= autoLockBy) {
    webPort.postMessage({
      event: 'WALLET_AUTO_LOCKED',
    });
  }
};

const checkAlarmState = async (_alarm) => {
  const { autoLockBy } = await chrome.storage.session.get(AUTOLOCKBY_KEY);

  if (autoLockBy) {
    const alarm = await chrome.alarms.get(ALARM_NAME);
    if (alarm) {
      await chrome.alarms.clear(ALARM_NAME);
    }
    await chrome.alarms.create(ALARM_NAME, { when: autoLockBy });
  }

  chrome.alarms.onAlarm.addListener(informSiteAutoLock);
};

checkAlarmState();

chrome.storage.onChanged.addListener(checkAlarmState);
