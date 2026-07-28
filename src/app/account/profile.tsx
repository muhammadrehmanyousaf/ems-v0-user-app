import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Divider, Input, Row, Section, Stack, Text } from '@/components/ui';
import { useChangePassword, useProfile, useUpdateProfile } from '@/features/account/account.queries';
import { useAuthStore } from '@/store/auth';
import { haptics, useTheme } from '@/theme';

export default function Profile() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const p = profile.data ?? {};
  const [fullName, setFullName] = useState<string>((p.fullName as string) ?? user?.name ?? '');
  const [phone, setPhone] = useState<string>((p.phoneNumber as string) ?? user?.phoneNumber ?? '');
  const [city, setCity] = useState<string>((p.city as string) ?? '');
  const [saved, setSaved] = useState(false);

  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  // Sync fields once the profile loads (render-phase reset on first data).
  const [hydrated, setHydrated] = useState(false);
  if (!hydrated && profile.data) {
    setHydrated(true);
    setFullName((profile.data.fullName as string) ?? fullName);
    setPhone((profile.data.phoneNumber as string) ?? phone);
    setCity((profile.data.city as string) ?? city);
  }

  const save = () => {
    updateProfile.mutate(
      { fullName: fullName.trim(), phoneNumber: phone.trim(), city: city.trim() || undefined },
      {
        onSuccess: () => {
          haptics.success();
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      },
    );
  };

  const savePassword = () => {
    setPwMsg(null);
    if (newPw.length < 8) {
      setPwMsg('New password must be at least 8 characters.');
      return;
    }
    changePassword.mutate(
      { current: curPw, next: newPw },
      {
        onSuccess: () => { haptics.success(); setPwMsg('Password updated.'); setCurPw(''); setNewPw(''); },
        onError: () => setPwMsg('Couldn’t update password. Check your current password.'),
      },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <Row gap="sm" style={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={t.colors.textPrimary} />
        </Pressable>
        <Text variant="h1">Profile</Text>
      </Row>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.xl }} keyboardShouldPersistTaps="handled">
          <Row justify="center">
            <Avatar name={fullName || user?.name} uri={user?.avatarUrl} size={88} />
          </Row>

          <Section title="YOUR DETAILS">
            <Stack gap="md">
              <Input label="Full name" icon="person-outline" value={fullName} onChangeText={setFullName} />
              <Input label="Email" icon="mail-outline" value={(p.email as string) ?? user?.email ?? ''} editable={false} />
              <Input label="Phone / WhatsApp" icon="call-outline" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              <Input label="City" icon="location-outline" value={city} onChangeText={setCity} placeholder="e.g. Lahore" />
              <Button label={saved ? 'Saved ✓' : 'Save changes'} fullWidth loading={updateProfile.isPending} onPress={save} />
            </Stack>
          </Section>

          <Divider />

          <Section title="CHANGE PASSWORD">
            <Stack gap="md">
              <Input label="Current password" icon="lock-closed-outline" secureTextEntry value={curPw} onChangeText={setCurPw} />
              <Input label="New password" icon="lock-closed-outline" secureTextEntry value={newPw} onChangeText={setNewPw} />
              {pwMsg ? <Text variant="caption" tone={pwMsg.includes('updated') ? 'success' : 'danger'}>{pwMsg}</Text> : null}
              <Button label="Update password" variant="secondary" fullWidth loading={changePassword.isPending} onPress={savePassword} />
            </Stack>
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
