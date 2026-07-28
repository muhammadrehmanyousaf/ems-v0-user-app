import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { Badge, Button, Card, ChipSelect, Row, Screen, Stack, Text } from '@/components/ui';
import { useProfile } from '@/features/account/account.queries';
import { WEB_BASE } from '@/features/guides/guides';
import type { StringKey } from '@/i18n/strings';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';
import { goldScale, haptics, useTheme } from '@/theme';

function SettingsRow({
  icon,
  labelKey,
  value,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: StringKey;
  value?: string;
  onPress: () => void;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 13,
        paddingHorizontal: t.spacing.lg,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: t.colors.divider,
      }}
    >
      <View style={[styles.iconWell, { backgroundColor: goldScale.subtle }]}>
        <Ionicons name={icon} size={17} color={t.colors.goldDark} />
      </View>
      <T k={labelKey} variant="body" tone="body" style={{ flex: 1 }} />
      {value ? (
        <Text variant="caption" tone="muted">
          {value}
        </Text>
      ) : null}
      <Ionicons name="chevron-forward" size={17} color={t.colors.textLabel} />
    </Pressable>
  );
}

function Group({ titleKey, children }: { titleKey: StringKey; children: React.ReactNode }) {
  return (
    <Stack gap="sm">
      <T k={titleKey} variant="overline" tone="label" style={{ letterSpacing: 1.4, paddingHorizontal: 4 }} />
      <Card padded={false} elevation="sm">
        {children}
      </Card>
    </Stack>
  );
}

const openWeb = (path: string) => {
  WebBrowser.openBrowserAsync(`${WEB_BASE}${path}`).catch(() => {});
};

export default function Account() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const authed = status === 'authenticated';
  const profile = useProfile();
  const displayName = (profile.data?.fullName as string) ?? user?.name ?? null;
  const email = authed ? ((profile.data?.email as string) ?? user?.email ?? user?.phoneNumber) : null;

  const push = (href: Href) => router.push(href);
  const shareApp = () => {
    Share.share({ message: "Wedding Wala — Pakistan's #1 shaadi platform. https://weddingwala.pk" }).catch(() => {});
  };

  return (
    <Screen scroll padded>
      <View style={{ paddingTop: t.spacing.sm, paddingBottom: t.spacing.lg }}>
        <T k="account.title" variant="h1" />
      </View>

      <Stack gap="xl">
        {/* Profile */}
        <Card elevation="sm">
          <Row justify="space-between">
            <Row gap="md" style={{ flex: 1 }}>
              <View style={[styles.avatar, { backgroundColor: goldScale.subtle }]}>
                <Ionicons name="person" size={24} color={t.colors.goldDark} />
              </View>
              <Stack gap="xxs" style={{ flex: 1 }}>
                {authed && displayName ? (
                  <Text variant="title" numberOfLines={1}>{displayName}</Text>
                ) : (
                  <T k="account.guest" variant="title" />
                )}
                {authed && email ? (
                  <Text variant="caption" tone="muted" numberOfLines={1}>{email}</Text>
                ) : (
                  <T k="account.signInPrompt" variant="caption" tone="muted" numberOfLines={2} />
                )}
              </Stack>
            </Row>
            <Badge label={authed ? tr('account.signedIn') : tr('account.guest')} tone={authed ? 'success' : 'neutral'} urdu={isUrdu} />
          </Row>
          <View style={{ marginTop: t.spacing.md }}>
            {authed ? (
              <Button label={tr('common.signOut')} urdu={isUrdu} variant="secondary" icon="log-out-outline" onPress={() => void signOut()} />
            ) : (
              <Button label={tr('common.signInRegister')} urdu={isUrdu} icon="person-outline" fullWidth onPress={() => push('/auth/login')} />
            )}
          </View>
        </Card>

        {/* My activity */}
        <Group titleKey="acct.activity">
          <SettingsRow icon="heart-outline" labelKey="common.savedVendors" onPress={() => push('/favorites')} />
          <SettingsRow icon="git-compare-outline" labelKey="common.compareVendors" onPress={() => push('/compare')} />
          {authed ? <SettingsRow icon="calendar-outline" labelKey="account.myBookings" onPress={() => push('/account/bookings')} /> : null}
          {authed ? <SettingsRow icon="person-outline" labelKey="account.editProfile" onPress={() => push('/account/profile')} /> : null}
          <SettingsRow icon="search-outline" labelKey="common.exploreVendors" onPress={() => push('/explore')} last />
        </Group>

        {/* Planning */}
        <Group titleKey="acct.planning">
          <SettingsRow icon="wallet-outline" labelKey="tool.budget" onPress={() => push('/tools/budget')} />
          <SettingsRow icon="checkmark-done-outline" labelKey="tool.checklist" onPress={() => push('/tools/checklist')} />
          <SettingsRow icon="people-outline" labelKey="tool.guests" onPress={() => push('/tools/guests')} />
          <SettingsRow icon="time-outline" labelKey="tool.timeline" onPress={() => push('/tools/timeline')} />
          <SettingsRow icon="book-outline" labelKey="home.weddingGuides" onPress={() => push('/guides')} last />
        </Group>

        {/* Preferences */}
        <Stack gap="sm">
          <T k="acct.preferences" variant="overline" tone="label" style={{ letterSpacing: 1.4, paddingHorizontal: 4 }} />
          <Card elevation="sm">
            <Row justify="space-between" align="center">
              <T k="account.language" variant="body" tone="body" />
              <ChipSelect
                scroll={false}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'ur', label: 'اردو' },
                ]}
                value={locale}
                onChange={(v) => setLocale((v as 'en' | 'ur') ?? 'en')}
              />
            </Row>
          </Card>
          <Card padded={false} elevation="sm">
            <SettingsRow icon="notifications-outline" labelKey="acct.notifications" onPress={() => push('/inbox')} />
            <SettingsRow icon="cash-outline" labelKey="acct.currency" value="PKR (Rs)" onPress={() => {}} last />
          </Card>
        </Stack>

        {/* Support */}
        <Group titleKey="acct.support">
          <SettingsRow icon="help-buoy-outline" labelKey="acct.help" onPress={() => push('/guides')} />
          <SettingsRow icon="chatbubble-ellipses-outline" labelKey="acct.contact" onPress={() => openWeb('/contact')} />
          <SettingsRow icon="share-social-outline" labelKey="acct.share" onPress={shareApp} />
          <SettingsRow icon="star-outline" labelKey="acct.rate" onPress={() => openWeb('')} last />
        </Group>

        {/* About */}
        <Group titleKey="acct.about">
          <SettingsRow icon="sparkles-outline" labelKey="acct.aboutWW" onPress={() => openWeb('/about')} />
          <SettingsRow icon="document-text-outline" labelKey="acct.terms" onPress={() => openWeb('/terms')} />
          <SettingsRow icon="shield-checkmark-outline" labelKey="acct.privacy" onPress={() => openWeb('/privacy')} />
          <SettingsRow icon="information-circle-outline" labelKey="acct.version" value="1.0.0" onPress={() => {}} last />
        </Group>

        <T k="account.tagline" variant="caption" tone="muted" align="center" style={{ marginTop: 4 }} />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconWell: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
