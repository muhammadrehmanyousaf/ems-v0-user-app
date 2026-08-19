/**
 * S11 — Request sent. The one royal moment in the app.
 *
 * Governed by rules.md §0.0. Route: `/booking/done?ref=<bookingId>`.
 *
 * ── Why this screen gets the dark register ────────────────────────────────
 *
 * One dark ground per screen, and most screens spend theirs on a header. This
 * one spends the whole page, because it is the only moment in the product where
 * nothing further is being asked of the customer. Everywhere else the deep panel
 * is a surface content hangs from; here it IS the content.
 *
 * ── The copy is deliberately not a celebration ────────────────────────────
 *
 * "Request sent", not "Booking confirmed" — because it is not confirmed. The
 * vendor has to accept, and `POST /bookings` creates a request, not an
 * agreement. Congratulating someone on a booking they do not have is the exact
 * shape of dishonesty rules.md §0 rules out, and it is also how a product earns
 * an angry message three days later.
 *
 * The reference number is shown because it is the one thing a customer will be
 * asked for on WhatsApp, and there is no route back to this screen.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { ArchOrnament } from '@/components/signature';
import { Button, Text } from '@/components/ui';
import { useT } from '@/i18n/useT';
import { gradients, layout, useTheme } from '@/theme';

export default function BookingDoneScreen() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const { ref } = useLocalSearchParams<{ ref?: string }>();

  return (
    <LinearGradient
      colors={gradients.royal}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + t.spacing.xxl,
        paddingHorizontal: layout.gutter,
        justifyContent: 'center',
      }}
    >
      {/* The Mehrab at full size — this is the one screen where the ornament is
          the composition rather than a watermark in a corner. */}
      <View
        style={{ position: 'absolute', top: insets.top + 20, alignSelf: 'center', opacity: 0.9 }}
        pointerEvents="none"
      >
        <ArchOrnament width={260} height={346} opacity={0.28} />
      </View>

      <View style={{ gap: t.spacing.lg }}>
        <Text variant="hero" tone="onDark" urdu={isUrdu}>
          {tr('booking.doneTitle')}
        </Text>
        <Text variant="bodyLead" tone="onDark" urdu={isUrdu} style={{ opacity: 0.78 }}>
          {tr('booking.doneBody')}
        </Text>

        {ref ? (
          <View style={{ marginTop: t.spacing.md }}>
            <Text variant="overline" style={{ color: t.colors.goldLine }}>
              {tr('booking.ref')}
            </Text>
            {/* Mono, because it is a number someone will read aloud or type. */}
            <Text variant="monoLarge" style={{ color: t.colors.goldLight }}>
              {`#${ref}`}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ position: 'absolute', left: layout.gutter, right: layout.gutter, bottom: insets.bottom + t.spacing.xxl, gap: t.spacing.md }}>
        <Button
          label={tr('booking.viewBookings')}
          fullWidth
          onPress={() => router.replace('/account/bookings')}
          urdu={isUrdu}
        />
        {/* `replace`, not `push` — there is nothing useful behind this screen,
            and a back gesture must not return to a form that would submit again. */}
        <Button
          label={tr('common.done')}
          variant="ghost"
          fullWidth
          onPress={() => router.replace('/')}
          urdu={isUrdu}
        />
      </View>
    </LinearGradient>
  );
}
