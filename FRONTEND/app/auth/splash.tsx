import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

const SPLASH_VISIBLE_MS = 1500;
const FADE_DURATION_MS = 600;

export default function AuthSplashScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          router.replace('/auth/login');
        }
      });
    }, SPLASH_VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [opacity, router]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrapper, { opacity }]}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF3DC',  // cream colour
  },
  logoWrapper: {
    width: '90%',       // ← increase this to make logo bigger
    maxWidth: 400,      // ← and/or increase this
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});