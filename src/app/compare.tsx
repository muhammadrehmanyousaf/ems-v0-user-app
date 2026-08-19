/**
 * Compare - up to four vendors side by side. Redrawn on v4.
 *
 * -- The comparison table was written in English ---------------------------
 *
 * `ROWS` built its own values as literals: `'New'`, `'Yes'`, `'No'`, `'-'`, and
 * `` `${seats} guests` ``. Every LABEL down the left came from the string file
 * and every VALUE beside it did not, so an Urdu customer got a translated table
 * of English answers. They are keys now, and the row builder takes the
 * translator instead of closing over nothing.
 *
 * `reliability.tier` is still the raw backend enum. That is deliberate and
 * flagged rather than hidden: the tiers are not in the string file and inventing
 * translations for a vocabulary the vendor portal also shows would risk the two
 * surfaces disagreeing about what a vendor has been told they are.
 *
 * -- "View profile" was a Badge pretending to be a button ------------------
 *
 * A `Badge` in `tone="gold"` inside a bare `Pressable`: no `accessibilityRole`,
 * nothing that reads as a control, and gold where gold means "action" but the
 * shape says "status". Same mistake the guest list made with its RSVP chip. It
 * is a real button now.
 *
 * -- And the usual four ----------------------------------------------------
 *
 * A hand-rolled header with the ink-on-near-black back chevron; `variant="display"`
 * overridden inline to `fontSize: 27` to fake `h1`; seven gold-brown `tone="label"`
 * overlines down the label column; and an untyped `router.push` template literal,
 * which is the cast class that once hid a route that never existed.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueries } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, Row, ScreenHeader, Text } from '@/components/ui';
import {
  isVerified,
  vendorCategoryLabel,
  vendorPriceLabel,
  vendorPrimaryImage,
} from '@/features/vendors/vendor-display';
import type { Vendor } from '@/features/vendors/vendors.types';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { getBusinessById } from '@/lib/api/endpoints/vendors';
import { img, IMG } from '@/lib/img';
import { useCompareStore } from '@/store/compare';
import { haptics, layout, overlay, useTheme } from '@/theme';

const ROW_H = 52;
const COL_W = 156;
const LABEL_W = 108;

type Tr = (k: StringKey) => string;

/**
 * The comparison table. `get` takes the translator, so a VALUE can be a string
 * from the file rather than an English literal baked into this array.
 */
const ROWS: { labelKey: StringKey; get: (v: Vendor, tr: Tr, isUrdu: boolean) => string }[] = [
  { labelKey: 'compare.type', get: (v, _tr, isUrdu) => vendorCategoryLabel(v, isUrdu) },
  { labelKey: 'compare.city', get: (v, tr) => v.city ?? v.vendor?.city ?? tr('common.notGiven') },
  {
    labelKey: 'compare.rating',
    get: (v, tr) =>
      v.reviewCount > 0 ? `${v.rating.toFixed(1)} (${v.reviewCount})` : tr('detail.newListing'),
  },
  {
    labelKey: 'compare.startingPrice',
    get: (v, tr) => vendorPriceLabel(v, { from: tr('price.from'), onRequest: tr('price.onRequest') }).text,
  },
  {
    labelKey: 'compare.capacity',
    // Prefer the seated-comfort figure the vendor actually sells over the raw
    // max - comparing a seated number against someone else's standing number is
    // a false comparison, and seated is what a wedding is booked on.
    get: (v, tr) => {
      const seats = v.seatedCapacity ?? v.maxCapacity;
      return seats ? `${seats} ${tr('home.guestsRange')}` : tr('common.notGiven');
    },
  },
  { labelKey: 'compare.verified', get: (v, tr) => (isVerified(v) ? tr('common.yes') : tr('common.no')) },
  // The raw backend tier. See the header note - not translated on purpose.
  { labelKey: 'compare.reliability', get: (v, tr) => v.reliability?.tier ?? tr('common.notGiven') },
];

