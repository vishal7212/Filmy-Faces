/** Stands in for a category id when the round runs on player-typed words. */
export const CUSTOM_CATEGORY_ID = 'custom';

export type RootStackParamList = {
  Home: undefined;
  Category: { categoryId: string };
  CustomWords: undefined;
  Game: { categoryId: string; customWords?: string[] };
  End: {
    categoryId: string;
    customWords?: string[];
    score: number;
    totalShown: number;
    correctWords: string[];
  };
  Settings: undefined;
};
