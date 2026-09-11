import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { colors, fonts, spacing } from '../theme';
import { PosterButton } from '../components/PosterButton';
import { MarqueeDots } from '../components/MarqueeFrame';
import { useMotionPermission } from '../hooks/useMotionPermission';

type Props = NativeStackScreenProps<RootStackParamList, 'MotionPermission'>;

export default function MotionPermissionScreen({ route, navigation }: Props) {
  const { categoryId } = route.params;
  const { status, checked, request } = useMotionPermission();

  const goToGame = useCallback(() => {
    navigation.replace('Game', { categoryId });
  }, [navigation, categoryId]);

  useEffect(() => {
    if (checked && status === 'granted') {
      goToGame();
    }
  }, [checked, status, goToGame]);

  const handleEnable = async () => {
    const result = await request();
    if (result === 'granted') {
      goToGame();
    }
  };

  if (!checked) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.body}>Checking your device…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🤳</Text>
        <MarqueeDots />
        <Text style={styles.title}>Tilt to play</Text>
        <Text style={styles.body}>
          Filmy Faces uses your phone's motion sensor so you can tilt the
          phone down for correct and up to pass, hands-free, while it's
          held to your forehead.
        </Text>
        <Text style={styles.body}>
          {status === 'unavailable'
            ? "This device doesn't report motion data, so tilt controls aren't available here. No problem — you can still play with the on-screen buttons."
            : "We'll ask for permission to read motion data. It never leaves your device."}
        </Text>

        {status === 'denied' && (
          <Text style={styles.warning}>
            Motion permission was denied. You can still play using the
            on-screen Correct / Pass buttons, or enable motion access for
            this app in your device Settings.
          </Text>
        )}

        <View style={styles.actions}>
          {status !== 'unavailable' && status !== 'granted' && (
            <PosterButton
              label="Enable tilt controls"
              onPress={handleEnable}
              style={styles.button}
            />
          )}
          <PosterButton
            label="Use on-screen buttons instead"
            onPress={goToGame}
            variant="outline"
            style={styles.button}
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.gold,
    letterSpacing: 1,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.cream,
    textAlign: 'center',
    lineHeight: 22,
  },
  warning: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.passBright,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  actions: {
    marginTop: spacing.lg,
    width: '100%',
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});
