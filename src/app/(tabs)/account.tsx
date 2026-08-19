/**
 * S5 — Account. Governed by rules.md §0.0.
 *
 * ── What was here ─────────────────────────────────────────────────────────
 *
 * Five elevated `Card`s holding eighteen rows, every one carrying a 34px
 * gold-washed medallion behind its icon. Eighteen colour events on a screen the
 * system allows one on, and five shadowed boxes where the reference uses rules
 * and space. It is now one hairline list under quiet overlines — see
 * `components/ui/ListRow.tsx`, which was written first so the next settings
 * surface inherits it rather than re-deciding.
 *
 * ── Three things it was doing that were not true ──────────────────────────
 *
 * **1. Two rows had a chevron and no destination.** "Currency · PKR (Rs)" and
 * "Version · 1.0.0" were both `onPress={() => {}}`. A chevron is a promise;
 * these invited a tap and did nothing. They are inert rows now, and `ListRow`
 * makes that a declared state rather than an omission.
 *
 * **2. The avatar was a generic person glyph** — always, for everyone, even
 * though `user.avatarUrl` has been on the auth store the whole time. It now
 * shows the customer's actual photograph, which finally exists because signup
 * and profile can both set one.
 *
 * **3. The version was the string "1.0.0"**, typed here by hand. It is read
 * from the manifest now, with the build number beside it — a hard-coded version
 * is wrong the first time anybody ships without editing this file, and a wrong
 * version is worse than none when someone is reporting a bug.
 *
 * ── The identity block ────────────────────────────────────────────────────
 *
 * The "Signed in" badge is gone. It sat beside the customer's own name and
 * email, which is already the strongest possible evidence they are signed in;
 * a badge repeating it was a label on a label. Signed out, the block says so
 * and offers the one thing worth doing.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { type Href, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { AuthButton } from '@/components/auth';
import { ChipSelect, ListGroup, ListRow, Screen, ScreenHeader, Text } from '@/components/ui';
import { useProfile } from '@/features/account/account.queries';
import { WEB_BASE } from '@/features/guides/guides';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';
import { colors, haptics, layout, radius, spacing } from '@/theme';

const openWeb = (path: string) => {
  WebBrowser.openBrowserAsync(`${WEB_BASE}${path}`).catch(() => {});
};

/** From the manifest, not typed here. See the header. */
const VERSION = (() => {
  const v = Constants.expoConfig?.version ?? '—';
  const build =
    Constants.expoConfig?.android?.versionCode ?? Constants.expoConfig?.ios?.buildNumber;
  return build ? `${v} (${build})` : v;
})();

