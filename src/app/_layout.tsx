import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, router, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/lib/query/queryClient';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { useLocaleStore } from '@/store/locale';
import { useOnboardingStore } from '@/store/onboarding';
import { useRecentlyViewedStore } from '@/store/recently-viewed';
import { ThemeProvider, useAppFonts, colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const navState = useRootNavigationState();
  const onboardingLoaded = useOnboardingStore((s) => s.loaded);
  const onboardingSeen = useOnboardingStore((s) => s.seen);

  // Hydrate persisted state (session, locale, favourites, onboarding) on cold launch.
  useEffect(() => {
    void useAuthStore.getState().hydrate();
    void useLocaleStore.getState().hydrate();
    void useFavoritesStore.getState().hydrate();
    void useRecentlyViewedStore.getState().hydrate();
    void useOnboardingStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // First-launch gate: once the navigator is ready and the flag has loaded,
  // send new users to onboarding — exactly once. The ref guard is essential:
  // router.replace mutates the root navigation state, which re-runs this effect
  // (navState.key is a dependency). Without the guard it would replace -> re-run ->
  // replace ... endlessly ("Maximum update depth exceeded") on every fresh launch,
  // because onboardingSeen stays false until the user finishes onboarding.
  const didRouteOnboarding = useRef(false);
  useEffect(() => {
    if (didRouteOnboarding.current) return;
    if (!navState?.key || !onboardingLoaded) return;
    if (!onboardingSeen) {
      didRouteOnboarding.current = true;
      router.replace('/onboarding');
    }
  }, [navState?.key, onboardingLoaded, onboardingSeen]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.screen }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <BottomSheetModalProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screen } }} />
            </BottomSheetModalProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
