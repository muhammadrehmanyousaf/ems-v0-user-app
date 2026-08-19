/**
 * S25 — Sign in. Governed by rules.md §0.0.
 *
 * ── Third attempt, and why the first two were wrong ───────────────────────
 *
 * v1 opened on `BridalWash` — a pastel pink-and-cream radial with a centred
 * serif greeting. It read as a greetings card.
 *
 * v2 replaced that with the app's standard deep-ink `ScreenHeader` and argued
 * that consistency was the premium signal. It was not. Consistency is what you
 * reach for when you have nothing to say: the screen became a flat coloured
 * band with a vector arch and two boxes under it — correct, systematic, and
 * indistinguishable from a template.
 *
 * Both failed for the same reason. **The problem was never the layout, it was
 * the material.** Gradients and vector ornament cannot produce depth. Auth is
 * the first surface a new customer sees and the moment we ask them to hand
 * something over, so it now runs on real photography — a hall of lit arches
 * under crystal, drifting, with the form on a white sheet resting on top of it.
 * See `components/auth/AuthScene.tsx` for what that costs (740 KB, bundled) and
 * `assets/images/auth/CREDITS.md` for where it came from.
 *
 * ── What this screen does that the old one did not ────────────────────────
 *
 * • **Focus chaining.** Return on the email field moves to the password rather
 *   than dismissing the keyboard. Three fewer taps is not a luxury on a form.
 * • **A route out of a forgotten password.** The old screen had none — a dead
 *   end for anyone who could not remember theirs, on the one screen where that
 *   is the likeliest reason they are stuck. It opens the web reset flow, which
 *   is real and works today; the app does not yet have its own.
 * • **The error is a surface**, not a red line under the last field.
 * • **`router.back()` is guarded** (in `AuthShell`). Unguarded, a successful
 *   sign-in after a deep link went nowhere and the customer sat here looking
 *   logged out.
 */
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';

import { AuthButton, AuthError, AuthField, AuthShell, AuthSwitch } from '@/components/auth';
import { Text } from '@/components/ui';
import { useT } from '@/i18n/useT';
import { login } from '@/lib/api/endpoints/auth';
import { apiErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/store/auth';
import { colors, fontFamily, haptics, spacing } from '@/theme';

export default function LoginScreen() {
  const { t: tr, isUrdu } = useT();
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError(tr('auth.errEmailPassword'));
      haptics.warning();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await login(email.trim(), password);
      if (!res.token) {
        // 2FA accounts come back without a token. The app has no second-factor
        // screen yet, so say so plainly rather than failing silently.
        setError(tr('auth.err2fa'));
        return;
      }
      await signIn(res.token, res.user, res.jti);
      haptics.success();
      if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch (e) {
      setError(apiErrorMessage(e, tr));
      haptics.error();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      overline={tr('auth.wordmark')}
      headline={tr('auth.welcomeBack')}
      sub={tr('auth.signInSub')}
      scene={0}
      heroRatio={0.60}
      urdu={isUrdu}
    >
      <View style={{ gap: spacing.lg }}>
        <AuthField
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
          invalid={!!error}
          urdu={isUrdu}
        />
        <AuthField
          ref={passwordRef}
          label={tr('auth.password')}
          value={password}
          onChangeText={setPassword}
          secure
          showLabel={tr('auth.showPassword')}
          hideLabel={tr('auth.hidePassword')}
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          invalid={!!error}
          urdu={isUrdu}
        />
      </View>

      <Pressable
        accessibilityRole="link"
        hitSlop={10}
        onPress={() => {
          Linking.openURL('https://www.weddingwala.pk/forgot-password').catch(() => {});
        }}
        style={{
          alignSelf: isUrdu ? 'flex-start' : 'flex-end',
          paddingVertical: spacing.md,
        }}
      >
        <Text
          variant="caption"
          urdu={isUrdu}
          style={{ color: colors.textMuted, fontFamily: fontFamily.bodyMedium }}
        >
          {tr('auth.forgot')}
        </Text>
      </Pressable>

      {error ? (
        <View style={{ marginBottom: spacing.lg }}>
          <AuthError message={error} urdu={isUrdu} />
        </View>
      ) : null}

      <AuthButton
        label={tr('common.signIn')}
        loading={busy}
        onPress={submit}
        urdu={isUrdu}
      />

      <View style={{ marginTop: spacing.lg }}>
        <AuthSwitch
          prompt={tr('auth.newHere')}
          action={tr('auth.createAccount')}
          onPress={() => router.replace('/auth/register')}
          urdu={isUrdu}
        />
      </View>
    </AuthShell>
  );
}