export default function Account() {
  const { t: tr, isUrdu } = useT();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const authed = status === 'authenticated';
  const profile = useProfile();

  const displayName = (profile.data?.fullName as string) ?? user?.name ?? null;
  const contact = authed
    ? ((profile.data?.email as string) ?? user?.email ?? user?.phoneNumber ?? null)
    : null;
  const photo = (profile.data?.profileImage as string) ?? user?.avatarUrl ?? null;

  const push = (href: Href) => router.push(href);
  const shareApp = () => {
    Share.share({
      message: "Wedding Wala — Pakistan's #1 shaadi platform. https://weddingwala.pk",
    }).catch(() => {});
  };

  return (
    <Screen scroll>
      <ScreenHeader title={tr('account.title')} urdu={isUrdu} />

      <View style={styles.body}>
        {/* Identity. Tapping it goes to the profile when there is one to edit —
            the whole block, not a 17px chevron at the end of a row. */}
        <Pressable
          accessibilityRole={authed ? 'button' : undefined}
          disabled={!authed}
          onPress={() => {
            haptics.light();
            push('/account/profile');
          }}
          style={({ pressed }) => [
            styles.identity,
            isUrdu ? { flexDirection: 'row-reverse' } : null,
            pressed ? { opacity: 0.6 } : null,
          ]}
        >
          <View style={styles.avatar}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatarImg} contentFit="cover" />
            ) : (
              <Ionicons name="person-outline" size={26} color={colors.textMuted} />
            )}
          </View>

          <View style={[styles.identityText, isUrdu ? { alignItems: 'flex-end' } : null]}>
            <Text variant="h3" urdu={isUrdu} numberOfLines={1}>
              {authed && displayName ? displayName : tr('account.guest')}
            </Text>
            <Text variant="caption" tone="muted" urdu={isUrdu} numberOfLines={2}>
              {contact ?? tr('account.signInPrompt')}
            </Text>
          </View>

          {authed ? (
            <Ionicons
              name={isUrdu ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color={colors.textFaint}
            />
          ) : null}
        </Pressable>

        {!authed ? (
          <AuthButton
            label={tr('common.signInRegister')}
            onPress={() => push('/auth/login')}
            urdu={isUrdu}
          />
        ) : null}

        <ListGroup title={tr('acct.activity')} urdu={isUrdu}>
          <ListRow
            icon="heart-outline"
            label={tr('common.savedVendors')}
            onPress={() => push('/favorites')}
            urdu={isUrdu}
          />
          <ListRow
            icon="git-compare-outline"
            label={tr('common.compareVendors')}
            onPress={() => push('/compare')}
            urdu={isUrdu}
          />
          {authed ? (
            <ListRow
              icon="calendar-outline"
              label={tr('account.myBookings')}
              onPress={() => push('/account/bookings')}
              urdu={isUrdu}
            />
          ) : null}
          <ListRow
            icon="search-outline"
            label={tr('common.exploreVendors')}
            onPress={() => push('/explore')}
            urdu={isUrdu}
            last
          />
        </ListGroup>

        <ListGroup title={tr('acct.planning')} urdu={isUrdu}>
          <ListRow icon="wallet-outline" label={tr('tool.budget')} onPress={() => push('/tools/budget')} urdu={isUrdu} />
          <ListRow icon="checkmark-done-outline" label={tr('tool.checklist')} onPress={() => push('/tools/checklist')} urdu={isUrdu} />
          <ListRow icon="people-outline" label={tr('tool.guests')} onPress={() => push('/tools/guests')} urdu={isUrdu} />
          <ListRow icon="time-outline" label={tr('tool.timeline')} onPress={() => push('/tools/timeline')} urdu={isUrdu} />
          <ListRow icon="book-outline" label={tr('home.weddingGuides')} onPress={() => push('/guides')} urdu={isUrdu} last />
        </ListGroup>

        <ListGroup title={tr('acct.preferences')} urdu={isUrdu}>
          {/* Language is a choice, not a destination, so it is made here rather
              than behind a chevron on a screen of its own. */}
          <View style={[styles.langRow, isUrdu ? { flexDirection: 'row-reverse' } : null]}>
            <Ionicons name="language-outline" size={20} color={colors.textMuted} style={styles.langIcon} />
            <Text variant="body" urdu={isUrdu} style={{ flex: 1, textAlign: isUrdu ? 'right' : 'left' }}>
              {tr('account.language')}
            </Text>
            <ChipSelect
              scroll={false}
              options={[
                { value: 'en', label: 'English' },
                { value: 'ur', label: 'اردو' },
              ]}
              value={locale}
              onChange={(v) => setLocale((v as 'en' | 'ur') ?? 'en')}
            />
          </View>
          <ListRow
            icon="notifications-outline"
            label={tr('acct.notifications')}
            onPress={() => push('/inbox')}
            urdu={isUrdu}
          />
          {/* Inert: PKR is the only currency the marketplace prices in. A
              chevron here promised a picker that does not and should not exist. */}
          <ListRow icon="cash-outline" label={tr('acct.currency')} value="PKR (Rs)" to="none" urdu={isUrdu} last />
        </ListGroup>

        <ListGroup title={tr('acct.support')} urdu={isUrdu}>
          <ListRow icon="help-buoy-outline" label={tr('acct.help')} onPress={() => push('/guides')} urdu={isUrdu} />
          <ListRow icon="chatbubble-ellipses-outline" label={tr('acct.contact')} to="external" onPress={() => openWeb('/contact')} urdu={isUrdu} />
          <ListRow icon="share-social-outline" label={tr('acct.share')} onPress={shareApp} urdu={isUrdu} />
          <ListRow icon="star-outline" label={tr('acct.rate')} to="external" onPress={() => openWeb('')} urdu={isUrdu} last />
        </ListGroup>

        <ListGroup title={tr('acct.about')} urdu={isUrdu}>
          <ListRow icon="sparkles-outline" label={tr('acct.aboutWW')} to="external" onPress={() => openWeb('/about')} urdu={isUrdu} />
          <ListRow icon="document-text-outline" label={tr('acct.terms')} to="external" onPress={() => openWeb('/terms')} urdu={isUrdu} />
          <ListRow icon="shield-checkmark-outline" label={tr('acct.privacy')} to="external" onPress={() => openWeb('/privacy')} urdu={isUrdu} />
          <ListRow icon="information-circle-outline" label={tr('acct.version')} value={VERSION} to="none" urdu={isUrdu} last />
        </ListGroup>

        {authed ? (
          <ListRow
            icon="log-out-outline"
            label={tr('common.signOut')}
            onPress={() => void signOut()}
            urdu={isUrdu}
            destructive
            last
          />
        ) : null}

        <Text variant="caption" tone="faint" align="center" urdu={isUrdu} style={styles.tagline}>
          {tr('account.tagline')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: layout.gutter,
    paddingBottom: layout.tabBarSpace,
    gap: spacing.huge,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.sunken,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  identityText: { flex: 1, gap: 3 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: 54,
    paddingVertical: spacing.md,
    borderBottomWidth: layout.hairline,
    borderBottomColor: colors.border,
  },
  langIcon: { width: 22, textAlign: 'center' },
  tagline: { marginTop: spacing.sm },
});
