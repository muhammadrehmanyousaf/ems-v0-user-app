/** InquiryModal — anonymous lead form → POST /leads/inquiry (web parity). */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';

import { Button, Input, Row, Stack, Text } from '@/components/ui';
import { submitInquiry } from '@/lib/api/endpoints/vendors';
import { useAuthStore } from '@/store/auth';
import { haptics, useTheme } from '@/theme';

export function InquiryModal({
  visible,
  onClose,
  businessId,
  vendorName,
}: {
  visible: boolean;
  onClose: () => void;
  businessId: number;
  vendorName: string;
}) {
  const t = useTheme();
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const reset = () => {
    setDone(false);
    setError(null);
    setMessage('');
  };

  const submit = async () => {
    if (!name.trim() && !phone.trim()) {
      setError('Please add your name or phone so the vendor can reach you.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitInquiry({
        businessId,
        name: name.trim() || undefined,
        phoneNumber: phone.trim() || undefined,
        message: message.trim() || undefined,
      });
      haptics.success();
      setDone(true);
    } catch {
      setError('Couldn’t send your inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(44,24,16,0.4)' }} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={{
            backgroundColor: t.colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 24,
            paddingBottom: 36,
          }}
        >
          <Row justify="space-between" style={{ marginBottom: t.spacing.md }}>
            <Text variant="h2">{done ? 'Inquiry sent' : 'Send an inquiry'}</Text>
            <Pressable onPress={close} hitSlop={8}>
              <Ionicons name="close" size={24} color={t.colors.textMuted} />
            </Pressable>
          </Row>

          {done ? (
            <Stack gap="md">
              <Row gap="sm">
                <Ionicons name="checkmark-circle" size={22} color={t.colors.success} />
                <Text variant="body" tone="body" style={{ flex: 1 }}>
                  Your inquiry to {vendorName} is on its way. They’ll reach out on the number you provided.
                </Text>
              </Row>
              <Button label="Done" fullWidth onPress={close} />
            </Stack>
          ) : (
            <Stack gap="md">
              <Text variant="caption" tone="muted">
                Tell {vendorName} about your event and they’ll get back to you.
              </Text>
              <Input label="Your name" placeholder="Full name" value={name} onChangeText={setName} />
              <Input
                label="Phone / WhatsApp"
                placeholder="03xx xxxxxxx"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <Input
                label="Message (optional)"
                placeholder="Event date, guests, what you need…"
                value={message}
                onChangeText={setMessage}
                multiline
                style={{ height: 80, textAlignVertical: 'top', paddingTop: 8 }}
              />
              {error ? (
                <Text variant="caption" tone="danger">
                  {error}
                </Text>
              ) : null}
              <Button label="Send inquiry" icon="send-outline" fullWidth loading={submitting} onPress={submit} />
            </Stack>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
