import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Input, Row, Text } from '@/components/ui';
import { signup } from '@/lib/api/endpoints/auth';
import { ApiError } from '@/lib/api/errors';
import { useAuthStore } from '@/store/auth';
import { haptics, useTheme } from '@/theme';
import { BridalWash } from '@/theme/textures';

export default function Register() {
  const t = useTheme();
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
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords don’t match.');
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
      const msg = e instanceof ApiError ? e.message : 'Sign up failed. Please try again.';
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
          <Text variant="display" align="center">Create your account</Text>
          <Text variant="body" tone="muted" align="center">Plan your shaadi with Wedding Wala.</Text>
        </View>
      </BridalWash>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 14 }} keyboardShouldPersistTaps="handled">
          <Input label="Full name" placeholder="Your name" icon="person-outline" value={fullName} onChangeText={setFullName} />
          <Input label="Email" placeholder="you@email.com" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
          <Input label="Phone / WhatsApp" placeholder="03xx xxxxxxx" icon="call-outline" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <Input label="Password" placeholder="At least 8 characters" icon="lock-closed-outline" secureTextEntry value={password} onChangeText={setPassword} />
          <Input label="Confirm password" placeholder="Re-enter password" icon="lock-closed-outline" secureTextEntry value={confirm} onChangeText={setConfirm} />
          {error ? <Text variant="caption" tone="danger">{error}</Text> : null}
          <Button label="Create account" fullWidth loading={busy} onPress={submit} />
          <Row justify="center" gap="xs">
            <Text variant="body" tone="muted">Already have an account?</Text>
            <Pressable onPress={() => router.replace('/auth/login')} hitSlop={6}>
              <Text variant="body" tone="gold" weight="medium">Sign in</Text>
            </Pressable>
          </Row>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
