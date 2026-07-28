import { router } from 'expo-router';
import { View } from 'react-native';

import { Badge, Button, Card, ChipSelect, Divider, Row, Screen, Stack, Text } from '@/components/ui';
import { useAuthStore } from '@/store/auth';
import { useLocaleStore } from '@/store/locale';
import { useTheme } from '@/theme';

export default function Account() {
  const t = useTheme();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const authed = status === 'authenticated';

  return (
    <Screen scroll padded>
      <View style={{ paddingTop: t.spacing.sm, paddingBottom: t.spacing.lg }}>
        <Text variant="h1">Account</Text>
      </View>

      <Stack gap="lg">
        <Card>
          <Row justify="space-between">
            <Stack gap="xxs">
              <Text variant="title">{authed ? (user?.name ?? 'Signed in') : 'Guest'}</Text>
              <Text variant="caption" tone="muted">
                {authed ? (user?.phoneNumber ?? user?.email ?? 'Your account') : 'Sign in to save vendors & book'}
              </Text>
            </Stack>
            <Badge label={authed ? 'Signed in' : 'Guest'} tone={authed ? 'success' : 'neutral'} />
          </Row>
          <View style={{ marginTop: t.spacing.md }}>
            {authed ? (
              <Button label="Sign out" variant="secondary" icon="log-out-outline" onPress={() => void signOut()} />
            ) : (
              <Button
                label="Sign in / Register"
                icon="person-outline"
                fullWidth
                onPress={() => router.push('/dev')}
              />
            )}
          </View>
        </Card>

        <Stack gap="sm">
          <Text variant="overline" tone="label">
            LANGUAGE
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
        </Stack>

        <Divider />

        <Button label="Design system (dev)" variant="ghost" icon="color-palette-outline" onPress={() => router.push('/dev')} />
        <Text variant="caption" tone="muted" align="center">
          Full sign-in, bookings, payments &amp; settings arrive in Phase 3.
        </Text>
      </Stack>
    </Screen>
  );
}
