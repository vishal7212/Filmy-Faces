import { shuffleArray } from './shuffle';

export type Deck = {
  words: string[];
  /** True when the last cycle was used up and this deck opens a fresh pass. */
  cycleReset: boolean;
};

/**
 * Builds the next run of words for a round.
 *
 * Words already served in the current cycle are held back, so a second round
 * of the same category deals what the players have not had yet rather than
 * reshuffling the whole list and handing back half of what they just saw. Once
 * every word has been served the cycle restarts and the full list is back in
 * play. (A plain shuffle per round is uniformly random but has no memory —
 * with 20 words and 12 shown a round, that repeats ~7 of the 12 second time
 * round, which is exactly what players notice.)
 */
export function buildDeck(
  allWords: readonly string[],
  seen: readonly string[],
  shownThisRound: readonly string[],
  lastWord: string | null,
  shuffle: boolean
): Deck {
  const order = (list: string[]) => (shuffle ? shuffleArray(list) : [...list]);

  const seenSet = new Set(seen);
  const unseen = allWords.filter((word) => !seenSet.has(word));

  let words: string[];
  let cycleReset = false;

  if (unseen.length > 0) {
    words = order(unseen);
  } else {
    cycleReset = true;
    // A fresh pass, but anything already shown in this round goes to the back
    // of the deck: seeing a word twice inside one round is far more jarring
    // than seeing it again next round.
    const recent = new Set(shownThisRound);
    words = [
      ...order(allWords.filter((word) => !recent.has(word))),
      ...order(allWords.filter((word) => recent.has(word))),
    ];
  }

  // Never open a deck with the word that just left the screen.
  if (words.length > 1 && lastWord != null && words[0] === lastWord) {
    [words[0], words[1]] = [words[1], words[0]];
  }

  return { words, cycleReset };
}
