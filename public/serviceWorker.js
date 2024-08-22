let webPort;
let lastPopupId;

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

// ---- Upon receive single message within extension
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // forward message to AP
  if (sender.id === chrome.runtime.id) {
    webPort.postMessage(request);
  }
});

// ---- Upon receive single message outside extension
// chrome.runtime.onMessageExternal.addListener(function (
//   request,
//   sender,
//   sendResponse
// ) {
// });

// ---- Upon receive external connection request
chrome.runtime.onConnectExternal.addListener(function (port) {
  webPort = port;

  port.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type !== 'webPageRequest') {
      //TODO: handle other types
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

    // Do not create a new window but focus on the existing one if there is one
    try {
      await chrome.windows.update(lastPopupId, {
        focused: true,
      });

    } catch (e) {

      const newWindow = await chrome.windows.create({
        focused: true,
        height: 720,
        width: 360,
        type: 'popup',
        url: `chrome-extension://${
          chrome.runtime.id
        }/index.html?${query.toString()}`,
      });

      lastPopupId = newWindow.id;
    }

  });
});

// ---- Handle Auto lock event
const ALARM_NAME = "autoLockAlarm"
const AUTOLOCKBY_KEY = "autoLockBy"

const informSiteAutoLock = async (alarm) => {
  const { autoLockBy } = await chrome.storage.local.get(AUTOLOCKBY_KEY);
  if (webPort && Date.now() >= autoLockBy) {
    webPort.postMessage({
      event: 'WALLET_AUTO_LOCKED'
    });
  }
}

const checkAlarmState = async (alarm) => {
  const { autoLockBy } = await chrome.storage.local.get(AUTOLOCKBY_KEY);

  if (autoLockBy) {
    const alarm = await chrome.alarms.get(ALARM_NAME);
    if (alarm) {
      await chrome.alarms.clear(ALARM_NAME);
    }
    await chrome.alarms.create(ALARM_NAME, { when: autoLockBy });
  }

  chrome.alarms.onAlarm.addListener(informSiteAutoLock);
}

checkAlarmState();

chrome.storage.onChanged.addListener(checkAlarmState)