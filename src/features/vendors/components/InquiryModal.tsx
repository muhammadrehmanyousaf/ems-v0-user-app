/**
 * InquiryModal — the ONE contact form. `POST /leads/inquiry`.
 *
 * ── This replaces two components that did the same thing ──────────────────
 *
 * `BookingRequestModal` and `InquiryModal` both posted to `/leads/inquiry` and
 * both created a Lead. They differed only in which half of the job each did
 * badly:
 *
 *   `BookingRequestModal`   rich fields (function, date, guests, package),
 *                           fully translated — but titled "Request a booking"
 *                           with a "Send booking request" button, sitting on
 *                           the same screen as the REAL booking flow, which
 *                           posts to `/bookings`. Two different things wearing
 *                           the same words is how a customer comes away
 *                           believing they hold a booking when they hold an
 *                           enquiry.
 *   `InquiryModal`          honest copy, an email field, and the unclaimed-
 *                           vendor warning — but hardcoded English throughout,
 *                           in a bilingual app, and missing every field the
 *                           vendor actually needs to quote.
 *
 * This is the union: the rich fields, the honest words, translated. The other
 * file is deleted.
 *
 * ── The bug this endpoint carried on live production ──────────────────────
 *
 * The app posted `phoneNumber`. The backend reads `contactPhone ?? phone` and
 * knows neither, so the number was dropped, `assessContactability` saw no
 * channel at all, and every inquiry came back 400 — "Please share a phone number
 * or email so the vendor can reply" — to a customer who had just typed their
 * phone number into the box above. Fixed in `endpoints/vendors.ts`, whose
 * payload interface now uses the WIRE names so the compiler catches a rename.
 *
 * Two consequences visible here:
 *
 * · **The guard matches the backend's rule.** It used to accept "name OR
 *   phone", so someone who typed only their name passed the local check and was
 *   rejected by the server. The server wants a channel it can REPLY on, and
 *   that is what is asked for.
 * · **The confirmation tells the truth.** 3,268 of 3,331 listings are unclaimed
 *   OSM imports whose owner has never logged in. "They'll reach out on the
 *   number you provided" was a promise nobody was in a position to keep. The
 *   API says which case this is; the screen says the matching thing.
 *
 * ── Chrome: `Sheet`, not a hand-rolled `Modal` ────────────────────────────
 *
 * Both predecessors rolled their own `Modal` with a literal `borderTopRadius:
 * 20` and no height cap. `Sheet` caps the height, scrolls the body INTERNALLY
 * and renders the footer outside the scroll view — which is the structural fix
 * for the defect this product repeats most often: a tall dialog whose submit
 * button is pushed off the bottom of a 360px screen.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, ChipSelect, FormField, Sheet, Text } from '@/components/ui';
import { useT } from '@/i18n/useT';
import { submitInquiry } from '@/lib/api/endpoints/vendors';
import { useAuthStore } from '@/store/auth';
import { haptics, useTheme } from '@/theme';

import type { VendorPackage } from '../vendors.types';

/**
 * The functions of a Pakistani wedding, in the order they happen. `value` is
 * sent to the backend as `eventType` and is deliberately NOT translated — the
 * vendor's dashboard filters on the English token, so an Urdu-locale customer
 * choosing "بارات" must still file as `Barat`. Only the LABEL localises.
 */
const EVENT_TYPES = [
  { value: 'Mehndi', en: 'Mehndi', ur: 'مہندی' },
  { value: 'Barat', en: 'Barat', ur: 'بارات' },
  { value: 'Nikah', en: 'Nikah', ur: 'نکاح' },
  { value: 'Walima', en: 'Walima', ur: 'ولیمہ' },
  { value: 'Reception', en: 'Reception', ur: 'ریسپشن' },
  { value: 'Other', en: 'Other', ur: 'دیگر' },
] as const;

