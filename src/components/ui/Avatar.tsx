/** Avatar — image or gold initials circle. */
import { Image } from 'expo-image';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import { Text } from './Text';

export interface AvatarProps {
  name?: string;
  uri?: string | null;
  size?: number;
}

function initials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function Avatar({ name, uri, size = 44 }: AvatarProps) {
  const t = useTheme();
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.colors.sand }}
        contentFit="cover"
        transition={200}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(201,149,106,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="title" tone="gold" style={{ fontSize: size * 0.36 }}>
        {initials(name)}
      </Text>
    </View>
  );
}
