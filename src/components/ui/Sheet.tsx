/**
 * Sheet — spec: docs/05-UI-SPEC.md §12.
 *
 * ── The height cap is the whole point ────────────────────────────────────
 *
 * The web's shared `DialogContent` sets no `max-h`. Tall dialogs there push
 * their action row off the bottom of a 360px screen, so the customer can read
 * the form but cannot submit it. That is the single most-repeated layout defect
 * in this product, and it is repeated because nothing structurally prevented it.
 *
 * This component prevents it: `maxHeight` is capped, the body scrolls INTERNALLY,
 * and the footer is rendered OUTSIDE the scroll view. A sheet built with this
 * cannot hide its own actions, however much content it is given.
 *
 * ── Why this is a React Native `Modal` and not `@gorhom/bottom-sheet` ─────
 *
 * It was a `BottomSheetModal`, and it **did not present at all on the web
 * preview** — the sheet simply never entered the accessibility tree when
 * `present()` was called. The full-screen gallery on the vendor screen, which
 * uses the same library the same way, fails identically. So the failure is the
 * library on this platform, not a mistake at one call site.
 *
 * That mattered more than a preview inconvenience. `Sheet` had no production
 * call site at all — `FilterSheet` rolls its own `Modal`, so the one specced
 * sheet primitive in the app had never been exercised by anything a customer
 * touches. Putting the inquiry form (the marketplace's core discovery→contact
 * transaction, and until recently unreachable entirely) onto an untested
 * presentation path that provably fails on the one surface available for
 * verification is not a trade worth making.
 *
 * `Modal` costs the drag-to-dismiss gesture. It buys a sheet that can be driven
 * and seen. The grabber stays as an affordance and the backdrop closes on tap,
 * which is how the sheet was actually dismissed in practice anyway.
 *
 * ── Footer grammar ──────────────────────────────────────────────────────
 *
 * Reset/Clear bottom-LEFT as a text button, the advancing action bottom-RIGHT.
 * Taken from Airbnb's filter sheet and date picker, which use the same grammar
 * in both — see docs/07-DESIGN-RESEARCH.md §7b.4. Never a full-width CTA in a
 * sheet: full-width says "this is the only thing you can do", which is false
 * whenever a reset exists.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n/useT';
import { haptics, overlay, useTheme } from '@/theme';

import { Text } from './Text';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Bottom-left text button — "Clear all", "Reset". */
  resetLabel?: string;
  onReset?: () => void;
  /** Bottom-right advancing action. Usually carries a live count. */
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  /** In flight. Disables the action and swaps the label for a spinner, so a
   *  form that posts to the network cannot be submitted twice by a customer on
   *  a slow Pakistani mobile connection watching a button that looks idle. */
  primaryLoading?: boolean;
  /**
   * A form-level error — a failed submit, a missing required channel.
   *
   * It renders ABOVE the footer, pinned outside the scroll, and it lives here
   * rather than in the caller's body for the reason the height cap exists.
   * When the inquiry sheet rendered its own error at the bottom of the form,
   * pressing "Send inquiry" on a 360px screen put the explanation two screens
   * below the fold: the button appeared to do nothing at all. An action and the
   * reason it refused have to be visible at the same time.
   */
  error?: string | null;
  /** Fraction of screen height the sheet may occupy. Never above 0.92. */
  maxHeightRatio?: number;
  urdu?: boolean;
}

