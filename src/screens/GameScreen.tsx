import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { CATEGORIES } from '../data/categories';
import { colors, fonts, radii, spacing } from '../theme';
import { PosterButton } from '../components/PosterButton';
import { useSettings } from '../context/SettingsContext';
import { useTiltControl } from '../hooks/useTiltControl';
import { useMotionPermission } from '../hooks/useMotionPermission';
import { shuffleArray } from '../utils/shuffle';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;
type Action = 'correct' | 'pass';

const SWIPE_THRESHOLD = 80;

export default function GameScreen({ route, navigation }: Props) {
  const { categoryId } = route.params;
  const category = useMemo(
    () => CATEGORIES.find((c) => c.id === categoryId),
    [categoryId]
  );
  const { timerDuration, shuffleWords } = useSettings();
  const { status: motionStatus } = useMotionPermission();

  const queueRef = useRef<string[]>([]);
  const lastWordRef = useRef<string | null>(null);
  const isAnimatingRef = useRef(false);
  const isRoundOverRef = useRef(false);

  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [shownCount, setShownCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(timerDuration);
  const [isRoundOver, setIsRoundOver] = useState(false);

  const wordOpacity = useRef(new Animated.Value(1)).current;
  const wordTranslate = useRef(new Animated.Value(0)).current;
  const flashColor = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  const refillQueue = useCallback(() => {
    const source = category?.words ?? [];
    let next = shuffleWords ? shuffleArray(source) : [...source];
    if (
      next.length > 1 &&
      lastWordRef.current != null &&
      next[0] === lastWordRef.current
    ) {
      [next[0], next[1]] = [next[1], next[0]];
    }
    queueRef.current = next;
  }, [category, shuffleWords]);

  const drawNextWord = useCallback((): string | null => {
    if (queueRef.current.length === 0) refillQueue();
    const word = queueRef.current.shift() ?? null;
    lastWordRef.current = word;
    return word;
  }, [refillQueue]);

  // Initial deck + first word.
  useEffect(() => {
    refillQueue();
    setCurrentWord(drawNextWord());
    // Only run once on mount; category/shuffle changes mid-round shouldn't reset the deck.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishRound = useCallback(
    (finalScore: number, finalShown: number, finalCorrect: string[]) => {
      if (isRoundOverRef.current) return;
      isRoundOverRef.current = true;
      setIsRoundOver(true);
      navigation.replace('End', {
        categoryId,
        score: finalScore,
        totalShown: finalShown,
        correctWords: finalCorrect,
      });
    },
    [navigation, categoryId]
  );

  // Countdown timer.
  useEffect(() => {
    if (isRoundOver) return;
    if (timeLeft <= 0) {
      finishRound(score, shownCount, correctWords);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, isRoundOver, finishRound, score, shownCount, correctWords]);

  const handleAction = useCallback(
    (action: Action) => {
      if (isAnimatingRef.current || isRoundOverRef.current || !currentWord) {
        return;
      }
      isAnimatingRef.current = true;

      Haptics.impactAsync(
        action === 'correct'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      ).catch(() => {});

      const resolvedWord = currentWord;
      const nextScore = action === 'correct' ? score + 1 : score;
      const nextShown = shownCount + 1;
      const nextCorrect =
        action === 'correct' ? [...correctWords, resolvedWord] : correctWords;

      setScore(nextScore);
      setShownCount(nextShown);
      setCorrectWords(nextCorrect);

      flashColor.setValue(action === 'correct' ? 1 : -1);
      const exitDirection = action === 'correct' ? 1 : -1;

      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(wordTranslate, {
          toValue: exitDirection * 60,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start(() => {
        const next = drawNextWord();
        wordTranslate.setValue(-exitDirection * 40);
        dragY.setValue(0);
        setCurrentWord(next);

        Animated.parallel([
          Animated.timing(wordOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(wordTranslate, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(flashColor, {
            toValue: 0,
            duration: 260,
            useNativeDriver: false,
          }),
        ]).start(() => {
          isAnimatingRef.current = false;
        });

        if (!next) {
          finishRound(nextScore, nextShown, nextCorrect);
        }
      });
    },
    [
      currentWord,
      score,
      shownCount,
      correctWords,
      wordOpacity,
      wordTranslate,
      flashColor,
      dragY,
      drawNextWord,
      finishRound,
    ]
  );

  const tiltEnabled = motionStatus === 'granted' && !isRoundOver;
  useTiltControl({
    enabled: tiltEnabled,
    onCorrect: () => handleAction('correct'),
    onPass: () => handleAction('pass'),
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 12 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        dragY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > SWIPE_THRESHOLD) {
          handleAction('correct');
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          handleAction('pass');
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 6,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const backgroundColor = flashColor.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [colors.pass, colors.background, colors.correct],
  });

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.timerText}>Category not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Text style={styles.categoryLabel}>{category.name}</Text>
          <View style={styles.timerPill}>
            <Text style={styles.timerText}>{timeLeft}s</Text>
          </View>
          <Text style={styles.scoreLabel}>Score {score}</Text>
        </View>

        <View style={styles.wordArea} {...panResponder.panHandlers}>
          <Animated.View
            style={{
              opacity: wordOpacity,
              transform: [
                { translateY: Animated.add(wordTranslate, dragY) },
              ],
            }}
          >
            <Text
              style={styles.word}
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.4}
            >
              {currentWord ?? ''}
            </Text>
          </Animated.View>
          <Text style={styles.hint}>
            {tiltEnabled
              ? 'Tilt down = correct · Tilt up = pass'
              : 'Swipe down = correct · Swipe up = pass'}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <PosterButton
            label="Pass"
            variant="pass"
            onPress={() => handleAction('pass')}
            style={styles.actionButton}
          />
          <PosterButton
            label="Correct"
            variant="correct"
            onPress={() => handleAction('correct')}
            style={styles.actionButton}
          />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  categoryLabel: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.muted,
  },
  scoreLabel: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'right',
  },
  timerPill: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  timerText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.gold,
  },
  wordArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  word: {
    fontFamily: fonts.display,
    fontSize: 72,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 1,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
