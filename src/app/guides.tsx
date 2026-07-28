import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Divider, Row, Section, Text } from '@/components/ui';
import { GUIDE_GROUPS, WEB_BASE } from '@/features/guides/guides';
import { T } from '@/i18n/T';
import { haptics, useTheme } from '@/theme';

export default function Guides() {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const open = (slug: string) => {
    haptics.light();
    WebBrowser.openBrowserAsync(`${WEB_BASE}/${slug}`, {
      toolbarColor: t.colors.ivory,
      controlsColor: t.colors.goldDark,
      dismissButtonStyle: 'close',
    }).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.screen, paddingTop: insets.top }}>
      <Row gap="sm" style={{ paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={t.colors.textPrimary} />
        </Pressable>
        <T k="guides.title" variant="h1" />
      </Row>

      <ScrollView
        contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.xl, paddingBottom: t.spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <T k="guides.subtitle" variant="body" tone="muted" />
        {GUIDE_GROUPS.map((group) => (
          <Section key={group.title} title={group.title.toUpperCase()}>
            <Card padded={false}>
              {group.guides.map((g, i) => (
                <View key={g.slug}>
                  {i > 0 ? <Divider /> : null}
                  <Pressable onPress={() => open(g.slug)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: t.spacing.md }}>
                    <Ionicons name={group.icon} size={18} color={t.colors.goldDark} />
                    <Text variant="body" tone="body" style={{ flex: 1 }}>
                      {g.title}
                    </Text>
                    <Ionicons name="open-outline" size={16} color={t.colors.textMuted} />
                  </Pressable>
                </View>
              ))}
            </Card>
          </Section>
        ))}
      </ScrollView>
    </View>
  );
}
