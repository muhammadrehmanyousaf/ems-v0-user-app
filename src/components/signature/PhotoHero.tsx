/**
 * PhotoHero — **v4.** The vendor's photography, as a rounded card.
 *
 * Governed by rules.md §0.0. Sheet row: `components/signature/PhotoHero.tsx`.
 *
 * ── What changed ──────────────────────────────────────────────────────────
 *
 * v3 was a full-bleed image with a scrim top and bottom, an arch watermark
 * drawn over the photograph, and a row of paging dots. Four changes:
 *
 * 1. **It is a rounded card now**, inset from the screen edges, exactly as the
 *    founder's reference does it. A photograph that runs to all four edges reads
 *    as a banner; one with a visible corner radius reads as an object you are
 *    being shown. It is the single biggest difference between the reference's
 *    listing page and ours.
 *
 * 2. **Dots became a counter.** `1 / 10` in a glass pill. Ten dots at 4px on a
 *    360px screen is a smear that cannot be counted; a fraction tells you both
 *    where you are and how much is left, which is what the dots were failing to
 *    do. Below three images the counter hides — a `1 / 2` is noise.
 *
 * 3. **The arch came off the photograph.** A gold Mehrab drawn over someone's
 *    venue is our brand mark sitting on their building. It belongs on OUR
 *    surfaces — the hero panel, the empty-state fallback — not on their work.
 *    It remains on the fallback, where there is no photograph to intrude on.
 *
 * 4. **Controls are true circles with a light film**, not squares with a tint,
 *    and the top scrim stays because a white glyph on a bright marquee needs it.
 *
 * ── What was still missing after the v4 redraw ────────────────────────────
 *
 * The drawing was done; the localisation was not. Three accessibility labels —
 * "Back", "Share", "Save"/"Saved" — were hardcoded English literals, so a
 * customer running the app in Urdu with TalkBack heard the three controls on the
 * very first thing they see announced in a language they did not choose. They
 * are `common.*` / `detail.*` keys now.
 *
 * The control row also never mirrored. Back sat on the left in both interfaces,
 * which in Urdu is where "forward" lives — the one control whose position IS
 * its meaning, pointing the wrong way.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useT } from '@/i18n/useT';
import { img, IMG } from '@/lib/img';
import { gradients, goldScale, haptics, layout, overlay, useTheme } from '@/theme';

import { ArchOutline } from './ArchImage';
import { MonogramFallback } from './MonogramFallback';

export interface PhotoHeroProps {
  images: string[];
  height?: number;
  width: number;
  /** Fallback initial for vendors with no photography (98% are OSM imports). */
  fallbackInitial?: string;
  onBack?: () => void;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  /** Tapping the photo itself — usually opens the full-screen gallery. */
  onPressImage?: (index: number) => void;
}

/** A circular glass control. One shape for every button on the photograph. */
function GlassButton({
  icon,
  onPress,
  label,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  label: string;
  tint?: string;
}) {
  const t = useTheme();
  if (!onPress) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        haptics.light();
        onPress();
      }}
      style={{
        width: layout.tapTarget,
        height: layout.tapTarget,
        borderRadius: layout.tapTarget / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: overlay.onPhoto,
      }}
    >
      <Ionicons name={icon} size={20} color={tint ?? t.colors.textPrimary} />
    </Pressable>
  );
}

export function PhotoHero({
  images,
  height,
  width,
  fallbackInitial,
  onBack,
  favorite,
  onToggleFavorite,
  onShare,
  onPressImage,
}: PhotoHeroProps) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const [page, setPage] = useState(0);

  // Inset on both sides, so the card's radius is visible against the screen.
  const cardW = width - layout.gutter * 2;
  const cardH = height ?? Math.round(cardW * 0.92);
  const hasPhotos = images.length > 0;

  return (
    <View style={{ paddingHorizontal: layout.gutter, paddingTop: layout.gutter }}>
      <View
        style={{
          width: cardW,
          height: cardH,
          borderRadius: t.radius.xxl,
          overflow: 'hidden',
          backgroundColor: t.colors.sunken,
        }}
      >
        {hasPhotos ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setPage(Math.round(e.nativeEvent.contentOffset.x / cardW))
            }
          >
            {images.map((uri, i) => (
              <Pressable
                key={`${uri}-${i}`}
                accessibilityRole="button"
                accessibilityLabel={`${tr('detail.photoOf')} ${i + 1} / ${images.length}`}
                onPress={() => onPressImage?.(i)}
              >
                <Image
                  source={{ uri: img(uri, { ...IMG.hero, width: cardW }) ?? uri }}
                  style={{ width: cardW, height: cardH }}
                  contentFit="cover"
                  transition={220}
                />
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          /* No photography at all — ~98% of listings are unclaimed imports. The
             arch belongs HERE, where there is no one else's work to sit on. */
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <ArchOutline width={cardW * 0.4} height={cardW * 0.5} color={goldScale.hairline} />
            <View style={StyleSheet.absoluteFill}>
              <View style={[StyleSheet.absoluteFill, styles.center]}>
                <MonogramFallback name={fallbackInitial ?? '?'} size={64} />
              </View>
            </View>
          </View>
        )}

        {/* Top scrim: a white glyph on a bright marquee is unreadable without it. */}
        <LinearGradient colors={gradients.topScrim} style={styles.topScrim} pointerEvents="none" />

        <View
          style={[styles.controls, { flexDirection: isUrdu ? 'row-reverse' : 'row' }]}
          pointerEvents="box-none"
        >
          {/* The chevron POINTS. In Urdu, back is forward-facing and on the
              right, which is why this is not just a mirrored container. */}
          <GlassButton
            icon={isUrdu ? 'chevron-forward' : 'chevron-back'}
            onPress={onBack}
            label={tr('common.back')}
          />
          <View style={{ flexDirection: isUrdu ? 'row-reverse' : 'row', gap: t.spacing.sm }}>
            <GlassButton icon="share-outline" onPress={onShare} label={tr('detail.share')} />
            <GlassButton
              icon={favorite ? 'heart' : 'heart-outline'}
              onPress={onToggleFavorite}
              label={favorite ? tr('home.savedLabel') : tr('common.save')}
              tint={favorite ? t.colors.shaadi : undefined}
            />
          </View>
        </View>

        {/* `3 / 10` beats ten dots: it says where you are AND how much is left.
            Hidden under three images, where a counter is just noise. */}
        {images.length > 2 ? (
          <View style={[styles.counter, { backgroundColor: overlay.onPhotoInk }]}>
            <Text variant="mono" tone="onDark" style={{ fontSize: 12 }}>
              {`${page + 1} / ${images.length}`}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 96 },
  controls: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  counter: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
});
