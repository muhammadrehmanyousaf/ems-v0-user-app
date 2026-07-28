import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { Platform, type ColorValue } from 'react-native';

import { Text } from '@/components/ui';
import type { StringKey } from '@/i18n/strings';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';

function TabLabel({ labelKey, color }: { labelKey: StringKey; color: ColorValue }) {
  const t = useTheme();
  const { t: tr, isUrdu } = useT();
  return (
    <Text urdu={isUrdu} variant="caption" style={{ color, fontSize: 11, fontFamily: isUrdu ? undefined : t.fontFamily.uiMedium }}>
      {tr(labelKey)}
    </Text>
  );
}

export default function TabsLayout() {
  const t = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.colors.goldDark,
        tabBarInactiveTintColor: t.colors.textMuted,
        tabBarStyle: {
          backgroundColor: t.colors.surface,
          borderTopColor: t.colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ color }) => <TabLabel labelKey="tab.home" color={color} />,
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarLabel: ({ color }) => <TabLabel labelKey="tab.explore" color={color} />,
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'search' : 'search-outline'} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          tabBarLabel: ({ color }) => <TabLabel labelKey="tab.plan" color={color} />,
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'heart' : 'heart-outline'} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          tabBarLabel: ({ color }) => <TabLabel labelKey="tab.inbox" color={color} />,
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarLabel: ({ color }) => <TabLabel labelKey="tab.account" color={color} />,
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
