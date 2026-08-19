/**
 * CustomTabBar — **a floating dock.** Governed by rules.md §0.0.
 *
 * ── Why this changed again ────────────────────────────────────────────────
 *
 * The previous version was ink-on-paper with a 2px gold rule over the active
 * tab and no shadow, docked flush to the bottom edge. It was defensible on
 * paper — quiet chrome, one small accent — and the founder's verdict was that
 * it read as basic. That verdict is the data: a bar with no material, no depth
 * and no lift does not look restrained on a phone, it looks unfinished. Editorial
 * restraint works on a page you hold still; a tab bar is furniture you touch, and
 * furniture needs to feel like an object.
 *
 * ── What it is now ────────────────────────────────────────────────────────
 *
 * A rounded dock that **floats above the content** with real elevation and a
 * deep-register fill, inset from all three edges. The active tab is a filled
 * gold pill carrying an ink icon and label; inactive tabs are light-on-dark.
 *
 * Three things make it read as premium rather than as a coloured bar:
 *
 * • **It floats.** Inset 16 from the sides and lifted off the safe area, so the
 *   content scrolls *under* it. A docked bar is a boundary; a floating one is an
 *   object on top of the page.
 * • **The active pill wraps icon AND label horizontally**, so the selected tab
 *   is visibly wider than the others. The shape carries the state, which means
 *   it is legible in peripheral vision — you never have to read it.
 * • **Inactive labels are hidden.** Five labels across a dock is a menu; one
 *   label on the selected pill is a control. This is what lets the pill breathe
 *   at 360px.
 *
 * Screens must reserve space for it: `layout.tabBarSpace`.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { alpha, haptics, layout, useTheme } from '@/theme';

type TabCfg = {
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  labelKey: StringKey;
};

const TABS: Record<string, TabCfg> = {
  index: { icon: 'home-outline', iconActive: 'home', labelKey: 'tab.home' },
  explore: { icon: 'search-outline', iconActive: 'search', labelKey: 'tab.explore' },
  plan: { icon: 'heart-outline', iconActive: 'heart', labelKey: 'tab.plan' },
  inbox: { icon: 'chatbubble-outline', iconActive: 'chatbubble', labelKey: 'tab.inbox' },
  account: { icon: 'person-outline', iconActive: 'person', labelKey: 'tab.account' },
};

function TabItem({ cfg, focused, onPress }: { cfg: TabCfg; focused: boolean; onPress: () => void }) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={tr(cfg.labelKey)}
      onPress={onPress}
      style={{
        flexDirection: isUrdu ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: focused ? 7 : 0,
        height: 46,
        // The pill only exists on the selected tab, and it grows to fit its
        // label — so the shape itself is the state, readable without reading.
        paddingHorizontal: focused ? 16 : 14,
        borderRadius: t.radius.pill,
        backgroundColor: focused ? t.colors.primary : 'transparent',
      }}
    >
      <Ionicons
        name={focused ? cfg.iconActive : cfg.icon}
        size={focused ? 20 : 22}
        color={focused ? t.colors.onPrimary : alpha(t.palette.onDark, 0.72)}
      />
      {/* Only the selected tab is labelled. Five labels across a dock is a menu;
          one label on a pill is a control. */}
      {focused ? (
        <Text
          variant="label"
          tone="inherit"
          urdu={isUrdu}
          numberOfLines={1}
          style={{ color: t.colors.onPrimary, fontSize: 13 }}
        >
          {tr(cfg.labelKey)}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: t.spacing.lg,
        paddingBottom: (insets.bottom || t.spacing.md) + t.spacing.sm,
        backgroundColor: 'transparent',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: t.spacing.sm,
          paddingVertical: t.spacing.sm,
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.surfaceInverse,
          // A gold hairline at 20% — the rim that stops the dock reading as a
          // flat black slab against dark photography.
          borderWidth: 1,
          borderColor: alpha(t.palette.goldLight, 0.2),
          ...t.elevation.lg,
        }}
      >
        {state.routes.map((route, i) => {
          const cfg = TABS[route.name];
          if (!cfg) return null;
          const focused = state.index === i;
          const onPress = () => {
            haptics.selection();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return <TabItem key={route.key} cfg={cfg} focused={focused} onPress={onPress} />;
        })}
      </View>
    </View>
  );
}

/** Space a screen must leave at the bottom so the dock never covers content. */
export const TAB_DOCK_SPACE = layout.tabBarSpace;
