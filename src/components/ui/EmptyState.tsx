/**
 * EmptyState — **v4.**
 *
 * Governed by rules.md §0.0. Sheet row: `components/ui/EmptyState.tsx`.
 *
 * v3 centred a 64px gold-washed circle holding a gold icon, over a title, over
 * a message, over a gold button. Four elements, three of them gold, to say
 * "there is nothing here" — the loudest thing on the screen was the absence.
 *
 * v4 states it in type, the way the reference states everything: a **title on
 * the display face**, one quiet line, and a single outlined action. The icon
 * survives at a small size in muted ink, because a shape helps the eye land,
 * but it is no longer a coloured medallion.
 *
 * Copy law §3 applies here more than anywhere: an empty state must say what
 * happened AND what to do. The `actionLabel` is not decoration — a dead end with
 * no way out is the failure this component exists to prevent.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { layout, useTheme } from '@/theme';

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

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  urdu,
}: EmptyStateProps) {
  const t = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        paddingHorizontal: layout.gutter,
        // `vast` (64): an empty state is a moment, and a moment needs room.
        paddingVertical: t.spacing.vast,
        gap: t.spacing.md,
      }}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={26}
          color={t.colors.textFaint}
          style={{ marginBottom: t.spacing.xs }}
        />
      ) : null}

      <Text variant="h2" align="center" urdu={urdu}>
        {title}
      </Text>

      {message ? (
        <Text
          variant="body"
          tone="muted"
          align="center"
          urdu={urdu}
          // Stops a long sentence running the full width of a tablet, which is
          // where centred copy becomes unreadable.
          style={{ maxWidth: 320 }}
        >
          {message}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <View style={{ marginTop: t.spacing.md }}>
          {/* `secondary`: an empty state is a recovery, not the screen's
              primary action, so it does not spend the gold. */}
          <Button label={actionLabel} variant="secondary" onPress={onAction} urdu={urdu} />
        </View>
      ) : null}
    </View>
  );
}
