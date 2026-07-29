import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { queryClient } from '@/lib/query/queryClient';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { useLocaleStore } from '@/store/locale';
import { useOnboardingStore } from '@/store/onboarding';
import { useRecentlyViewedStore } from '@/store/recently-viewed';
import { ThemeProvider, useAppFonts, colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

// Stable navigator options. Passing a fresh screenOptions object — or an inline
// `contentStyle` — to <Stack> on every render re-fires react-native-screens' native
// option-sync effect on the New Architecture, spinning into "Maximum update depth
// exceeded" and crashing the standalone app on launch (native only; web's screens
// shim never runs that effect). Unstable-reference bug class, cf. expo/expo#44563.
// Hoisted to module scope so the reference never changes.
const ROOT_STACK_OPTIONS = { headerShown: false };

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
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

  // First-launch gate: send new users to onboarding exactly once. We deliberately
  // do NOT call useRootNavigationState() here — subscribing the root layout to the
  // navigation state registers an effect listener that re-fires on every state
  // change and feedback-loops with the store-hydration re-renders, crashing the app
  // on device with "Maximum update depth exceeded" (see expo/expo#36121; the
  // `latestCallback` frame in the crash was exactly that listener). onboardingLoaded
  // only flips true after an async AsyncStorage read, by which point the navigator
  // is already mounted, so router.replace is safe without a readiness check.
  const didRouteOnboarding = useRef(false);
  useEffect(() => {
    if (didRouteOnboarding.current || !onboardingLoaded) return;
    if (!onboardingSeen) {
      didRouteOnboarding.current = true;
      router.replace('/onboarding');
    }
  }, [onboardingLoaded, onboardingSeen]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.screen }}>
      <QueryClientProvider client={queryClient}>
        {/* NOTE: no SafeAreaProvider here — expo-router already provides one at the
            root. A second, nested provider makes RNCSafeAreaProvider's inset
            measurement feedback-loop on the New Architecture ("Maximum update depth
            exceeded"), crashing the standalone app on launch (native only; web has
            static insets so it never surfaced). See expo/expo#39472, #37316. */}
        <ThemeProvider>
          <BottomSheetModalProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={ROOT_STACK_OPTIONS} />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
