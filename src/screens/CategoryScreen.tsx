import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { CATEGORIES } from '../data/categories';
import { colors, fonts, spacing } from '../theme';
import { PosterButton } from '../components/PosterButton';
import { MarqueeDots } from '../components/MarqueeFrame';
import { useSettings } from '../context/SettingsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Category'>;

export default function CategoryScreen({ route, navigation }: Props) {
  const { categoryId } = route.params;
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const { timerDuration } = useSettings();

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.body}>Category not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={12}
        style={styles.backButton}
      >
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.icon}>{category.icon}</Text>
        <MarqueeDots dotCount={9} />
        <Text style={styles.title}>{category.name}</Text>
        <Text style={styles.count}>{category.words.length} words</Text>
        <MarqueeDots dotCount={9} />

        <Text style={styles.instructions}>
          You get 5 seconds to put the phone on your forehead, screen facing
          out, so your friends can see the word. Tilt down for correct, tilt
          up to pass — or use the buttons on screen. The round lasts{' '}
          {timerDuration} seconds.
        </Text>

        <PosterButton
          label="Start"
          onPress={() =>
            navigation.navigate('MotionPermission', { categoryId })
          }
          style={styles.startButton}
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
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.gold,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 38,
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 1,
  },
  count: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  instructions: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.cream,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  body: {
    fontFamily: fonts.body,
    color: colors.cream,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  startButton: {
    width: '80%',
  },
});
