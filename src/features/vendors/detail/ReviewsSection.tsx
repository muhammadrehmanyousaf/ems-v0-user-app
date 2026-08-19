/**
 * ReviewsSection — rating summary + individual reviews (live). Redrawn on v4.
 *
 * ── The local `Stars` component was the whole problem ─────────────────────
 *
 * This file drew its own five-gold-star row, once for the summary and once per
 * review. `Rating.tsx` — already redrawn, and its header states the reasoning —
 * retired exactly that: five glyphs where four of them carry no information the
 * number does not already give, in the accent colour, repeated down the page.
 * On a vendor with ten reviews that was **fifty-five gold stars plus a gold
 * display-size score** on one screen.
 *
 * So the local copy is gone and the shared `Rating` is used in both places.
 * Two components drawing the same thing differently is how a design system
 * stops being one; and `Rating` also handles the unrated case (~98% of listings
 * are unclaimed imports), which the local version rendered as five hollow stars
 * — a bad score rather than no score.
 *
 * The summary score drops `tone="gold"` with them. A rating is information, the
 * same as money is, and the rule money follows applies here: gold means action,
 * and a score is not an action.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { ScrollView, View } from 'react-native';

import { Divider, Rating, Row, Section, Skeleton, Stack, Text } from '@/components/ui';
import { useVendorReviews } from '@/features/vendors/vendors.queries';
import type { Review } from '@/features/vendors/vendors.types';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}
function reviewAuthor(r: Review): string {
  return str(r.authorName) ?? str(r['reviewerName']) ?? str(r['userName']) ?? str(r['name']) ?? 'Guest';
}
function reviewText(r: Review): string | null {
  return str(r.comment) ?? str(r['text']) ?? str(r['review']) ?? str(r['body']);
}
function reviewDate(r: Review): string | null {
  const d = str(r.createdAt) ?? str(r['date']);
  if (!d) return null;
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleDateString('en-PK', { year: 'numeric', month: 'short' });
}

export function ReviewsSection({
  vendorId,
  rating,
  reviewCount,
}: {
  vendorId: number | string;
  rating: number;
  reviewCount: number;
}) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const q = useVendorReviews(vendorId);
  const reviews = q.data ?? [];

  return (
    <Section title={tr('detail.reviews')} urdu={isUrdu}>
      {reviewCount > 0 ? (
        <Row gap="md" style={{ marginBottom: t.spacing.md, alignItems: 'center' }}>
          {/* Ink, not gold. Display 32 against a caption is the hierarchy;
              the colour was never carrying it. */}
          <Text variant="display" tone="primary">
            {rating.toFixed(1)}
          </Text>
          {/* Star INLINE with the count, not stacked above it. Stacked, the
              16px glyph aligned to the top of a 32px numeral and read as a
              stray mark rather than as part of the rating. */}
          <Row gap="xxs" style={{ alignItems: 'center' }}>
            <Ionicons name="star" size={15} color={t.colors.textPrimary} />
            <Text variant="caption" tone="muted" urdu={isUrdu}>
              {`${reviewCount.toLocaleString('en-PK')} ${tr('detail.reviewsCount')}`}
            </Text>
          </Row>
        </Row>
      ) : null}

      {q.isLoading ? (
        <Stack gap="sm">
          <Skeleton height={14} width="40%" />
          <Skeleton height={12} width="90%" />
        </Stack>
      ) : reviews.length === 0 ? (
        <Text variant="body" tone="muted" urdu={isUrdu}>
          {tr('detail.noReviews')}
        </Text>
      ) : (
        <Stack gap="md">
          {reviews.map((r, i) => {
            const text = reviewText(r);
            const imgs = Array.isArray(r.images) ? r.images.filter((u): u is string => typeof u === 'string') : [];
            return (
              <View key={r.id ?? i}>
                {i > 0 ? <Divider style={{ marginBottom: t.spacing.md }} /> : null}
                <Stack gap="xs">
                  <Row justify="space-between">
                    <Text variant="title">{reviewAuthor(r)}</Text>
                    {reviewDate(r) ? (
                      <Text variant="caption" tone="muted">
                        {reviewDate(r)}
                      </Text>
                    ) : null}
                  </Row>
                  {/* The shared component, so a review's score looks exactly
                      like the score on the card that brought you here. */}
                  <Rating value={Number(r.rating) || 0} size={13} urdu={isUrdu} />
                  {text ? (
                    <Text variant="body" tone="body">
                      {text}
                    </Text>
                  ) : null}
                  {imgs.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 4 }}>
                      {imgs.map((uri, j) => (
                        <Image key={j} source={{ uri }} style={{ width: 96, height: 96, borderRadius: t.radius.sm, backgroundColor: t.colors.sunken }} contentFit="cover" />
                      ))}
                    </ScrollView>
                  ) : null}
                </Stack>
              </View>
            );
          })}
        </Stack>
      )}
    </Section>
  );
}
