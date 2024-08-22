import { useEffect } from 'react';
import { useIdleTimer } from 'react-idle-timer';

import { useAppSelector } from '../../redux/app/hooks';
import { selectAutoLockTime } from '../../redux/slices/preferenceSlice';
import { useLocalStorage } from './useLocalStorage';
import { useLogout } from './useLogout';

const AUTOLOCKBY_STORAGE_KEY = 'autoLockBy';

export function useIdleTime() {
  const autoLockTime = useAppSelector(selectAutoLockTime);
  const [autoLockBy, setAutoLockBy] = useLocalStorage(
    AUTOLOCKBY_STORAGE_KEY,
    0
  );
  const logout = useLogout();
  const { reset } = useIdleTimer({
    timeout: autoLockTime * 60000,
    onIdle: logout,
    onAction: async () => {
      const newVal = Date.now() + autoLockTime * 60 * 1000;
      await setAutoLockBy(newVal);
      // Also saving this to chrome extension for direct access
      await chrome?.storage?.local?.set({ [AUTOLOCKBY_STORAGE_KEY]: newVal });
    },
  });
  useEffect(() => {
    // on soft close autoLockBy is initially 0 and after the Preference is resolved it get its actual value, hence the condition autoLock === 0
    if (autoLockBy === 0) return;
    if (autoLockBy > Date.now()) {
      reset();
    } else {
      logout();
    }
  }, [autoLockTime, autoLockBy]);
}
