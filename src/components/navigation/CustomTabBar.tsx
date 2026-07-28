/**
 * CustomTabBar — a refined docked tab bar for the redesign: the active tab sits
 * in a champagne gold-subtle pill with a filled icon, a soft lift, and a
 * selection haptic on switch. Docked (not floating) so no screen needs padding
 * changes. Localised labels (Nastaliq in Urdu).
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { goldScale, haptics, useTheme } from '@/theme';

type TabCfg = { icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap; labelKey: StringKey };

const TABS: Record<string, TabCfg> = {
  index: { icon: 'home-outline', iconActive: 'home', labelKey: 'tab.home' },
  explore: { icon: 'search-outline', iconActive: 'search', labelKey: 'tab.explore' },
  plan: { icon: 'heart-outline', iconActive: 'heart', labelKey: 'tab.plan' },
  inbox: { icon: 'chatbubbles-outline', iconActive: 'chatbubbles', labelKey: 'tab.inbox' },
  account: { icon: 'person-outline', iconActive: 'person', labelKey: 'tab.account' },
};

function TabItem({ cfg, focused, onPress }: { cfg: TabCfg; focused: boolean; onPress: () => void }) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  const color = focused ? t.colors.goldDark : t.colors.textMuted;
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 3, paddingTop: 2 }}>
      <View
        style={{
          paddingHorizontal: 18,
          paddingVertical: 5,
          borderRadius: 999,
          backgroundColor: focused ? goldScale.subtle : 'transparent',
        }}
      >
        <Ionicons name={focused ? cfg.iconActive : cfg.icon} size={22} color={color} />
      </View>
      <Text
        variant="caption"
        urdu={isUrdu}
        style={{ fontSize: 11, color, fontFamily: isUrdu ? undefined : t.fontFamily.uiMedium }}
      >
        {tr(cfg.labelKey)}
      </Text>
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.colors.surface,
        borderTopWidth: 1,
        borderTopColor: t.colors.border,
        paddingTop: 8,
        paddingBottom: insets.bottom || 10,
        ...t.elevation.sm,
      }}
    >
      {state.routes.map((route, i) => {
        const cfg = TABS[route.name];
        if (!cfg) return null;
        const focused = state.index === i;
        const onPress = () => {
          haptics.selection();
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return <TabItem key={route.key} cfg={cfg} focused={focused} onPress={onPress} />;
      })}
    </View>
  );
}
