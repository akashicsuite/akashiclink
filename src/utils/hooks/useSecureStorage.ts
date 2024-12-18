import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Capacitor } from '@capacitor/core';
import ReactSecureLocalStorage from 'react-secure-storage';

export const useSecureStorage = () => {
  const isWeb = Capacitor.getPlatform() === 'web';

  return {
    getItem: async (key: string) => {
      const value = ReactSecureLocalStorage.getItem(key) as string | null;
      // try to get from capacitor for backward compatible
      if (!value) {
        return await SecureStorage.getItem(key);
      }
      return value;
    },
    setItem: async (key: string, value: string) => {
      return isWeb
        ? ReactSecureLocalStorage.setItem(key, value)
        : await SecureStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
      try {
        await SecureStorage.removeItem(key); // remove any legacy existing item
        isWeb && ReactSecureLocalStorage.removeItem(key);
      } catch (e) {
        console.warn(e);
      }
    },
    clear: async () => {
      return isWeb
        ? ReactSecureLocalStorage.clear()
        : await SecureStorage.clear();
    },
  };
};
