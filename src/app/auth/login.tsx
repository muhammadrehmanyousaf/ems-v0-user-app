import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Input, Row, Text } from '@/components/ui';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { login } from '@/lib/api/endpoints/auth';
import { ApiError } from '@/lib/api/errors';
import { useAuthStore } from '@/store/auth';
import { haptics, useTheme } from '@/theme';
import { BridalWash } from '@/theme/textures';

export default function Login() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError(tr('auth.errEmailPassword'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await login(email.trim(), password);
      if (!res.token) {
        setError(tr('auth.err2fa'));
        return;
      }
      await signIn(res.token, res.user, res.jti);
      haptics.success();
      router.back();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : tr('auth.errSignIn');
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <BridalWash style={{ paddingTop: insets.top + 8, paddingBottom: 28 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ paddingHorizontal: 16 }}>
          <Ionicons name="chevron-back" size={24} color={t.colors.charcoalSurface} />
        </Pressable>
        <View style={{ alignItems: 'center', paddingHorizontal: 24, marginTop: 8 }}>
          <T k="auth.welcomeBack" variant="display" align="center" />
          <T k="auth.signInSub" variant="body" tone="muted" align="center" />
        </View>
      </BridalWash>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
          <Input label={tr('auth.email')} urdu={isUrdu} placeholder="you@email.com" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
          <Input
            label={tr('auth.password')}
            urdu={isUrdu}
            placeholder="••••••••"
            icon="lock-closed-outline"
            secureTextEntry={!show}
            value={password}
            onChangeText={setPassword}
            onClear={undefined}
          />
          <Pressable onPress={() => setShow((s) => !s)} hitSlop={6}>
            <Text variant="caption" tone="gold" urdu={isUrdu}>{show ? tr('auth.hidePassword') : tr('auth.showPassword')}</Text>
          </Pressable>
          {error ? <Text variant="caption" tone="danger" urdu={isUrdu}>{error}</Text> : null}
          <Button label={tr('common.signIn')} urdu={isUrdu} fullWidth loading={busy} onPress={submit} />
          <Row justify="center" gap="xs">
            <T k="auth.newHere" variant="body" tone="muted" />
            <Pressable onPress={() => router.replace('/auth/register')} hitSlop={6}>
              <T k="auth.createLink" variant="body" tone="gold" weight="medium" />
            </Pressable>
          </Row>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
