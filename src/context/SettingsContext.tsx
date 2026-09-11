import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TimerDuration = 30 | 60 | 90;

type SettingsState = {
  timerDuration: TimerDuration;
  shuffleWords: boolean;
  isLoaded: boolean;
};

type SettingsContextValue = SettingsState & {
  setTimerDuration: (duration: TimerDuration) => void;
  setShuffleWords: (shuffle: boolean) => void;
};

const STORAGE_KEY = '@filmy_faces_settings';

const defaultState: SettingsState = {
  timerDuration: 60,
  shuffleWords: true,
  isLoaded: false,
};

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SettingsState>(defaultState);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setState((prev) => ({
            ...prev,
            timerDuration: parsed.timerDuration ?? prev.timerDuration,
            shuffleWords: parsed.shuffleWords ?? prev.shuffleWords,
            isLoaded: true,
          }));
        } else {
          setState((prev) => ({ ...prev, isLoaded: true }));
        }
      } catch {
        setState((prev) => ({ ...prev, isLoaded: true }));
      }
    })();
  }, []);

  const persist = (next: Partial<SettingsState>) => {
    setState((prev) => {
      const merged = { ...prev, ...next };
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          timerDuration: merged.timerDuration,
          shuffleWords: merged.shuffleWords,
        })
      ).catch(() => {});
      return merged;
    });
  };

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...state,
      setTimerDuration: (timerDuration) => persist({ timerDuration }),
      setShuffleWords: (shuffleWords) => persist({ shuffleWords }),
    }),
    [state]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
