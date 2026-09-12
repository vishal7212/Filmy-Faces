import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { CUSTOM_CATEGORY_ID } from '../types/navigation';
import { colors, fonts, radii, spacing } from '../theme';
import { PosterButton } from '../components/PosterButton';
import { MarqueeDots } from '../components/MarqueeFrame';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomWords'>;

// Long enough for "Kabhi Khushi Kabhie Gham", short enough to stay readable
// at arm's length and to keep one entry from swallowing the layout.
const MAX_WORD_LENGTH = 60;
const MAX_WORDS = 50;

export default function CustomWordsScreen({ navigation }: Props) {
  const [draft, setDraft] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const existing = useMemo(
    () => new Set(words.map((word) => word.toLowerCase())),
    [words]
  );

  const addWord = () => {
    const cleaned = draft.trim().replace(/\s+/g, ' ').slice(0, MAX_WORD_LENGTH);

    if (!cleaned) return;
    if (words.length >= MAX_WORDS) {
      setNotice(`That's the limit — ${MAX_WORDS} words is plenty for a round.`);
      return;
    }
    if (existing.has(cleaned.toLowerCase())) {
      setNotice(`"${cleaned}" is already on the list.`);
      return;
    }

    setWords((prev) => [...prev, cleaned]);
    setDraft('');
    setNotice(null);
    inputRef.current?.focus();
  };

  const removeWord = (index: number) => {
    setWords((prev) => prev.filter((_, i) => i !== index));
    setNotice(null);
  };

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
        <Text style={styles.title}>Your own words</Text>
        <MarqueeDots dotCount={9} />
        <Text style={styles.blurb}>
          Hand the phone to the other team — they type the words, you don't
          peek. Nothing shows on screen until the round starts.
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={(text) => {
            setDraft(text);
            if (notice) setNotice(null);
          }}
          onSubmitEditing={addWord}
          placeholder="Type a word or phrase"
          placeholderTextColor={colors.muted}
          style={styles.input}
          maxLength={MAX_WORD_LENGTH}
          returnKeyType="done"
          autoCapitalize="words"
          autoCorrect={false}
        />
        <Pressable
          onPress={addWord}
          disabled={!draft.trim()}
          style={({ pressed }) => [
            styles.addButton,
            !draft.trim() && styles.addButtonDisabled,
            pressed && styles.addButtonPressed,
          ]}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {notice && <Text style={styles.notice}>{notice}</Text>}

      <View style={styles.listWrap}>
        <Text style={styles.listLabel}>
          {words.length === 0
            ? 'No words yet'
            : `${words.length} word${words.length === 1 ? '' : 's'} ready`}
        </Text>
        <FlatList
          data={words}
          keyExtractor={(item, index) => `${item}-${index}`}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => (
            <View style={styles.wordRow}>
              <Text style={styles.wordText} numberOfLines={2}>
                {item}
              </Text>
              <Pressable onPress={() => removeWord(index)} hitSlop={10}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <View style={styles.actions}>
        <PosterButton
          label={words.length === 0 ? 'Add a word to start' : 'Start round'}
          disabled={words.length === 0}
          onPress={() =>
            navigation.navigate('MotionPermission', {
              categoryId: CUSTOM_CATEGORY_ID,
              customWords: words,
            })
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
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.gold,
    letterSpacing: 1,
  },
  blurb: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.cream,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  input: {
    flex: 1,
    // Without this the field refuses to shrink below its intrinsic width and
    // shoves the Add button off the right edge on narrow screens.
    minWidth: 0,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.cream,
  },
  addButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  addButtonText: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.background,
  },
  notice: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.passBright,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  listWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  listLabel: {
    fontFamily: fonts.subheading,
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  wordText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.cream,
  },
  removeText: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.passBright,
  },
  actions: {
    padding: spacing.lg,
  },
  startButton: {
    width: '100%',
  },
});