export default function Compare() {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const insets = useSafeAreaInsets();
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);

  const results = useQueries({
    queries: ids.map((id) => ({ queryKey: ['vendor', String(id)], queryFn: () => getBusinessById(id), staleTime: 600000 })),
  });
  const vendors = results.map((r) => r.data).filter((v): v is Vendor => !!v);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen }}>
      <ScreenHeader
        title={tr('compare.title')}
        subtitle={vendors.length >= 2 ? `${vendors.length} ${tr('home.vendors')}` : undefined}
        onBack={() => router.back()}
        backLabel={tr('common.back')}
        urdu={isUrdu}
      />

      {vendors.length < 2 ? (
        <EmptyState
          icon="git-compare-outline"
          title={tr('compare.emptyTitle')}
          message={tr('compare.emptySub')}
          actionLabel={tr('common.exploreVendors')}
          onAction={() => router.push('/explore')}
          urdu={isUrdu}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: layout.gutter,
            paddingBottom: insets.bottom + t.spacing.vast,
          }}
        >
          <Row align="flex-start">
            {/* Labels column */}
            <View style={{ width: LABEL_W }}>
              <View style={{ height: 150 }} />
              {ROWS.map((r) => (
                <View key={r.labelKey} style={{ height: ROW_H, justifyContent: 'center' }}>
                  {/* Muted, not `tone="label"` - that is gold-brown, and seven
                      of them down one column is the accent used as a ruler. */}
                  <Text variant="overline" tone="muted" urdu={isUrdu}>
                    {tr(r.labelKey)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Vendor columns */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Row align="flex-start" gap="md">
                {vendors.map((v) => {
                  const cover = img(vendorPrimaryImage(v), { ...IMG.compare, width: COL_W });
                  return (
                    <View key={v.id} style={{ width: COL_W }}>
                      {/* Header */}
                      <View style={{ height: 150 }}>
                        <View style={{ position: 'relative' }}>
                          {cover ? (
                            <Image source={{ uri: cover }} style={{ width: COL_W, height: 96, borderRadius: t.radius.md, backgroundColor: t.colors.sunken }} contentFit="cover" />
                          ) : (
                            <View style={{ width: COL_W, height: 96, borderRadius: t.radius.md, backgroundColor: t.colors.sunken, alignItems: 'center', justifyContent: 'center' }}>
                              <Ionicons name="image-outline" size={24} color={t.colors.textFaint} />
                            </View>
                          )}
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${tr('common.dismiss')}: ${v.name}`}
                            onPress={() => {
                              haptics.light();
                              remove(v.id);
                            }}
                            hitSlop={10}
                            style={({ pressed }) => ({
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: overlay.onPhoto,
                              borderRadius: t.radius.pill,
                              width: 26,
                              height: 26,
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: pressed ? 0.6 : 1,
                            })}
                          >
                            <Ionicons name="close" size={15} color={t.colors.textPrimary} />
                          </Pressable>
                        </View>
                        <Text variant="bodyMedium" numberOfLines={2} style={{ marginTop: 6 }}>
                          {v.name}
                        </Text>
                      </View>
                      {/* Values */}
                      {ROWS.map((r) => (
                        <View key={r.labelKey} style={{ height: ROW_H, justifyContent: 'center', borderTopWidth: 1, borderTopColor: t.colors.border }}>
                          <Text variant="caption" tone="body" numberOfLines={2}>
                            {r.get(v, tr, isUrdu)}
                          </Text>
                        </View>
                      ))}
                      {/* A real button. It was a gold `Badge` inside a bare
                          `Pressable` - a status shape carrying an action, with
                          no role for a screen reader. */}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${tr('compare.viewProfile')}: ${v.name}`}
                        onPress={() => {
                          haptics.light();
                          // Typed against the real route tree, not a template
                          // literal - the cast class that once hid a route
                          // which never existed.
                          router.push({ pathname: '/vendor/[id]', params: { id: String(v.id) } });
                        }}
                        style={({ pressed }) => ({
                          marginTop: t.spacing.md,
                          flexDirection: isUrdu ? 'row-reverse' : 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          height: 38,
                          borderRadius: t.radius.pill,
                          borderWidth: t.layout.hairline,
                          borderColor: t.colors.borderStrong,
                          backgroundColor: pressed ? t.colors.sunken : 'transparent',
                        })}
                      >
                        <Text variant="label" tone="primary" urdu={isUrdu} numberOfLines={1}>
                          {tr('compare.viewProfile')}
                        </Text>
                        <Ionicons
                          name={isUrdu ? 'arrow-back' : 'arrow-forward'}
                          size={14}
                          color={t.colors.textPrimary}
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </Row>
            </ScrollView>
          </Row>
        </ScrollView>
      )}
    </View>
  );
}
