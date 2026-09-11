import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { DeviceMotion } from 'expo-sensors';

export type MotionPermissionStatus =
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'unavailable';

export function useMotionPermission() {
  const [status, setStatus] = useState<MotionPermissionStatus>('undetermined');
  const [checked, setChecked] = useState(false);

  const check = useCallback(async () => {
    // expo-sensors' web shim reports availability but doesn't implement
    // addListener, which throws. Tilt controls are a mobile-forehead-game
    // feature anyway, so treat web as unavailable and fall back to buttons.
    if (Platform.OS === 'web') {
      setStatus('unavailable');
      setChecked(true);
      return 'unavailable' as const;
    }
    try {
      const available = await DeviceMotion.isAvailableAsync();
      if (!available) {
        setStatus('unavailable');
        setChecked(true);
        return 'unavailable' as const;
      }
      const { status: permStatus } = await DeviceMotion.getPermissionsAsync();
      const next: MotionPermissionStatus =
        permStatus === 'granted'
          ? 'granted'
          : permStatus === 'denied'
            ? 'denied'
            : 'undetermined';
      setStatus(next);
      setChecked(true);
      return next;
    } catch {
      setStatus('unavailable');
      setChecked(true);
      return 'unavailable' as const;
    }
  }, []);

  const request = useCallback(async () => {
    try {
      const { status: permStatus } = await DeviceMotion.requestPermissionsAsync();
      const next: MotionPermissionStatus =
        permStatus === 'granted' ? 'granted' : 'denied';
      setStatus(next);
      return next;
    } catch {
      setStatus('denied');
      return 'denied' as const;
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { status, checked, check, request };
}
