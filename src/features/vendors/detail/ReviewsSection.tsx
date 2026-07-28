/** ReviewsSection — rating summary + individual reviews (live). */
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { ScrollView, View } from 'react-native';

import { Divider, Row, Section, Skeleton, Stack, Text } from '@/components/ui';
import { useVendorReviews } from '@/features/vendors/vendors.queries';
import type { Review } from '@/features/vendors/vendors.types';
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

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const t = useTheme();
  return (
    <Row gap="xxs">
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={value >= i ? 'star' : value >= i - 0.5 ? 'star-half' : 'star-outline'}
          size={size}
          color={t.colors.gold}
        />
      ))}
    </Row>
  );
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
  const q = useVendorReviews(vendorId);
  const reviews = q.data ?? [];

  return (
    <Section title="REVIEWS">
      {reviewCount > 0 ? (
        <Row gap="md" style={{ marginBottom: t.spacing.sm }}>
          <Text variant="display" tone="gold">
            {rating.toFixed(1)}
          </Text>
          <Stack gap="xxs">
            <Stars value={rating} size={16} />
            <Text variant="caption" tone="muted">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </Text>
          </Stack>
        </Row>
      ) : null}

      {q.isLoading ? (
        <Stack gap="sm">
          <Skeleton height={14} width="40%" />
          <Skeleton height={12} width="90%" />
        </Stack>
      ) : reviews.length === 0 ? (
        <Text variant="body" tone="muted">
          No reviews yet — be the first to review after your event.
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
                  <Stars value={Number(r.rating) || 0} />
                  {text ? (
                    <Text variant="body" tone="body">
                      {text}
                    </Text>
                  ) : null}
                  {imgs.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 4 }}>
                      {imgs.map((uri, j) => (
                        <Image key={j} source={{ uri }} style={{ width: 96, height: 96, borderRadius: t.radius.sm, backgroundColor: t.colors.sand }} contentFit="cover" />
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
