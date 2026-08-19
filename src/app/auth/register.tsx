/**
 * S26 — Create account. Governed by rules.md §0.0.
 *
 * Same shell as sign-in, opening on a different photograph so the two screens
 * are recognisably one product without being the same picture twice.
 *
 * ── Why the hero is shorter here ──────────────────────────────────────────
 *
 * Five fields, a strength meter, a legal line and a CTA. Sign-in can spend 60%
 * of the screen on photography because it only has two fields to place;
 * register cannot, so it spends 50% and lets the headline scroll away. The
 * photograph stays put behind it — see `AuthShell` on why that parallax is
 * free.
 *
 * ── Field order is not alphabetical ───────────────────────────────────────
 *
 * Name, **phone**, email, password. Phone comes second because in Pakistan it
 * is the real identifier: it is the number the vendor will WhatsApp, it is what
 * OTP is sent to, and it is the field people can fill without thinking. Email
 * is often an afterthought account someone made for a job application. Putting
 * the easy, meaningful field early is what gets the form finished.
 *
 * ── What signup actually does ─────────────────────────────────────────────
 *
 * `POST /auth/signup` as multipart with `roleIds: [3]` (customer) — the web's
 * exact contract, see `lib/api/endpoints/auth.ts`. It usually returns a token
 * and we sign straight in; when it does not, the account exists but needs
 * activation, so we route to sign-in rather than pretending we are logged in.
 */
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import {
  AuthButton,
  AuthError,
  AuthField,
  AuthLegal,
  AuthShell,
  AuthSwitch,
  AvatarPicker,
  PasswordStrength,
} from '@/components/auth';
import { useT } from '@/i18n/useT';
import { signup, type UploadFile } from '@/lib/api/endpoints/auth';
import { apiErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/store/auth';
import { haptics, spacing } from '@/theme';

export default function RegisterScreen() {
  const { t: tr, isUrdu } = useT();
  const signIn = useAuthStore((s) => s.signIn);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  /** Optional, exactly as on the web — signup never blocks on it. */
  const [photo, setPhoto] = useState<UploadFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Which field the error belongs to, so only that one is marked red. A form
   *  that reddens all five because the passwords disagree is telling the
   *  customer to re-check things that were fine. */
  const [badField, setBadField] = useState<'all' | 'password' | 'confirm' | null>(null);

  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const fail = (message: string, field: 'all' | 'password' | 'confirm') => {
    setError(message);
    setBadField(field);
    haptics.warning();
  };

  const submit = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      fail(tr('auth.errAllFields'), 'all');
      return;
    }
    if (password.length < 8) {
      fail(tr('auth.errPwLen'), 'password');
      return;
    }
    if (password !== confirm) {
      fail(tr('auth.errPwMatch'), 'confirm');
      return;
    }
    setBusy(true);
    setError(null);
    setBadField(null);
    try {
      const res = await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
        password,
        profileImage: photo,
      });
      haptics.success();
      if (res.token) {
        await signIn(res.token, res.user, res.jti);
        router.dismissAll();
        router.replace('/account');
      } else {
        // Created, but not usable yet — activation is pending. Sending them to
        // sign-in is honest; pretending they are in is not.
        router.replace('/auth/login');
      }
    } catch (e) {
      setError(apiErrorMessage(e, tr));
      setBadField('all');
      haptics.error();
    } finally {
      setBusy(false);
    }
  };

  const bad = (field: 'password' | 'confirm') =>
    badField === 'all' || badField === field;

  return (
    <AuthShell
      overline={tr('auth.wordmark')}
      headline={tr('auth.createAccount')}
      sub={tr('auth.registerSub')}
      scene={1}
      heroRatio={0.50}
      urdu={isUrdu}
    >
      {/* Optional, and first — same position as the web form. It is the one
          field that is nicer to answer than to skip, so it opens the form. */}
      <View style={{ marginBottom: spacing.xl }}>
        <AvatarPicker
          value={photo}
          onChange={setPhoto}
          label={tr('auth.addPhoto')}
          hint={tr('auth.photoHint')}
          changeLabel={tr('auth.changePhoto')}
          removeLabel={tr('auth.removePhoto')}
          urdu={isUrdu}
        />
      </View>

      <View style={{ gap: spacing.lg }}>
        <AuthField
          label={tr('auth.fullName')}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => phoneRef.current?.focus()}
          invalid={badField === 'all' && !fullName.trim()}
          urdu={isUrdu}
        />
        <AuthField
          ref={phoneRef}
          label={tr('auth.phone')}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
          invalid={badField === 'all' && !phone.trim()}
          urdu={isUrdu}
        />
        <AuthField
          ref={emailRef}
          label={tr('auth.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          invalid={badField === 'all' && !email.trim()}
          urdu={isUrdu}
        />

        <View>
          <AuthField
            ref={passwordRef}
            label={tr('auth.password')}
            value={password}
            onChangeText={setPassword}
            secure
            showLabel={tr('auth.showPassword')}
            hideLabel={tr('auth.hidePassword')}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => confirmRef.current?.focus()}
            invalid={bad('password')}
            urdu={isUrdu}
          />
          <PasswordStrength
            value={password}
            urdu={isUrdu}
            labels={[tr('auth.pwWeak'), tr('auth.pwFair'), tr('auth.pwGood'), tr('auth.pwStrong')]}
          />
        </View>

        <AuthField
          ref={confirmRef}
          label={tr('auth.confirmPassword')}
          value={confirm}
          onChangeText={setConfirm}
          secure
          showLabel={tr('auth.showPassword')}
          hideLabel={tr('auth.hidePassword')}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
          invalid={bad('confirm')}
          urdu={isUrdu}
        />
      </View>

      {error ? (
        <View style={{ marginTop: spacing.lg }}>
          <AuthError message={error} urdu={isUrdu} />
        </View>
      ) : null}

      <View style={{ marginTop: spacing.xxl, gap: spacing.lg }}>
        <AuthButton
          label={tr('auth.createBtn')}
          loading={busy}
          onPress={submit}
          urdu={isUrdu}
        />
        <AuthLegal
          note={tr('auth.legalNote')}
          terms={tr('auth.terms')}
          privacy={tr('auth.privacy')}
          urdu={isUrdu}
        />
      </View>

      <View style={{ marginTop: spacing.sm }}>
        <AuthSwitch
          prompt={tr('auth.alreadyHave')}
          action={tr('common.signIn')}
          onPress={() => router.replace('/auth/login')}
          urdu={isUrdu}
        />
      </View>
    </AuthShell>
  );
}
