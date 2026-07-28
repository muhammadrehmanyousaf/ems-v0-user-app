/**
 * TEMP showcase — renders the ported Bridal Design System for visual QA against
 * the live site. Replaced by the tab shell in Task 0.7.
 */
import { ScrollView, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  ChipSelect,
  Divider,
  EmptyState,
  Input,
  Rating,
  Row,
  Section,
  Skeleton,
  Stack,
  Text,
} from '@/components/ui';
import { useTheme } from '@/theme';
import { BridalWash, JaalPattern, ShimmerText } from '@/theme/textures';

export default function Showcase() {
  const t = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.colors.screen }} showsVerticalScrollIndicator={false}>
      {/* Hero — matches the live homepage feel */}
      <BridalWash style={{ paddingTop: 72, paddingBottom: 40, paddingHorizontal: 24 }}>
        <JaalPattern />
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Badge label="PAKISTAN'S #1 SHAADI PLATFORM" tone="rose" icon="heart" />
          <Text variant="overline" tone="label" align="center" style={{ marginTop: 8 }}>
            LIGHT · LUXURIOUS · UNFORGETTABLE
          </Text>
          <Text variant="hero" align="center" style={{ marginTop: 4 }}>
            Where every
          </Text>
          <ShimmerText fontSize={40}>love story finds</ShimmerText>
          <Text variant="hero" italic align="center">
            its perfect setting
          </Text>
          <Text variant="bodyLead" tone="muted" align="center" style={{ marginTop: 8 }}>
            From the first mehndi to the final rukhsati — discover Pakistan&apos;s most trusted vendors, all in one place.
          </Text>
        </View>
      </BridalWash>

      <Stack gap="xl" style={{ padding: 24 }}>
        <Section title="TYPOGRAPHY">
          <Card>
            <Stack gap="xs">
              <Text variant="display">Display · Playfair</Text>
              <Text variant="h1">Heading one</Text>
              <Text variant="h3">Heading three</Text>
              <Text variant="body">Body copy in DM Sans — calm, readable, warm charcoal ink on cream.</Text>
              <Text variant="caption" tone="muted">Caption / meta text</Text>
              <Text variant="overline" tone="label">OVERLINE LABEL</Text>
            </Stack>
          </Card>
        </Section>

        <Section title="BUTTONS">
          <Stack gap="sm">
            <Button label="Book this vendor" icon="calendar-outline" fullWidth />
            <Button label="Send an inquiry" variant="secondary" icon="chatbubble-outline" fullWidth />
            <Row gap="sm">
              <Button label="WhatsApp" variant="ghost" icon="logo-whatsapp" />
              <Button label="Share" variant="ghost" icon="share-outline" />
            </Row>
          </Stack>
        </Section>

        <Section title="INPUTS">
          <Stack gap="sm">
            <Input label="Which city?" icon="location-outline" placeholder="Lahore, Karachi, Islamabad…" />
            <Input label="Search" icon="search-outline" placeholder="Search by vendor name…" />
          </Stack>
        </Section>

        <Section title="CHIPS & BADGES">
          <Stack gap="sm">
            <ChipSelect
              options={[
                { value: 'photographers', label: 'Photographers' },
                { value: 'venues', label: 'Venues' },
                { value: 'catering', label: 'Catering' },
                { value: 'makeup', label: 'Makeup' },
              ]}
              value="venues"
              onChange={() => {}}
              allLabel="All"
            />
            <Row gap="sm" wrap>
              <Badge label="Verified" tone="gold" icon="checkmark-circle" />
              <Badge label="Featured" tone="rose" icon="star" />
              <Badge label="Available" tone="success" />
              <Badge label="Last spot" tone="danger" />
            </Row>
          </Stack>
        </Section>

        <Section title="CARD + RATING">
          <Card onPress={() => {}}>
            <Row justify="space-between">
              <Stack gap="xxs">
                <Text variant="title">Kasr-e-Noor Studio</Text>
                <Text variant="caption" tone="muted">Photographer · Lahore</Text>
                <Text variant="bodyMedium" tone="gold">From Rs 85,000</Text>
              </Stack>
              <Rating value={4.8} reviewCount={126} />
            </Row>
          </Card>
        </Section>

        <Section title="LOADING">
          <Stack gap="sm">
            <Skeleton height={20} width="60%" />
            <Skeleton height={14} width="90%" />
            <Skeleton height={14} width="80%" />
          </Stack>
        </Section>

        <Section title="EMPTY STATE">
          <Card padded={false}>
            <EmptyState
              icon="heart-outline"
              title="No favourites yet"
              message="Tap the heart on any vendor to save them here."
              actionLabel="Explore vendors"
              onAction={() => {}}
            />
          </Card>
        </Section>

        <Divider />
        <Text variant="caption" tone="muted" align="center">
          Bridal Design System — ported from weddingwala.pk
        </Text>
      </Stack>
    </ScrollView>
  );
}
