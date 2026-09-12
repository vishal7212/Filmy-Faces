import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@filmy_faces_seen_words_v1';

type SeenMap = Record<string, string[]>;

async function readAll(): Promise<SeenMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as SeenMap;
  } catch {
    // Unreadable or corrupt storage just means everything is unseen again.
    return {};
  }
}

/**
 * Words already served for this category, filtered against the words that
 * currently exist. Dropping unknown entries means editing a category's word
 * list can't strand a cycle that never completes.
 */
export async function loadSeenWords(
  categoryId: string,
  validWords: readonly string[]
): Promise<string[]> {
  const all = await readAll();
  const stored = all[categoryId];
  if (!Array.isArray(stored)) return [];

  const valid = new Set(validWords);
  return stored.filter(
    (word): word is string => typeof word === 'string' && valid.has(word)
  );
}

export async function saveSeenWords(
  categoryId: string,
  seen: readonly string[]
): Promise<void> {
  try {
    const all = await readAll();
    all[categoryId] = [...seen];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Remembering progress is a nicety; failing to must never break a round.
  }
}

export async function clearSeenWords(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Same here — a failed reset is not worth surfacing mid-game.
  }
}
