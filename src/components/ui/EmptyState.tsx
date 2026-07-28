/** EmptyState — bridal empty/placeholder with optional CTA. */
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Render title/message/CTA with the Nastaliq Urdu family (RTL). */
  urdu?: boolean;
}

export function EmptyState({ icon = 'sparkles-outline', title, message, actionLabel, onAction, urdu }: EmptyStateProps) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: t.spacing['2xl'], gap: t.spacing.md }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: 'rgba(201,149,106,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={32} color={t.colors.primary} />
      </View>
      <Text variant="h3" align="center" urdu={urdu}>
        {title}
      </Text>
      {message ? (
        <Text variant="body" tone="muted" align="center" urdu={urdu}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: t.spacing.sm }}>
          <Button label={actionLabel} onPress={onAction} variant="secondary" urdu={urdu} />
        </View>
      ) : null}
    </View>
  );
}
