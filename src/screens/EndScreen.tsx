import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { CATEGORIES } from '../data/categories';
import { colors, fonts, radii, spacing } from '../theme';
import { PosterButton } from '../components/PosterButton';
import { MarqueeDots } from '../components/MarqueeFrame';
import { useResponsive } from '../hooks/useResponsive';

type Props = NativeStackScreenProps<RootStackParamList, 'End'>;

export default function EndScreen({ route, navigation }: Props) {
  const { categoryId, customWords, score, totalShown, correctWords } =
    route.params;
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const deckName = customWords ? 'Your own words' : (category?.name ?? 'Words');
  const { scale, maxWidth } = useResponsive();
  const sz = (n: number) => Math.round(n * scale);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MarqueeDots dotCount={9} />
        <Text style={[styles.title, { fontSize: sz(34) }]}>Time's up!</Text>
        <Text style={[styles.score, { fontSize: sz(64) }]}>
          {score} / {totalShown}
        </Text>
        <Text style={[styles.subtitle, { fontSize: sz(13) }]}>
          {deckName} guessed correctly
        </Text>
        <MarqueeDots dotCount={9} />
      </View>

      <View style={[styles.listWrap, { maxWidth, width: '100%', alignSelf: 'center' }]}>
        <Text style={styles.listLabel}>
          {correctWords.length > 0 ? 'Correct words' : 'No correct words yet — try again!'}
        </Text>
        <FlatList
          data={correctWords}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.wordRow}>
              <Text style={styles.wordCheck}>✓</Text>
              <Text style={styles.wordText}>{item}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <View style={[styles.actions, { maxWidth, width: '100%', alignSelf: 'center' }]}>
        <PosterButton
          label="Play again"
          scale={scale}
          onPress={() =>
            navigation.replace('Game', { categoryId, customWords })
          }
          style={styles.button}
        />
        <PosterButton
          label={customWords ? 'New words' : 'Change category'}
          variant="outline"
          scale={scale}
          onPress={() =>
            navigation.reset({
              index: 1,
              routes: [
                { name: 'Home' },
                customWords
                  ? { name: 'CustomWords' }
                  : { name: 'Category', params: { categoryId } },
              ],
            })
          }
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.gold,
    letterSpacing: 1,
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 64,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  listWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  listLabel: {
    fontFamily: fonts.subheading,
    fontSize: 14,
    color: colors.cream,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  wordCheck: {
    color: colors.correctBright,
    fontFamily: fonts.heading,
  },
  wordText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.cream,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});
