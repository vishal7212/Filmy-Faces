import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import type { TimerDuration } from '../context/SettingsContext';
import { useSettings } from '../context/SettingsContext';
import { colors, fonts, radii, spacing } from '../theme';
import { MarqueeDots } from '../components/MarqueeFrame';
import { useResponsive } from '../hooks/useResponsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const DURATIONS: TimerDuration[] = [30, 60, 90];

export default function SettingsScreen({ navigation }: Props) {
  const { timerDuration, setTimerDuration, shuffleWords, setShuffleWords } =
    useSettings();
  const { scale, maxWidth } = useResponsive();
  const sz = (n: number) => Math.round(n * scale);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={12}
        style={styles.backButton}
      >
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <View style={styles.header}>
        <MarqueeDots dotCount={9} />
        <Text style={[styles.title, { fontSize: sz(36) }]}>Settings</Text>
        <MarqueeDots dotCount={9} />
      </View>

      <View style={[styles.section, { maxWidth, alignSelf: 'center', width: '100%' }]}>
        <Text style={[styles.sectionLabel, { fontSize: sz(15) }]}>
          Timer duration
        </Text>
        <View style={styles.durationRow}>
          {DURATIONS.map((duration) => {
            const selected = duration === timerDuration;
            return (
              <Pressable
                key={duration}
                onPress={() => setTimerDuration(duration)}
                style={[
                  styles.durationPill,
                  selected && styles.durationPillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.durationText,
                    selected && styles.durationTextSelected,
                  ]}
                >
                  {duration}s
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.section, { maxWidth, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={[styles.sectionLabel, { fontSize: sz(15) }]}>
              Shuffle words
            </Text>
            <Text style={styles.toggleHint}>
              Randomize word order within each category
            </Text>
          </View>
          <Switch
            value={shuffleWords}
            onValueChange={setShuffleWords}
            trackColor={{ false: colors.maroonDeep, true: colors.gold }}
            thumbColor={colors.cream}
          />
        </View>
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
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.gold,
    letterSpacing: 1,
  },
  section: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.subheading,
    fontSize: 15,
    color: colors.cream,
    marginBottom: spacing.sm,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  durationPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.maroonDeep,
    alignItems: 'center',
  },
  durationPillSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.goldBright,
  },
  durationText: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.muted,
  },
  durationTextSelected: {
    color: colors.background,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: spacing.md,
  },
  toggleHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
});
