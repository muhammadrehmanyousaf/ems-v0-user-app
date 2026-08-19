/**
 * S27 — Profile. Governed by rules.md §0.0.
 *
 * ── What was here ─────────────────────────────────────────────────────────
 *
 * A chevron and a 21px title on a bare row, a static 88px avatar, and four
 * icon-prefixed boxed inputs stacked in a `Section`. Two real defects sat
 * inside it:
 *
 * **1. Email was `editable={false}`.** Not a backend limitation — the web's
 * customer form has always sent it, and `userController.updateMyProfile`
 * allowlists it and checks it for collisions. So a customer who mistyped their
 * address at signup could never fix the one field every booking confirmation,
 * receipt and password reset is delivered to. The only route out was to make a
 * second account.
 *
 * **2. There was no way to change the profile photograph.** The web has had
 * `POST /users/upload-profile-picture` since it shipped. The avatar here was
 * decoration.
 *
 * Both are fixed, and both required API work first — see `docs/API-PARITY.md`.
 *
 * ── The two mutations are separate on purpose ─────────────────────────────
 *
 * The photograph uploads the moment it is picked; the text fields wait for
 * Save. They are different endpoints, and pretending otherwise would mean
 * either holding the photograph hostage to an unrelated form or firing a
 * profile PATCH nobody asked for. Immediate upload also gives the one piece of
 * feedback that matters — the circle changes — without a round trip through a
 * button.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { AuthButton, AuthError, AuthField, AvatarPicker, PasswordStrength } from '@/components/auth';
import { ScreenHeader, Text } from '@/components/ui';
import {
  useChangePassword,
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
} from '@/features/account/account.queries';
import { useT } from '@/i18n/useT';
import type { UploadFile } from '@/lib/api/endpoints/auth';
import { apiErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/store/auth';
import { colors, fontFamily, haptics, layout, spacing, typography } from '@/theme';

/** A quiet heading. Not the gold `Section` label — this screen already spends
 *  its one colour event on the Save button. */
function Group({ title, urdu, children }: { title: string; urdu: boolean; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.xl }}>
      <Text
        urdu={urdu}
        style={{
          ...typography.overline,
          color: colors.textMuted,
          textAlign: urdu ? 'right' : 'left',
          ...(urdu ? { fontFamily: fontFamily.urdu, letterSpacing: 0 } : null),
        }}
      >
        {title}
      </Text>
      <View style={{ gap: spacing.lg }}>{children}</View>
    </View>
  );
}

