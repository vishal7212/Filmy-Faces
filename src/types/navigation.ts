export type RootStackParamList = {
  Home: undefined;
  Category: { categoryId: string };
  MotionPermission: { categoryId: string };
  Game: { categoryId: string };
  End: {
    categoryId: string;
    score: number;
    totalShown: number;
    correctWords: string[];
  };
  Settings: undefined;
};
