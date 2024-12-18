import { Preferences } from '@capacitor/preferences';
import { datadogRum } from '@datadog/browser-rum';
import { useEffect, useState } from 'react';

// TODO rewrite this to wrap https://github.com/capacitor-community/react-hooks?tab=readme-ov-file#storage-hooks
//  this API exposes async hook functions which is... not right.
//  I guess we need to preserve the datadog rum stuff though.

/**
 * Access localPreferences using the key. Also, expose a function to update and save value
 *
 * @param key The key of the localPreferences item
 * @param initialValue The default value returned when it is not saved before
 *
 * @returns {[value, setPreferenceAndStateValue, removePreference]}
 * The value of the requested item, and the helper function to update the item
 * and a direct read of the local Preferences value (useful when hook is used in multiple components)
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (newValue: T) => Promise<void>, () => Promise<void>] => {
  const [stateValue, setStateValue] = useState<T>();

  useEffect(() => {
    async function loadValue() {
      try {
        const result = await Preferences.get({ key });

        if (result.value == undefined && initialValue != undefined) {
          await setPreferenceAndStateValue(initialValue as T);
        } else if (result.value) {
          JSON.stringify(stateValue) !== result.value &&
            setStateValue(JSON.parse(result.value));
        } else {
          console.warn(key + ' preference value & initialValue not found');
        }
      } catch (e) {
        datadogRum.addError(e);
        return initialValue;
      }
    }
    loadValue();
  }, [initialValue, key]);

  const setPreferenceAndStateValue = async (value: T) => {
    try {
      setStateValue(value);
      await Preferences.set({
        key,
        value: JSON.stringify(value),
      });
    } catch (e) {
      datadogRum.addError(e);
      console.error(e);
    }
  };

  const removePreference = async () => {
    try {
      setStateValue(undefined);
      await Preferences.remove({
        key,
      });
    } catch (e) {
      datadogRum.addError(e);
      console.error(e);
    }
  };
  return [
    stateValue ?? initialValue,
    setPreferenceAndStateValue,
    removePreference,
  ];
};
