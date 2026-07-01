import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import { CafesProvider } from '../src/context/CafesContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!token && !inAuthGroup) {
      // Redirect to the splash screen before showing login.
      router.replace('/auth/splash' as any);
    } else if (token && inAuthGroup) {
      // Redirect away from the login page
      router.replace('/(tabs)');
    }
  }, [token, loading, segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="recommend" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Funky-Vintage': require('../assets/fonts/Funky-Vintage-Regular.otf'),
    'Anonymous': require('../assets/fonts/Anonymous.ttf'),
    'Droid': require('../assets/fonts/DroidSansMono.ttf'),
    'SpaceMono': require('../assets/fonts/SpaceMono-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <CafesProvider>
        <InitialLayout />
      </CafesProvider>
    </AuthProvider>
  );
}