export default function Profile() {
  const { t: tr, isUrdu } = useT();
  const user = useAuthStore((s) => s.user);
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const changePassword = useChangePassword();

  const p = profile.data ?? {};
  const [fullName, setFullName] = useState<string>((p.fullName as string) ?? user?.name ?? '');
  const [email, setEmail] = useState<string>((p.email as string) ?? user?.email ?? '');
  const [phone, setPhone] = useState<string>((p.phoneNumber as string) ?? user?.phoneNumber ?? '');
  const [city, setCity] = useState<string>((p.city as string) ?? '');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwOk, setPwOk] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const newPwRef = useRef<TextInput>(null);

  /** Fill the form once, when the profile first arrives. Derived state during
   *  render is the sanctioned React pattern for this and avoids the effect
   *  round-trip that would briefly show empty fields over real data. */
  const [hydrated, setHydrated] = useState(false);
  if (!hydrated && profile.data) {
    setHydrated(true);
    setFullName((profile.data.fullName as string) ?? fullName);
    setEmail((profile.data.email as string) ?? email);
    setPhone((profile.data.phoneNumber as string) ?? phone);
    setCity((profile.data.city as string) ?? city);
  }

  const save = () => {
    setSaveError(null);
    if (!email.trim().includes('@')) {
      setSaveError(tr('profile.errEmail'));
      haptics.warning();
      return;
    }
    updateProfile.mutate(
      {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
        city: city.trim() || undefined,
      },
      {
        onSuccess: () => {
          haptics.success();
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
        // The backend rejects an address another account already holds, and
        // that message is the useful one — it names the actual problem.
        onError: (e) => {
          setSaveError(apiErrorMessage(e, tr));
          haptics.error();
        },
      },
    );
  };

  const savePassword = () => {
    setPwMsg(null);
    if (newPw.length < 8) {
      setPwOk(false);
      setPwMsg(tr('profile.pwLen'));
      haptics.warning();
      return;
    }
    changePassword.mutate(
      { current: curPw, next: newPw },
      {
        onSuccess: () => {
          haptics.success();
          setPwOk(true);
          setPwMsg(tr('profile.pwUpdated'));
          setCurPw('');
          setNewPw('');
        },
        onError: (e) => {
          setPwOk(false);
          setPwMsg(apiErrorMessage(e, tr));
          haptics.error();
        },
      },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <ScreenHeader
        title={tr('profile.title')}
        urdu={isUrdu}
        leading={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('common.back')}
            hitSlop={12}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/account'))}
          >
            <Ionicons
              name={isUrdu ? 'chevron-forward' : 'chevron-back'}
              size={26}
              color={colors.onDark}
            />
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: layout.gutter,
            paddingTop: spacing.xxl,
            paddingBottom: layout.tabBarSpace,
            gap: spacing.huge,
          }}
        >
          <AvatarPicker
            value={null}
            currentUri={(p.profileImage as string) ?? user?.avatarUrl ?? null}
            busy={uploadAvatar.isPending}
            allowRemove={false}
            // Uploads immediately. See the header on why this does not wait for
            // the Save button below it.
            onChange={(file: UploadFile | null) => {
              if (file) uploadAvatar.mutate(file);
            }}
            label={tr('auth.addPhoto')}
            hint={tr('profile.photoHint')}
            changeLabel={tr('auth.changePhoto')}
            removeLabel={tr('auth.removePhoto')}
            urdu={isUrdu}
          />

          <Group title={tr('profile.yourDetails')} urdu={isUrdu}>
            <AuthField
              label={tr('auth.fullName')}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => emailRef.current?.focus()}
              urdu={isUrdu}
            />
            {/* Editable. It was not, and that was not a backend limit — see the
                header. */}
            <AuthField
              ref={emailRef}
              label={tr('auth.email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => phoneRef.current?.focus()}
              invalid={!!saveError}
              urdu={isUrdu}
            />
            <AuthField
              ref={phoneRef}
              label={tr('auth.phone')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => cityRef.current?.focus()}
              urdu={isUrdu}
            />
            <AuthField
              ref={cityRef}
              label={tr('profile.city')}
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              returnKeyType="done"
              urdu={isUrdu}
            />

            {saveError ? <AuthError message={saveError} urdu={isUrdu} /> : null}

            <AuthButton
              label={saved ? tr('profile.saved') : tr('common.saveChanges')}
              loading={updateProfile.isPending}
              onPress={save}
              urdu={isUrdu}
            />
          </Group>

          <Group title={tr('profile.changePassword')} urdu={isUrdu}>
            <AuthField
              label={tr('profile.currentPassword')}
              value={curPw}
              onChangeText={setCurPw}
              secure
              showLabel={tr('auth.showPassword')}
              hideLabel={tr('auth.hidePassword')}
              autoCapitalize="none"
              autoComplete="current-password"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => newPwRef.current?.focus()}
              urdu={isUrdu}
            />
            <View>
              <AuthField
                ref={newPwRef}
                label={tr('profile.newPassword')}
                value={newPw}
                onChangeText={setNewPw}
                secure
                showLabel={tr('auth.showPassword')}
                hideLabel={tr('auth.hidePassword')}
                autoCapitalize="none"
                autoComplete="new-password"
                returnKeyType="go"
                onSubmitEditing={savePassword}
                urdu={isUrdu}
              />
              <PasswordStrength
                value={newPw}
                urdu={isUrdu}
                labels={[tr('auth.pwWeak'), tr('auth.pwFair'), tr('auth.pwGood'), tr('auth.pwStrong')]}
              />
            </View>

            {pwMsg ? (
              pwOk ? (
                <Text variant="caption" tone="success" urdu={isUrdu}>
                  {pwMsg}
                </Text>
              ) : (
                <AuthError message={pwMsg} urdu={isUrdu} />
              )
            ) : null}

            <AuthButton
              label={tr('profile.updatePassword')}
              variant="secondary"
              loading={changePassword.isPending}
              onPress={savePassword}
              urdu={isUrdu}
            />
          </Group>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
