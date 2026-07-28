/** CategoryGrid — the vendor-category tiles on Home. Taps into Explore filtered. */
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

import { BROWSABLE_CATEGORIES } from '../categories';

const COLS = 4;

export function CategoryGrid() {
  const t = useTheme();
  return (
    <View style={styles.grid}>
      {BROWSABLE_CATEGORIES.map((c) => (
        <Pressable
          key={c.slug}
          style={styles.cell}
          onPress={() => router.push({ pathname: '/explore', params: { category: c.slug } })}
        >
          <View
            style={[
              styles.tile,
              { backgroundColor: t.colors.cream, borderColor: t.colors.border, borderRadius: t.radius.md },
            ]}
          >
            <Ionicons name={c.icon} size={24} color={t.colors.goldDark} />
          </View>
          <Text variant="caption" tone="body" align="center" numberOfLines={2} style={{ marginTop: 6 }}>
            {c.singular}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / COLS}%`, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4 },
  tile: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
