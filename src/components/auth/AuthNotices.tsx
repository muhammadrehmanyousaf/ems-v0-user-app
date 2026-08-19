/**
 * The two small blocks both auth screens need. Governed by rules.md §0.0.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, fontFamily, radius, spacing } from '@/theme';

/**
 * A failed sign-in, as a surface rather than a sentence.
 *
 * The old screen printed the error as a bare red line between the last field
 * and the button — which is the one place on a form nobody reads, because the
 * eye is already travelling to the thing it is about to tap. Whatever the
 * server said ("wrong password", "account not activated") went unseen and the
 * customer tapped again, harder.
 *
 * `error.message` off the API layer is already customer-facing (see
 * `lib/api/errors.ts`), so it is printed as-is. Rewriting it here would mean
 * two places inventing copy for the same failure.
 */
export function AuthError({ message, urdu }: { message: string; urdu?: boolean }) {
  return (
    <View
      accessibilityRole="alert"
      style={[styles.error, urdu ? { flexDirection: 'row-reverse' } : null]}
    >
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text
        variant="caption"
        tone="danger"
        urdu={urdu}
        style={[styles.errorText, urdu ? { textAlign: 'right' } : null]}
      >
        {message}
      </Text>
    </View>
  );
}

/**
 * The legal line on signup.
 *
 * Deliberately NOT a sentence with links spliced into it. Interpolating
 * "Terms" and "Privacy Policy" into "By continuing you agree to our {a} and
 * {b}" only works in English word order — the Urdu translation puts the verb
 * last and the fragments end up in nonsense positions. A plain sentence plus a
 * separate row of links translates cleanly and stays tappable at 44px.
 *
 * Both open on the web, which is where the canonical documents live. The app
 * does not carry its own copies precisely so they cannot drift out of sync
 * with what the company is actually bound by.
 */
export function AuthLegal({
  note,
  terms,
  privacy,
  urdu,
}: {
  note: string;
  terms: string;
  privacy: string;
  urdu?: boolean;
}) {
  const open = (path: string) => {
    Linking.openURL(`https://www.weddingwala.pk/${path}`).catch(() => {});
  };

  return (
    <View style={styles.legal}>
      <Text variant="caption" tone="muted" urdu={urdu} align="center">
        {note}
      </Text>
      <View style={styles.legalRow}>
        <Pressable accessibilityRole="link" hitSlop={12} onPress={() => open('terms')}>
          <Text variant="caption" urdu={urdu} style={styles.legalLink}>
            {terms}
          </Text>
        </Pressable>
        <Text variant="caption" tone="faint">
          ·
        </Text>
        <Pressable accessibilityRole="link" hitSlop={12} onPress={() => open('privacy')}>
          <Text variant="caption" urdu={urdu} style={styles.legalLink}>
            {privacy}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.dangerBg,
  },
  errorText: { flex: 1 },
  legal: { alignItems: 'center', gap: 2 },
  legalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legalLink: {
    color: colors.goldDark,
    fontFamily: fontFamily.bodySemibold,
    textDecorationLine: 'underline',
  },
});
