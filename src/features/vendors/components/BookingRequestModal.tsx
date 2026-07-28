/**
 * BookingRequestModal — a structured booking request (event type, date, guests,
 * package) → POST /leads/inquiry. The PK-appropriate "booking": the vendor gets
 * the full request and confirms directly (weddings settle in cash, not online).
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';

import { Button, ChipSelect, Divider, Input, Row, Stack, Text } from '@/components/ui';
import { submitInquiry } from '@/lib/api/endpoints/vendors';
import { useAuthStore } from '@/store/auth';
import { haptics, useTheme } from '@/theme';

import type { VendorPackage } from '../vendors.types';

const EVENT_TYPES = [
  { value: 'Mehndi', label: 'Mehndi' },
  { value: 'Barat', label: 'Barat' },
  { value: 'Nikah', label: 'Nikah' },
  { value: 'Walima', label: 'Walima' },
  { value: 'Reception', label: 'Reception' },
  { value: 'Other', label: 'Other' },
];

export function BookingRequestModal({
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
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [eventType, setEventType] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState('');
  const [guests, setGuests] = useState(200);
  const [pkg, setPkg] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setName(user?.name ?? '');
      setPhone(user?.phoneNumber ?? '');
      setEventType(null);
      setEventDate('');
      setGuests(200);
      setPkg(null);
      setMessage('');
      setError(null);
      setDone(false);
    }
  }

  const packageOptions = packages
    .map((p, i) => ({ value: String(p.id ?? i), label: p.name ?? `Package ${i + 1}` }))
    .slice(0, 8);

  const submit = async () => {
    if (!name.trim() && !phone.trim()) {
      setError('Please add your name or phone so the vendor can reach you.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const pkgName = packageOptions.find((o) => o.value === pkg)?.label;
    const parts = [
      pkgName ? `Package: ${pkgName}.` : null,
      message.trim() || null,
    ].filter(Boolean);
    try {
      await submitInquiry({
        businessId,
        name: name.trim() || undefined,
        phoneNumber: phone.trim() || undefined,
        eventType: eventType ?? undefined,
        eventDate: eventDate.trim() || undefined,
        guestCount: guests,
        message: parts.join(' ') || undefined,
      });
      haptics.success();
      setDone(true);
    } catch {
      setError('Couldn’t send your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(44,24,16,0.4)' }} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ backgroundColor: t.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' }}>
          <Row justify="space-between" style={{ padding: t.spacing.lg }}>
            <Text variant="h2">{done ? 'Request sent' : 'Request a booking'}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={t.colors.textMuted} />
            </Pressable>
          </Row>
          <Divider />

          {done ? (
            <Stack gap="md" style={{ padding: t.spacing.lg, paddingBottom: t.spacing.xl }}>
              <Row gap="sm">
                <Ionicons name="checkmark-circle" size={22} color={t.colors.success} />
                <Text variant="body" tone="body" style={{ flex: 1 }}>
                  Your booking request for {vendorName} is sent. They’ll confirm availability and details with you
                  directly — weddings are settled with the vendor, no online payment needed.
                </Text>
              </Row>
              <Button label="Done" fullWidth onPress={onClose} />
            </Stack>
          ) : (
            <ScrollView contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.md }}>
              <View>
                <Text variant="label" tone="label" style={{ marginBottom: 6 }}>FUNCTION</Text>
                <ChipSelect options={EVENT_TYPES} value={eventType} onChange={setEventType} />
              </View>
              <Row gap="md">
                <View style={{ flex: 1 }}>
                  <Input label="Event date" placeholder="e.g. 15 Dec 2026" value={eventDate} onChangeText={setEventDate} />
                </View>
              </Row>
              <View>
                <Text variant="label" tone="label" style={{ marginBottom: 8 }}>GUESTS (approx.)</Text>
                <Row gap="md" align="center">
                  <Pressable onPress={() => setGuests((g) => Math.max(10, g - 50))} style={stepBtn(t)}>
                    <Ionicons name="remove" size={20} color={t.colors.goldDark} />
                  </Pressable>
                  <Text variant="title" style={{ minWidth: 70, textAlign: 'center' }}>
                    {guests}
                  </Text>
                  <Pressable onPress={() => setGuests((g) => g + 50)} style={stepBtn(t)}>
                    <Ionicons name="add" size={20} color={t.colors.goldDark} />
                  </Pressable>
                </Row>
              </View>
              {packageOptions.length > 0 ? (
                <View>
                  <Text variant="label" tone="label" style={{ marginBottom: 6 }}>PACKAGE (optional)</Text>
                  <ChipSelect options={packageOptions} value={pkg} onChange={setPkg} allLabel="Any" />
                </View>
              ) : null}
              <Divider />
              <Input label="Your name" placeholder="Full name" value={name} onChangeText={setName} />
              <Input label="Phone / WhatsApp" placeholder="03xx xxxxxxx" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              <Input
                label="Anything else? (optional)"
                placeholder="Special requests, other functions…"
                value={message}
                onChangeText={setMessage}
                multiline
                style={{ height: 72, textAlignVertical: 'top', paddingTop: 8 }}
              />
              {error ? <Text variant="caption" tone="danger">{error}</Text> : null}
              <Button label="Send booking request" icon="calendar-outline" fullWidth loading={submitting} onPress={submit} />
              <Text variant="caption" tone="muted" align="center">
                No payment now — the vendor confirms and you settle directly.
              </Text>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function stepBtn(t: ReturnType<typeof useTheme>) {
  return {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: t.colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
}
