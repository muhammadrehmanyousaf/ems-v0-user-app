/**
 * Component gallery — every P2 primitive, every variant, every state.
 *
 * rules.md and docs/05-UI-SPEC.md §21 require this: each widget is proven here,
 * at 360px, BEFORE a screen consumes it. The purpose is not a showroom — it is
 * that a defect in a shared primitive otherwise gets discovered on the fifth
 * screen that uses it, by which point four screens have quietly worked around it.
 *
 * Route: /gallery. Development aid; it ships harmlessly but is unlinked.
 *
 * ── It could only ever prove HALF the app ────────────────────────────────
 *
 * This sheet rendered in English and nothing else. Its whole purpose is that a
 * defect in a shared primitive gets caught here rather than on the fifth screen
 * that uses it — and the largest class of defects this app actually had was
 * Urdu-only:
 *
 *   · Nastaliq laid out at 1.7× its size when the font needs 2.5×, so every
 *     Urdu line in the product was clipped or overlapping.
 *   · Urdu unable to reach the bold face at all, so headings and body copy set
 *     at the same weight.
 *   · Rows and cards that never mirrored despite taking an `urdu` prop.
 *
 * None of those are visible in English. A gallery that cannot switch language
 * is a gallery that certifies a component as correct while half of its
 * behaviour has never been drawn. The toggle at the top drives the real locale
 * store, so every specimen below re-renders exactly as it would in the app —
 * `useT()` consumers follow it, and `urdu` is threaded to the ones that take it.
 *
 * `app/dev.tsx` used to be a second, older showcase of the same thing. It was
 * three design versions stale and unreachable, and is deleted — one reference
 * sheet, or none.
 */
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MonogramFallback } from '@/components/signature';
import {
  Badge,
  Button,
  Calendar,
  Card,
  Chip,
  ChipSelect,
  EmptyState,
  Input,
  MoneyRow,
  SectionHeader,
  Segment,
  SegmentedControl,
  Sheet,
  Skeleton,
  Spec,
  SpecStrip,
  Stack,
  Stepper,
  Text,
  TotalsCard,
  TrustRow,
  VendorHostCard,
  Tabs,
  StatusTimeline,
  FormField,
  DraftResumeBanner,
  PriceHistogram,
  toast,
} from '@/components/ui';
import type { DayAvailability } from '@/components/ui';
import { SlotPicker, type SlotSelection } from '@/features/booking/SlotPicker';
import { useT } from '@/i18n/useT';
import { today, toKey, type DayKey } from '@/lib/date';
import { useLocaleStore } from '@/store/locale';
import { useTheme } from '@/theme';
import { typography, type TypographyVariant } from '@/theme/fonts';

type Mode = 'dates' | 'months' | 'flexible';

/**
 * The type scale, as a specimen sheet. Order is largest to smallest, which is
 * the only order a scale is legible in.
 */
const TYPE_SPECIMENS = [
  'hero',
  'display',
  'h1',
  'h2',
  'h3',
  'title',
  'bodyLead',
  'body',
  'label',
  'caption',
  'overline',
  'mono',
  'monoLarge',
] as const satisfies readonly TypographyVariant[];

const SPECIMEN_LABEL: Record<(typeof TYPE_SPECIMENS)[number], string> = {
  hero: 'Hero',
  display: 'Display',
  h1: 'Heading one',
  h2: 'Heading two',
  h3: 'Heading three',
  title: 'Title',
  bodyLead: 'Body lead — a longer sentence to judge the measure.',
  body: 'Body — the workhorse size for everything a person reads.',
  label: 'Label',
  caption: 'Caption muted',
  overline: 'Overline tracked',
  mono: 'Rs 350,000 · mono',
  monoLarge: 'Rs 1,250,000 · monoLarge',
};

