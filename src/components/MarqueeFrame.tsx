import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  dotCount?: number;
};

/**
 * A row of small gold "marquee light" dots, used to frame headers and cards
 * with a bit of old-cinema-signage flavor.
 */
export function MarqueeDots({ style, dotCount = 12 }: { style?: ViewStyle; dotCount?: number }) {
  return (
    <View style={[styles.dotRow, style]}>
      {Array.from({ length: dotCount }).map((_, i) => (
        <View key={i} style={styles.dot} />
      ))}
    </View>
  );
}

export function MarqueeFrame({ children, style }: Props) {
  return (
    <View style={[styles.frame, style]}>
      <MarqueeDots />
      {children}
      <MarqueeDots />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    shadowColor: colors.goldBright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },
});
