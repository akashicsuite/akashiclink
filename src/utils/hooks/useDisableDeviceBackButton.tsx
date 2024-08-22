import { useEffect } from 'react';

export const useDisableDeviceBackButton = () => {
  useEffect(() => {
    // TODO: type this properly
    // @ts-ignore
    const handleDeviceBackButton = (ev) => {
      // @ts-ignore
      ev.detail.register(10, () => {
        return;
      });
    };

    document.addEventListener('ionBackButton', handleDeviceBackButton);

    return () => {
      document.removeEventListener('ionBackButton', handleDeviceBackButton);
    };
  }, []);
};
