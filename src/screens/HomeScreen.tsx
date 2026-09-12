import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { CATEGORIES } from '../data/categories';
import { colors, fonts, radii, spacing } from '../theme';
import { MarqueeDots } from '../components/MarqueeFrame';
import { useResponsive } from '../hooks/useResponsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { scale, columns, maxWidth } = useResponsive();
  const sz = (n: number) => Math.round(n * scale);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          hitSlop={12}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
        <MarqueeDots dotCount={9} />
        <Text style={[styles.title, { fontSize: sz(56) }]}>Filmy Faces</Text>
        <Text style={[styles.subtitle, { fontSize: sz(13) }]}>
          Bollywood, Tollywood & everything desi
        </Text>
        <MarqueeDots dotCount={9} />
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        key={`cols-${columns}`}
        numColumns={columns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.grid,
          { maxWidth, width: '100%', alignSelf: 'center' },
        ]}
        ListHeaderComponent={
          <Pressable
            style={({ pressed }) => [
              styles.customCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => navigation.navigate('CustomWords')}
          >
            <Text style={[styles.customIcon, { fontSize: sz(28) }]}>✍️</Text>
            <View style={styles.customTextWrap}>
              <Text
                style={[styles.cardTitle, styles.customText, { fontSize: sz(15) }]}
              >
                Your own words
              </Text>
              <Text
                style={[styles.cardCount, styles.customText, { fontSize: sz(12) }]}
              >
                The other team types them in
              </Text>
            </View>
          </Pressable>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { minHeight: sz(140) },
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              navigation.navigate('Category', { categoryId: item.id })
            }
          >
            <Text style={[styles.cardIcon, { fontSize: sz(32) }]}>
              {item.icon}
            </Text>
            <Text style={[styles.cardTitle, { fontSize: sz(15) }]}>
              {item.name}
            </Text>
            <Text style={[styles.cardCount, { fontSize: sz(12) }]}>
              {item.words.length} words
            </Text>
          </Pressable>
        )}
      />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  settingsButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 1,
    padding: spacing.xs,
  },
  settingsIcon: {
    fontSize: 24,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 56,
    color: colors.gold,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.muted,
    marginTop: -spacing.xs,
  },
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  row: {
    gap: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.maroon,
  },
  customCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.maroonDeep,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  customIcon: {
    fontSize: 28,
  },
  customTextWrap: {
    flex: 1,
  },
  customText: {
    textAlign: 'left',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.cream,
    textAlign: 'center',
  },
  cardCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
