import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Input, Row, Text } from '@/components/ui';
import { T } from '@/i18n/T';
import { useT } from '@/i18n/useT';
import { signup } from '@/lib/api/endpoints/auth';
import { ApiError } from '@/lib/api/errors';
import { useAuthStore } from '@/store/auth';
import { haptics, useTheme } from '@/theme';
import { BridalWash } from '@/theme/textures';

export default function Register() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((s) => s.signIn);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setError(tr('auth.errAllFields'));
      return;
    }
    if (password.length < 8) {
      setError(tr('auth.errPwLen'));
      return;
    }
    if (password !== confirm) {
      setError(tr('auth.errPwMatch'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await signup({ fullName: fullName.trim(), email: email.trim(), phoneNumber: phone.trim(), password });
      if (res.token) {
        await signIn(res.token, res.user, res.jti);
        haptics.success();
        router.dismissAll();
        router.replace('/account');
      } else {
        // Account created but needs verification/login.
        haptics.success();
        router.replace('/auth/login');
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : tr('auth.errSignUp');
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <BridalWash style={{ paddingTop: insets.top + 8, paddingBottom: 24 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ paddingHorizontal: 16 }}>
          <Ionicons name="chevron-back" size={24} color={t.colors.charcoalSurface} />
        </Pressable>
        <View style={{ alignItems: 'center', paddingHorizontal: 24, marginTop: 4 }}>
          <T k="auth.createAccount" variant="display" align="center" />
          <T k="auth.registerSub" variant="body" tone="muted" align="center" />
        </View>
      </BridalWash>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 14 }} keyboardShouldPersistTaps="handled">
          <Input label={tr('auth.fullName')} urdu={isUrdu} placeholder="Your name" icon="person-outline" value={fullName} onChangeText={setFullName} />
          <Input label={tr('auth.email')} urdu={isUrdu} placeholder="you@email.com" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
          <Input label={tr('auth.phone')} urdu={isUrdu} placeholder="03xx xxxxxxx" icon="call-outline" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <Input label={tr('auth.password')} urdu={isUrdu} placeholder="At least 8 characters" icon="lock-closed-outline" secureTextEntry value={password} onChangeText={setPassword} />
          <Input label={tr('auth.confirmPassword')} urdu={isUrdu} placeholder="Re-enter password" icon="lock-closed-outline" secureTextEntry value={confirm} onChangeText={setConfirm} />
          {error ? <Text variant="caption" tone="danger" urdu={isUrdu}>{error}</Text> : null}
          <Button label={tr('auth.createBtn')} urdu={isUrdu} fullWidth loading={busy} onPress={submit} />
          <Row justify="center" gap="xs">
            <T k="auth.alreadyHave" variant="body" tone="muted" />
            <Pressable onPress={() => router.replace('/auth/login')} hitSlop={6}>
              <T k="common.signIn" variant="body" tone="gold" weight="medium" />
            </Pressable>
          </Row>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
