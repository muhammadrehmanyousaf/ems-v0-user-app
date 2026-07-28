import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Stack, Text } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboarding';
import { useTheme } from '@/theme';
import { BridalWash, JaalPattern } from '@/theme/textures';

const { width } = Dimensions.get('window');

const SLIDES: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  { icon: 'search-outline', title: 'Discover the best', body: 'Browse 3,000+ trusted wedding vendors across Pakistan — venues, photographers, caterers, makeup & more.' },
  { icon: 'calendar-outline', title: 'Plan every detail', body: 'Budget, checklist, guest list and a day-of timeline — your whole shaadi, organised in one place.' },
  { icon: 'logo-whatsapp', title: 'Connect directly', body: 'Save your favourites, compare them, and reach vendors on WhatsApp — no middleman, no commission.' },
];

export default function Onboarding() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = () => {
    markSeen();
    router.replace('/');
  };
  const next = () => {
    if (index < SLIDES.length - 1) listRef.current?.scrollToIndex({ index: index + 1 });
    else finish();
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <BridalWash style={{ flex: 1 }}>
      <JaalPattern opacity={0.05} />
      <View style={{ position: 'absolute', top: insets.top + 8, right: 16, zIndex: 2 }}>
        <Pressable onPress={finish} hitSlop={8}>
          <Text variant="label" tone="muted">Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(s) => s.title}
        renderItem={({ item }) => (
          <View style={{ width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
            <View style={{ width: 108, height: 108, borderRadius: 54, backgroundColor: 'rgba(201,149,106,0.16)', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
              <Ionicons name={item.icon} size={48} color={t.colors.goldDark} />
            </View>
            <Text variant="display" align="center">{item.title}</Text>
            <Text variant="bodyLead" tone="muted" align="center" style={{ marginTop: 12 }}>
              {item.body}
            </Text>
          </View>
        )}
      />

      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24, gap: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 22 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === index ? t.colors.gold : t.colors.beige,
              }}
            />
          ))}
        </View>
        <Stack gap="sm">
          <Button label={index === SLIDES.length - 1 ? 'Get started' : 'Next'} fullWidth onPress={next} iconRight={index === SLIDES.length - 1 ? 'heart' : 'arrow-forward'} />
        </Stack>
      </View>
    </BridalWash>
  );
}
