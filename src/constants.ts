export const LAST_HISTORY_ENTRIES = 'lastHistoryEntries';

// How often, in ms, nfts, balances, and transfers are automatically polled from backend
export const REFRESH_INTERVAL = 10 * 1000; // 10 seconds

// How often a user may press the refresh-button to manually refresh nfts, balances, and transfers.
// Prevents spamming the backend if user tries to keep pressing the button
export const REFRESH_BUTTON_DISABLED_TIME = 750; // 0.75 seconds

export const ONE_MINUTE_MS = 60 * 1000;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
