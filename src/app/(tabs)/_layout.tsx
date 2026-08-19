import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';

import { CustomTabBar } from '@/components/navigation/CustomTabBar';

// Stable references (same reason as app/_layout.tsx's ROOT_STACK_OPTIONS): a fresh
// screenOptions object or tabBar closure on every render re-fires the navigator's
// native option-sync effect on the New Architecture and can loop into "Maximum
// update depth exceeded". Hoisted so their identity never changes.
const TAB_SCREEN_OPTIONS = { headerShown: false };
const renderTabBar = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={TAB_SCREEN_OPTIONS} tabBar={renderTabBar}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="inbox" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
