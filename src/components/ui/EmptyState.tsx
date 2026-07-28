/** EmptyState — bridal empty/placeholder with optional CTA, framed by the
 *  Mehrab arch signature. */
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { ArchOutline } from '@/components/signature';
import { goldScale, useTheme } from '@/theme';

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
      <View style={{ width: 84, height: 94, alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
        <ArchOutline width={84} height={94} color={goldScale.hairline} strokeWidth={1.5} style={{ position: 'absolute' }} />
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: goldScale.subtle,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 12,
          }}
        >
          <Ionicons name={icon} size={26} color={t.colors.goldDark} />
        </View>
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
