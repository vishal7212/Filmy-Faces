import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { DeviceMotion } from 'expo-sensors';

const UPDATE_INTERVAL_MS = 100;
const SMOOTHING_WINDOW = 5;
const CORRECT_THRESHOLD_DEG = 30;
const PASS_THRESHOLD_DEG = -30;
const DEAD_ZONE_DEG = 15;
const DEBOUNCE_MS = 600;

type UseTiltControlOptions = {
  /** Only subscribes to the sensor while true (e.g. mid-round, permission granted). */
  enabled: boolean;
  onCorrect: () => void;
  onPass: () => void;
};

function radToDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

/**
 * Tilt-to-play control for the Game screen.
 *
 * Calibrates a neutral baseline from the first reading after (re)enabling,
 * so it works regardless of how the player is holding the phone against
 * their forehead. Smooths raw readings with a 5-sample moving average, then
 * requires the smoothed angle to clear +30deg (correct) or -30deg (pass)
 * relative to that baseline. -15deg..+15deg is a dead zone. After firing, the
 * phone must swing back through the dead zone AND 600ms must pass before the
 * next tilt can fire, so one big tilt motion can't double-fire.
 */
export function useTiltControl({
  enabled,
  onCorrect,
  onPass,
}: UseTiltControlOptions) {
  const readingsRef = useRef<number[]>([]);
  const baselineRef = useRef<number | null>(null);
  const lastFireRef = useRef<number>(0);
  const armedRef = useRef<boolean>(true);
  const onCorrectRef = useRef(onCorrect);
  const onPassRef = useRef(onPass);

  onCorrectRef.current = onCorrect;
  onPassRef.current = onPass;

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') {
      readingsRef.current = [];
      baselineRef.current = null;
      armedRef.current = true;
      return;
    }

    let isMounted = true;
    let subscription: { remove: () => void } | null = null;

    try {
      DeviceMotion.setUpdateInterval(UPDATE_INTERVAL_MS);
      subscription = DeviceMotion.addListener(handleMeasurement);
    } catch {
      // Sensor unavailable at runtime despite permission checks passing;
      // fail silently and let the on-screen buttons keep working.
      return;
    }

    function handleMeasurement(measurement: { rotation?: { beta?: number } }) {
      if (!isMounted) return;
      const beta = measurement.rotation?.beta;
      if (beta == null || Number.isNaN(beta)) return;

      const degrees = radToDeg(beta);

      if (baselineRef.current == null) {
        baselineRef.current = degrees;
      }

      const readings = readingsRef.current;
      readings.push(degrees);
      if (readings.length > SMOOTHING_WINDOW) readings.shift();
      const smoothed =
        readings.reduce((sum, value) => sum + value, 0) / readings.length;

      const relative = smoothed - (baselineRef.current ?? smoothed);
      const now = Date.now();

      if (Math.abs(relative) <= DEAD_ZONE_DEG) {
        armedRef.current = true;
        return;
      }

      if (!armedRef.current) return;
      if (now - lastFireRef.current < DEBOUNCE_MS) return;

      if (relative >= CORRECT_THRESHOLD_DEG) {
        armedRef.current = false;
        lastFireRef.current = now;
        onCorrectRef.current();
      } else if (relative <= PASS_THRESHOLD_DEG) {
        armedRef.current = false;
        lastFireRef.current = now;
        onPassRef.current();
      }
    }

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [enabled]);

  const recalibrate = useCallback(() => {
    baselineRef.current = null;
    readingsRef.current = [];
    armedRef.current = true;
  }, []);

  return { recalibrate };
}