export default function Gallery() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const locale = useLocaleStore((st) => st.locale);
  const setLocale = useLocaleStore((st) => st.setLocale);
  const { isUrdu } = useT();

  const [chip, setChip] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('dates');
  const [guests, setGuests] = useState(500);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [month, setMonth] = useState(today());
  const [day, setDay] = useState<DayKey | null>(null);
  const [text, setText] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [slot, setSlot] = useState<SlotSelection | null>(null);
  const [phone, setPhone] = useState('');

  // A skewed spread plus one outlier, to prove the 98th-percentile clip works.
  const samplePrices = [
    ...Array.from({ length: 40 }, (_, i) => 150000 + i * 25000),
    ...Array.from({ length: 25 }, (_, i) => 300000 + i * 12000),
    50000000,
    null,
    null,
    0,
  ];

  // A spread of availability states so every dot colour is visible at once.
  const availability: Record<DayKey, DayAvailability> = {};
  const base = today();
  (['open', 'open', 'limited', 'full', 'open', 'blocked', 'limited', 'open'] as DayAvailability[]).forEach(
    (state, i) => {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i + 1, 12);
      availability[toKey(d)] = state;
    },
  );

  const segments: Segment<Mode>[] = [
    { value: 'dates', label: 'Dates' },
    { value: 'months', label: 'Months' },
    { value: 'flexible', label: 'Flexible' },
  ];

  const specs: Spec[] = [
    { icon: 'people-outline', value: 500, label: 'Seated' },
    { icon: 'car-outline', value: 120, label: 'Parking' },
    { icon: 'wallet-outline', value: '10%', label: 'Advance' },
    { icon: 'ribbon-outline', value: 5, label: 'Years' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.colors.screen }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 80 }}
    >
      <Stack gap="2xl" style={{ paddingHorizontal: 24 }}>
        <View style={{ gap: t.spacing.md }}>
          <View>
            <Text variant="display">Gallery</Text>
            <Text variant="caption" tone="muted">
              v4 Paper &amp; Gold · every variant, every state · check at 360px
            </Text>
          </View>

          {/*
            Drives the REAL locale store, not a local flag. A local flag would
            prove the specimens and not the wiring — and the wiring is where the
            bugs were: components that read `useT()` internally, stylesheets that
            overrode the Nastaliq face, rows that never mirrored. Flipping this
            puts every specimen below into exactly the state a customer sees.
          */}
          <SegmentedControl
            segments={[
              { value: 'en', label: 'English' },
              { value: 'ur', label: 'اردو' },
            ]}
            value={locale}
            onChange={setLocale}
          />
        </View>

        {/* ── Type scale ─────────────────────────────────────────────── */}
        <Stack gap="sm">
          <SectionHeader urdu={isUrdu} title="Type scale" />
          {/*
            Sizes are READ FROM the type scale, never typed beside it.

            Every label here was a hardcoded string, and every one of them had
            gone stale: this specimen sheet announced "Hero 44 · Heading one 26 ·
            Heading two 21 · Heading three 17" while `typography` actually held
            40 / 27 / 22 / 18, and the subtitle still said "v3 Royal" three
            versions later. A reference sheet that misreports the system is worse
            than no reference sheet, because it is the thing you check against.

            Deriving the number from `typography[variant].fontSize` means the
            label cannot disagree with the specimen it labels.
          */}
          {TYPE_SPECIMENS.map((v) => (
            <Text key={v} variant={v}>
              {`${SPECIMEN_LABEL[v]} ${typography[v].fontSize}`}
            </Text>
          ))}
          <Text variant="display" italic tone="gold">Italic gold — romantic only</Text>
          <Text variant="body" urdu>اسلام علیکم — نستعلیق</Text>
        </Stack>

        {/* ── Tones ──────────────────────────────────────────────────── */}
        <Stack gap="xs">
          <SectionHeader urdu={isUrdu} title="Tones" />
          {(['primary', 'body', 'muted', 'faint', 'label', 'gold', 'shaadi', 'success', 'warning', 'danger'] as const).map(
            (tone) => (
              <Text key={tone} variant="body" tone={tone}>
                {tone}
              </Text>
            ),
          )}
          <View style={{ backgroundColor: t.colors.surfaceInverse, padding: 12, borderRadius: t.radius.md }}>
            <Text variant="body" tone="onDark">onDark — on the royal surface</Text>
          </View>
        </Stack>

        {/* ── Buttons ────────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="Button — variants" />
          <Button urdu={isUrdu} label="Primary" onPress={() => {}} />
          <Button urdu={isUrdu} label="Secondary" variant="secondary" onPress={() => {}} />
          <Button urdu={isUrdu} label="Ghost" variant="ghost" onPress={() => {}} />
          <Button urdu={isUrdu} label="Danger" variant="danger" onPress={() => {}} />
          <SectionHeader urdu={isUrdu} title="Button — sizes and states" />
          <Button urdu={isUrdu} label="Small" size="sm" onPress={() => {}} />
          <Button urdu={isUrdu} label="Large with icon" size="lg" icon="calendar-outline" onPress={() => {}} />
          <Button urdu={isUrdu} label="Loading holds its width" loading onPress={() => {}} />
          <Button urdu={isUrdu} label="Disabled" disabled onPress={() => {}} />
          <Button urdu={isUrdu} label="Full width" fullWidth onPress={() => {}} />
        </Stack>

        {/* ── Cards ──────────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="Card — depth budget" />
          <Card variant="flat"><Text variant="body">flat — no shadow</Text></Card>
          <Card variant="rise" onPress={() => {}}><Text variant="body">rise — the default</Text></Card>
          <Card variant="focus"><Text variant="body">focus — ONE per screen</Text></Card>
        </Stack>

        {/* ── Chips ──────────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="Chip" />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Chip urdu={isUrdu} label="Default" onPress={() => {}} />
            <Chip urdu={isUrdu} label="Selected" selected onPress={() => {}} />
            <Chip urdu={isUrdu} label="Lahore" dismissible onPress={() => {}} />
            <Chip urdu={isUrdu} label="With count" count={716} onPress={() => {}} />
            <Chip urdu={isUrdu} label="Disabled" disabled />
          </View>
          <ChipSelect urdu={isUrdu}
            options={[
              { value: 'v', label: 'Venues', count: 716 },
              { value: 'p', label: 'Photo', count: 60 },
              { value: 'c', label: 'Catering', count: 60 },
            ]}
            value={chip}
            onChange={setChip}
            allLabel="All"
            allCount={3274}
          />
        </Stack>

        {/* ── Badges ─────────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="Badge — tones" />
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <Badge urdu={isUrdu} label="Verified" tone="verified" />
            <Badge urdu={isUrdu} label="Elite" tone="elite" />
            <Badge urdu={isUrdu} label="New" tone="shaadi" />
            <Badge urdu={isUrdu} label="Gold" tone="gold" />
            <Badge urdu={isUrdu} label="Paid" tone="success" />
            <Badge urdu={isUrdu} label="Pending" tone="warning" />
            <Badge urdu={isUrdu} label="Cancelled" tone="danger" />
            <Badge urdu={isUrdu} label="Away" tone="dark" icon="airplane-outline" />
            <Badge urdu={isUrdu} label="Verified" tone="verified" iconOnly />
          </View>
        </Stack>

        {/* ── TrustRow — MB1 ─────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="TrustRow — above the fold, always" />
          <TrustRow urdu={isUrdu} rating={4.96} reviewCount={298} verificationTier={2} onPressReviews={() => {}} />
          <TrustRow urdu={isUrdu} rating={4.33} reviewCount={3} reliabilityTier="trusted" onPressReviews={() => {}} />
          <TrustRow urdu={isUrdu} reviewCount={0} verificationTier={0} reliabilityTier="newcomer" />
          <Text variant="caption" tone="muted">
            ↑ third has nothing earned → renders nothing, not a row of dashes
          </Text>
        </Stack>

        {/* ── VendorHostCard — MB2 ───────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="VendorHostCard — the vendor as a person" />
          <VendorHostCard urdu={isUrdu}
            ownerName="Rehman Yousaf"
            ownerBio="We have hosted Lahore weddings since 2019, from 200-guest mehndis to 900-guest baraats. Our team handles catering, décor and generator backup in-house so you deal with one person, not five."
            yearsInBusiness={5}
            weddingsCompleted={120}
            verified
            onPress={() => {}}
          />
          <VendorHostCard urdu={isUrdu} ownerName={null} />
          <Text variant="caption" tone="muted">↑ no owner name → hides entirely (98% of listings)</Text>
        </Stack>

        {/* ── SpecStrip ──────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="SpecStrip" />
          <SpecStrip urdu={isUrdu} specs={specs} />
          <SpecStrip urdu={isUrdu} specs={[{ icon: 'people-outline', value: 500, label: 'Seated' }]} />
          <Text variant="caption" tone="muted">↑ below 2 real facts → hides</Text>
        </Stack>

        {/* ── SegmentedControl ───────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="SegmentedControl" />
          <SegmentedControl segments={segments} value={mode} onChange={setMode} />
          <SegmentedControl
            segments={[
              { value: 'dates', label: 'Card', sub: 'minutes' },
              { value: 'months', label: 'JazzCash', sub: 'instant' },
              { value: 'flexible', label: 'Bank', sub: '1–2 days' },
            ]}
            value={mode}
            onChange={setMode}
          />
        </Stack>

        {/* ── Stepper ────────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="Stepper — long-press to ramp" />
          <Stepper urdu={isUrdu} value={guests} onChange={setGuests} min={10} max={2000} step={25} unit="guests" />
        </Stack>

        {/* ── Input ──────────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="Input — the message slot is always reserved" />
          <Input urdu={isUrdu} label="Full name" placeholder="Rehman Yousaf" value={text} onChangeText={setText} required />
          <Input urdu={isUrdu} label="With hint" placeholder="03001234567" hint="We only use this for booking updates." />
          <Input urdu={isUrdu} label="With error" value="abc" error="Enter a valid Pakistani mobile number." />
          <Input urdu={isUrdu} label="With suffix" placeholder="500" suffix={<Text variant="caption" tone="muted">guests</Text>} />
          <Input urdu={isUrdu} label="Disabled" value="Locked" editable={false} />
          <Input urdu={isUrdu} icon="search-outline" placeholder="Search vendors…" value={text} onChangeText={setText} onClear={() => setText('')} />
        </Stack>

        {/* ── Money ─────────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="Money — in green, owed red, never Rs 0" />
          <TotalsCard urdu={isUrdu}
            lines={[
              { label: 'Package · Gold', value: 620000 },
              { label: 'Décor add-on', value: 40000, signed: true },
            ]}
            total={{ label: 'Total', value: 660000 }}
            settlement={[
              { label: 'Advance paid', value: 66000, direction: 'in', note: '10% of Rs 660,000' },
              { label: 'Balance on the day', value: 594000, direction: 'out' },
            ]}
          />
          <MoneyRow urdu={isUrdu} label="Unpriced vendor" value={null} />
          <MoneyRow urdu={isUrdu} label="Zero is not a price" value={0} />
        </Stack>

        {/* ── Calendar ──────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="Calendar — 42 cells, dot row reserved" />
          <Calendar urdu={isUrdu}
            month={month}
            monthsToRender={4}
            onMonthVisible={setMonth}
            selected={day}
            onSelect={setDay}
            availability={availability}
          />
        </Stack>

        {/* ── Sheet ─────────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="Sheet — capped height, footer outside the scroll" />
          <Button urdu={isUrdu} label="Open sheet" variant="secondary" onPress={() => setSheetOpen(true)} />
        </Stack>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="Tabs — changes a VIEW, not a value" />
          <Tabs urdu={isUrdu}
            tabs={[
              { value: 'upcoming', label: 'Upcoming', count: 3 },
              { value: 'past', label: 'Past', count: 21 },
            ]}
            value={tab}
            onChange={setTab}
          />
        </Stack>

        {/* ── StatusTimeline ────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="StatusTimeline — what is waiting on me?" />
          <StatusTimeline urdu={isUrdu}
            steps={[
              { label: 'Requested', timestamp: '14 Aug, 3:40 PM', state: 'done' },
              { label: 'Confirmed by vendor', timestamp: '15 Aug, 11:02 AM', state: 'done' },
              { label: 'Advance payment', state: 'current', note: 'Rs 66,000 due to hold your date' },
              { label: 'Event day', timestamp: '14 Sep', state: 'future' },
            ]}
          />
          <StatusTimeline urdu={isUrdu}
            steps={[
              { label: 'Requested', timestamp: '2 Aug', state: 'done' },
              { label: 'Cancelled', timestamp: '4 Aug', state: 'failed', note: 'Vendor unavailable — refund issued' },
            ]}
          />
        </Stack>

        {/* ── SlotPicker ────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="SlotPicker — template engine" />
          <SlotPicker urdu={isUrdu}
            rows={[
              { slotTemplateId: 1, label: 'Baraat', startTime: '19:00', endTime: '23:00', capacity: 3, used: 1, free: 2, unitGuestCapacity: 900 },
              { slotTemplateId: 2, label: 'Evening', startTime: '18:00', endTime: '22:00', capacity: 4, used: 3, free: 1, unitGuestCapacity: 600 },
              { slotTemplateId: 3, label: 'Midday', startTime: '12:00', endTime: '16:00', capacity: 2, used: 2, free: 0 },
              { slotTemplateId: 4, label: 'Small hall', startTime: '10:00', endTime: '14:00', capacity: 5, used: 0, free: 5, unitGuestCapacity: 150 },
            ]}
            selected={slot}
            onSelect={setSlot}
            guestCount={500}
          />
          <Text variant="caption" tone="muted">
            ↑ Midday booked out · Small hall caps at 150 guests, party is 500
          </Text>
          <SectionHeader urdu={isUrdu} title="SlotPicker — legacy periods (no templates)" />
          <SlotPicker urdu={isUrdu} selected={slot} onSelect={setSlot} />
        </Stack>

        {/* ── PriceHistogram ────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="PriceHistogram — MB14, honest about coverage" />
          <PriceHistogram urdu={isUrdu} prices={samplePrices} min={200000} max={900000} />
        </Stack>

        {/* ── FormField ─────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="FormField — validates on blur, not per keystroke" />
          <DraftResumeBanner urdu={isUrdu} savedAt="2 hours ago" onResume={() => {}} onDiscard={() => {}} />
          <FormField urdu={isUrdu}
            label="Phone number"
            placeholder="03001234567"
            value={phone}
            onChangeText={setPhone}
            required
            maxLength={11}
            showCounter
            hint="Tap away to validate."
            validate={(v) => (/^03\d{9}$/.test(v) ? null : 'Enter an 11-digit number starting 03.')}
          />
        </Stack>

        {/* ── Toast ─────────────────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="Toast — copy matches the control" />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Chip urdu={isUrdu} label="Success" onPress={() => toast.success('Saved to your shortlist')} />
            <Chip urdu={isUrdu} label="Error + retry" onPress={() => toast.error('Could not reach the server. Check your connection.', { label: 'Retry', onPress: () => {} })} />
            <Chip urdu={isUrdu} label="Info" onPress={() => toast.info('Your date is held for 20 minutes')} />
          </View>
        </Stack>

        {/* ── MonogramFallback ──────────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="MonogramFallback — the 98% path" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {['Afsana Marquee', 'Zouq e Chiniot', null].map((n, i) => (
              <View key={i} style={{ flex: 1, height: 96, borderRadius: t.radius.md, overflow: 'hidden', borderWidth: t.layout.hairline, borderColor: t.colors.border }}>
                <MonogramFallback name={n} size={34} arch />
              </View>
            ))}
          </View>
        </Stack>

        {/* ── Skeleton + EmptyState ─────────────────────────────────── */}
        <Stack gap="md">
          <SectionHeader urdu={isUrdu} title="Skeleton — shaped like real content" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[0, 1].map((i) => (
              <View key={i} style={{ flex: 1, gap: 8 }}>
                <Skeleton height={110} radius={t.radius.md} />
                <Skeleton height={14} width="80%" />
                <Skeleton height={12} width="50%" />
              </View>
            ))}
          </View>
          <SectionHeader urdu={isUrdu} title="EmptyState — always an action" />
          <EmptyState urdu={isUrdu}
            icon="heart-outline"
            title="No saved vendors yet"
            message="Tap the heart on any vendor to build your shortlist."
            actionLabel="Explore vendors"
            onAction={() => {}}
          />
        </Stack>
      </Stack>

      <Sheet urdu={isUrdu}
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        resetLabel="Clear all"
        onReset={() => {}}
        primaryLabel="Show 142 vendors"
        onPrimary={() => setSheetOpen(false)}
      >
        <Stack gap="lg">
          {Array.from({ length: 14 }, (_, i) => (
            <Input urdu={isUrdu} key={i} label={`Filter ${i + 1}`} placeholder="Deliberately long, to prove the cap" />
          ))}
        </Stack>
      </Sheet>
    </ScrollView>
  );
}
