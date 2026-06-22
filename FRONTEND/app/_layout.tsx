import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import { CafesProvider } from '../src/context/CafesContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

    const [loaded, error] = useFonts({
    'Funky-Vintage': require('../assets/fonts/Funky-Vintage-Regular.otf'),
  });

    useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return <CafesProvider>
    <Stack>
      <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      <Stack.Screen
          name="recommend"
          options={{ headerShown: false, presentation: 'modal' }}
        />
    </Stack>
  </CafesProvider>
}
