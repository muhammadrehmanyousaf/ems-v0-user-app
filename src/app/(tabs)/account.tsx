import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Badge, Button, Card, ChipSelect, Divider, Row, Screen, Stack, Text } from '@/components/ui';
import { useProfile } from '@/features/account/account.queries';
import type { StringKey } from '@/i18n/strings';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';
import { useTheme } from '@/theme';

function AccountRow({
  icon,
  labelKey,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: StringKey;
  onPress: () => void;
  last?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.colors.border,
      }}
    >
      <Ionicons name={icon} size={20} color={t.colors.goldDark} />
      <T k={labelKey} variant="body" tone="body" style={{ flex: 1 }} />
      <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
    </Pressable>
  );
}

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

  return (
    <Screen scroll padded>
      <View style={{ paddingTop: t.spacing.sm, paddingBottom: t.spacing.lg }}>
        <T k="account.title" variant="h1" />
      </View>

      <Stack gap="lg">
        <Card>
          <Row justify="space-between">
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
            <Badge label={authed ? tr('account.signedIn') : tr('account.guest')} tone={authed ? 'success' : 'neutral'} urdu={isUrdu} />
          </Row>
          <View style={{ marginTop: t.spacing.md }}>
            {authed ? (
              <Button label={tr('common.signOut')} urdu={isUrdu} variant="secondary" icon="log-out-outline" onPress={() => void signOut()} />
            ) : (
              <Button label={tr('common.signInRegister')} urdu={isUrdu} icon="person-outline" fullWidth onPress={() => router.push('/auth/login')} />
            )}
          </View>
        </Card>

        {authed ? (
          <Stack gap="none">
            <AccountRow icon="calendar-outline" labelKey="account.myBookings" onPress={() => router.push('/account/bookings')} />
            <AccountRow icon="person-outline" labelKey="account.editProfile" onPress={() => router.push('/account/profile')} last />
          </Stack>
        ) : null}

        <Stack gap="none">
          <AccountRow icon="heart-outline" labelKey="common.savedVendors" onPress={() => router.push('/favorites')} />
          <AccountRow icon="git-compare-outline" labelKey="common.compareVendors" onPress={() => router.push('/compare')} />
          <AccountRow icon="search-outline" labelKey="common.exploreVendors" onPress={() => router.push('/explore')} last />
        </Stack>

        <Stack gap="sm">
          <T k="account.language" variant="overline" tone="label" />
          <ChipSelect
            scroll={false}
            options={[
              { value: 'en', label: 'English' },
              { value: 'ur', label: 'اردو' },
            ]}
            value={locale}
            onChange={(v) => setLocale((v as 'en' | 'ur') ?? 'en')}
          />
        </Stack>

        <Divider />

        <T k="account.tagline" variant="caption" tone="muted" align="center" />
      </Stack>
    </Screen>
  );
}