export function Sheet({
  visible,
  onClose,
  title,
  children,
  resetLabel,
  onReset,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryLoading,
  error,
  maxHeightRatio = 0.88,
  urdu,
}: SheetProps) {
  const t = useTheme();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();

  // Hard ceiling. A caller asking for 0.99 gets 0.92 — above that the sheet
  // stops reading as a layer over the screen and the grabber is unreachable.
  const maxHeight = Math.round(screenH * Math.min(maxHeightRatio, 0.92));

  const hasFooter = !!(primaryLabel || resetLabel || error);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* Backdrop. Its own layer so a tap outside the sheet closes it, and so
            the sheet body's own presses never reach it. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr('common.close')}
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: overlay.backdrop }]}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          // The cap lives on the OUTER box, so the body scroll and the footer
          // divide the capped height between them rather than the footer being
          // pushed past the bottom edge by a tall body.
          style={{ maxHeight }}
        >
          <View
            style={{
              backgroundColor: t.colors.surface,
              // `xxl` (28), matching PhotoHero and the hero panel. A sheet with
              // a tighter radius than the cards it slides over reads as a
              // different material — the corner radius is what tells you two
              // surfaces belong to the same product.
              borderTopLeftRadius: t.radius.xxl,
              borderTopRightRadius: t.radius.xxl,
              overflow: 'hidden',
              maxHeight,
            }}
          >
            {/* Grabber. 44×5, not 36×4: at 4px on a mid-range Android screen it
                disappears into the top edge. */}
            <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
              <View
                style={{
                  width: 44,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: t.colors.borderStrong,
                }}
              />
            </View>

            {title ? (
              <View
                style={[
                  styles.header,
                  {
                    flexDirection: urdu ? 'row-reverse' : 'row',
                    paddingHorizontal: t.spacing.xl,
                    borderBottomColor: t.colors.divider,
                  },
                ]}
              >
                <Text
                  variant="h2"
                  urdu={urdu}
                  numberOfLines={1}
                  style={{ flex: 1, textAlign: urdu ? 'right' : 'left' }}
                >
                  {title}
                </Text>
                {/*
                  Close is a circular target, not a bare glyph.
                  A 22px icon with `hitSlop` measures 22px to the eye — and this
                  is the control a customer reaches for one-handed at the top of
                  a sheet, the furthest point from the thumb. It gets a real
                  40px surface so it can be hit without looking.
                */}
                <Pressable
                  onPress={() => {
                    haptics.light();
                    onClose();
                  }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={tr('common.close')}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: t.colors.sunken,
                  }}
                >
                  <Ionicons name="close" size={20} color={t.colors.textPrimary} />
                </Pressable>
              </View>
            ) : null}

            {/* The body scrolls. The footer below does not live in here. */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: t.spacing.xl,
                paddingTop: t.spacing.lg,
                paddingBottom: hasFooter ? t.spacing.xl : t.spacing.xl + insets.bottom,
              }}
            >
              {children}
            </ScrollView>

            {hasFooter ? (
              <View
                style={{
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: t.colors.divider,
                  backgroundColor: t.colors.surface,
                }}
              >
                {error ? (
                  <View
                    style={{
                      paddingHorizontal: t.spacing.xl,
                      paddingTop: t.spacing.md,
                    }}
                  >
                    <Text
                      variant="caption"
                      tone="danger"
                      urdu={urdu}
                      accessibilityLiveRegion="polite"
                      style={{ textAlign: urdu ? 'right' : 'left' }}
                    >
                      {error}
                    </Text>
                  </View>
                ) : null}
                <View
                style={[
                  styles.footerRow,
                  {
                    flexDirection: urdu ? 'row-reverse' : 'row',
                    paddingHorizontal: t.spacing.xl,
                    paddingTop: t.spacing.md,
                    paddingBottom: t.spacing.md + insets.bottom,
                  },
                ]}
              >
                {resetLabel && onReset ? (
                  <Pressable
                    onPress={() => {
                      haptics.light();
                      onReset();
                    }}
                    hitSlop={8}
                    accessibilityRole="button"
                  >
                    <Text variant="label" tone="body" urdu={urdu} style={styles.underline}>
                      {resetLabel}
                    </Text>
                  </Pressable>
                ) : (
                  <View />
                )}

                {primaryLabel && onPrimary ? (
                  <Pressable
                    onPress={() => {
                      haptics.medium();
                      onPrimary();
                    }}
                    disabled={primaryDisabled || primaryLoading}
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: !!(primaryDisabled || primaryLoading),
                      busy: !!primaryLoading,
                    }}
                    style={{
                      height: 46,
                      // The width is held while the spinner shows, so the
                      // footer does not jump the moment the customer presses.
                      minWidth: 140,
                      paddingHorizontal: t.spacing.xl,
                      borderRadius: t.radius.sm,
                      backgroundColor: t.colors.surfaceInverse,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: primaryDisabled && !primaryLoading ? 0.45 : 1,
                    }}
                  >
                    {primaryLoading ? (
                      <ActivityIndicator size="small" color={t.colors.onDark} />
                    ) : (
                      <Text variant="button" tone="onDark" urdu={urdu} numberOfLines={1}>
                        {primaryLabel}
                      </Text>
                    )}
                  </Pressable>
                ) : null}
                </View>
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  footerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  underline: { textDecorationLine: 'underline' },
});
