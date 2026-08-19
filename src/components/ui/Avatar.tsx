/**
 * Avatar — **v4.**
 *
 * Governed by rules.md §0.0. Sheet row: `components/ui/Avatar.tsx`.
 *
 * v3 drew a gold-tinted circle with gold initials — a coloured disc for every
 * person on screen, which in a reviews list is eight accent-coloured objects
 * competing with the one thing that should be gold.
 *
 * v4: a **`sunken` disc with ink initials**, and a hairline. Neutral, so a
 * column of them recedes and the review text leads. The image path is unchanged
 * except that it no longer carries a border colour that fought the photograph.
 *
 * Initials are derived from the first and LAST word — "Muhammad Rehman Yousaf"
 * becomes MY, not MR. A Pakistani name commonly has three or four parts and the
 * middle ones are the least identifying.
 */
import { Image } from 'expo-image';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
}

function initials(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, uri, size = 40 }: AvatarProps) {
  const t = useTheme();
  const label = initials(name);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: t.colors.sunken,
        borderWidth: 1,
        borderColor: t.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      ) : (
        <Text
          variant="label"
          tone="muted"
          // Scales with the circle so a 64px avatar does not carry 14px type.
          style={{ fontSize: Math.max(11, Math.round(size * 0.34)) }}
        >
          {label}
        </Text>
      )}
    </View>
  );
}
