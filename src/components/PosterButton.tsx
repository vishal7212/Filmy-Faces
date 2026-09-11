import React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, fonts, radii, spacing } from '../theme';

type Variant = 'gold' | 'outline' | 'correct' | 'pass';

type Props = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: Variant;
  style?: ViewStyle;
  disabled?: boolean;
};

export function PosterButton({
  label,
  onPress,
  variant = 'gold',
  style,
  disabled,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'outline' ? styles.labelOutline : styles.labelSolid,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: fonts.heading,
    fontSize: 17,
    letterSpacing: 0.5,
  },
  labelSolid: {
    color: colors.background,
  },
  labelOutline: {
    color: colors.gold,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  gold: {
    backgroundColor: colors.gold,
    borderColor: colors.goldBright,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.gold,
  },
  correct: {
    backgroundColor: colors.correctBright,
    borderColor: colors.correct,
  },
  pass: {
    backgroundColor: colors.passBright,
    borderColor: colors.pass,
  },
};