export function InquiryModal({
  visible,
  onClose,
  businessId,
  vendorName,
  packages = [],
}: {
  visible: boolean;
  onClose: () => void;
  businessId: number;
  vendorName: string;
  packages?: VendorPackage[];
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [eventType, setEventType] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState('');
  const [guests, setGuests] = useState(200);
  const [pkg, setPkg] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [reachable, setReachable] = useState(true);

  /**
   * Reset on OPEN, derived from the prop rather than run in an effect.
   *
   * An effect keyed on `visible` would set state during the commit that opened
   * the sheet, which is one of the five shapes that produce "Maximum update
   * depth exceeded" on Fabric — the crash class that dominates this repo's
   * history. Comparing against the previous prop value during render is the
   * documented React pattern and runs before paint, so nothing flashes.
   */
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setName(user?.name ?? '');
      setPhone(user?.phoneNumber ?? '');
      setEmail(user?.email ?? '');
      setEventType(null);
      setEventDate('');
      setGuests(200);
      setPkg(null);
      setMessage('');
      setError(null);
      setDone(false);
      setReachable(true);
    }
  }

  const packageOptions = packages
    .map((p, i) => ({ value: String(p.id ?? i), label: p.name ?? `Package ${i + 1}` }))
    .slice(0, 8);

  const submit = async () => {
    // The backend's rule, not a looser one: it needs a channel it can REPLY on.
    if (!phone.trim() && !email.trim()) {
      setError(tr('inquiry.errContact'));
      return;
    }
    setSubmitting(true);
    setError(null);

    // The package rides in the message rather than a field of its own —
    // `/leads/inquiry` has no package column, and dropping the choice silently
    // would make the picker a lie.
    const pkgName = packageOptions.find((o) => o.value === pkg)?.label;
    const body = [pkgName ? `Package: ${pkgName}.` : null, message.trim() || null]
      .filter(Boolean)
      .join(' ');

    try {
      const res = await submitInquiry({
        businessId,
        contactName: name.trim() || undefined,
        // Normalised to the canonical PK shape inside the endpoint, so
        // "0327 4811220" and "+92 327 4811220" file as the same number.
        contactPhone: phone.trim() || undefined,
        contactEmail: email.trim() || undefined,
        eventType: eventType ?? undefined,
        eventDate: eventDate.trim() || undefined,
        estimatedGuests: guests,
        message: body || undefined,
      });
      haptics.success();
      setReachable(res.vendorOnPlatform);
      setDone(true);
    } catch (e) {
      // The API layer's message is already customer-facing, and here it is the
      // useful one — it says WHICH field looks wrong.
      setError(e instanceof Error && e.message ? e.message : tr('inquiry.errSend'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={done ? tr('inquiry.sentTitle') : tr('inquiry.title')}
      primaryLabel={done ? undefined : tr('inquiry.send')}
      onPrimary={done ? undefined : submit}
      primaryLoading={submitting}
      // The error goes to the SHEET, not into the body. Rendered at the bottom
      // of the form it sat two screens below the fold at 360px, so pressing
      // "Send inquiry" with no phone and no email looked like a dead button.
      error={done ? null : error}
      urdu={isUrdu}
    >
      {done ? (
        <View style={{ gap: t.spacing.xl, paddingBottom: t.spacing.lg }}>
          <View
            style={{
              flexDirection: isUrdu ? 'row-reverse' : 'row',
              gap: t.spacing.md,
              alignItems: 'flex-start',
            }}
          >
            <Ionicons
              name={reachable ? 'checkmark-circle' : 'information-circle'}
              size={22}
              color={reachable ? t.colors.success : t.colors.info}
              style={{ marginTop: 2 }}
            />
            <Text
              variant="body"
              tone="body"
              urdu={isUrdu}
              style={{ flex: 1, textAlign: isUrdu ? 'right' : 'left' }}
            >
              {reachable ? tr('inquiry.sentBody') : tr('inquiry.sentUnclaimed')}
            </Text>
          </View>
          <Button label={tr('common.done')} urdu={isUrdu} fullWidth onPress={onClose} />
        </View>
      ) : (
        <View style={{ gap: t.spacing.xl }}>
          {/* Who this is going to. The sheet title says what the form does;
              this says who reads it, which is the fact a customer with four
              shortlisted venues open actually needs. */}
          <Text
            variant="caption"
            tone="muted"
            urdu={isUrdu}
            numberOfLines={2}
            style={{ textAlign: isUrdu ? 'right' : 'left' }}
          >
            {vendorName}
          </Text>

          <Field label={tr('inquiry.function')} urdu={isUrdu}>
            <ChipSelect
              options={EVENT_TYPES.map((e) => ({
                value: e.value,
                label: isUrdu ? e.ur : e.en,
              }))}
              value={eventType}
              onChange={setEventType}
              urdu={isUrdu}
            />
          </Field>

          <FormField
            label={tr('inquiry.eventDate')}
            hint={tr('inquiry.eventDateHint')}
            urdu={isUrdu}
            placeholder="15 Dec 2026"
            value={eventDate}
            onChangeText={setEventDate}
          />

          <Field label={tr('inquiry.guests')} urdu={isUrdu}>
            <View
              style={{
                flexDirection: isUrdu ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: t.spacing.lg,
              }}
            >
              <StepButton
                icon="remove"
                onPress={() => setGuests((g) => Math.max(10, g - 50))}
                disabled={guests <= 10}
                label="−50"
              />
              {/* `mono`, like every other figure in the app. A guest count set
                  in the body face drifts by a pixel each time it changes width
                  and the two buttons shuffle with it. */}
              <Text variant="monoLarge" style={{ minWidth: 78, textAlign: 'center' }}>
                {guests}
              </Text>
              <StepButton icon="add" onPress={() => setGuests((g) => g + 50)} label="+50" />
            </View>
          </Field>

          {packageOptions.length > 0 ? (
            <Field label={tr('inquiry.package')} urdu={isUrdu}>
              <ChipSelect
                options={packageOptions}
                value={pkg}
                onChange={setPkg}
                allLabel={tr('inquiry.any')}
                urdu={isUrdu}
              />
            </Field>
          ) : null}

          {/* Hairline between "about the event" and "about you". A rule, not a
              second card — the two halves are one form. */}
          <View style={{ height: t.layout.hairline, backgroundColor: t.colors.border }} />

          <FormField
            label={tr('inquiry.yourName')}
            urdu={isUrdu}
            placeholder={tr('ph.fullName')}
            value={name}
            onChangeText={setName}
            autoComplete="name"
          />
          <FormField
            label={tr('inquiry.phone')}
            urdu={isUrdu}
            placeholder="03xx xxxxxxx"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoComplete="tel"
          />
          {/* Email is not decoration. Phone is the primary channel in Pakistan,
              but a customer whose number is mistyped now has a second way
              through instead of a dead end — and it is the field the web has
              had all along. */}
          <FormField
            label={tr('inquiry.email')}
            urdu={isUrdu}
            placeholder="you@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <FormField
            label={tr('inquiry.message')}
            urdu={isUrdu}
            placeholder="Rasm, timings, anything else…"
            value={message}
            onChangeText={setMessage}
            multiline
            style={{ height: 84, textAlignVertical: 'top', paddingTop: 10 }}
          />

          <Text variant="caption" tone="muted" align="center" urdu={isUrdu}>
            {tr('inquiry.noPayment')}
          </Text>
        </View>
      )}
    </Sheet>
  );
}

/** A labelled group. The label is a quiet overline, never the gold `label` tone
 *  — this form has six of them and gold on every one turns the accent into
 *  wallpaper. */
function Field({
  label,
  urdu,
  children,
}: {
  label: string;
  urdu?: boolean;
  children: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.sm }}>
      <Text
        variant="overline"
        tone="muted"
        urdu={urdu}
        style={{
          textAlign: urdu ? 'right' : 'left',
          // Latin only — Nastaliq has no case, and `textTransform` on it is
          // either a no-op or a glyph-shaping bug on some Android builds.
          ...(urdu ? null : { textTransform: 'uppercase' as const }),
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function StepButton({
  icon,
  onPress,
  disabled,
  label,
}: {
  icon: 'add' | 'remove';
  onPress: () => void;
  disabled?: boolean;
  label: string;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={({ pressed }) => ({
        width: 46,
        height: 46,
        borderRadius: t.radius.pill,
        borderWidth: t.layout.hairline,
        borderColor: t.colors.border,
        backgroundColor: pressed ? t.colors.sunken : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      })}
    >
      {/* Ink, not gold. The gold event on this sheet is nothing — the footer
          action is the deep register — and two steppers do not earn the accent. */}
      <Ionicons name={icon} size={20} color={t.colors.textPrimary} />
    </Pressable>
  );
}
