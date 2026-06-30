import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn({ email, password });
      // The router.replace will be handled by the _layout.tsx InitialLayout,
      // but we can also manually replace just in case.
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.logoWrapper}>
          <Image
            source={require('../../assets/images/ZenBrewWord.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Your perfect spot is waiting. Sign in to find it.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} style={styles.formContainer}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            placeholder="Email"
            placeholderTextColor="#886241"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#886241"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FAF3DD" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.linkText}>Create one</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffedd1',

  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'flex-start',
    paddingTop: 28,
  },
  logoWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  logo: {
    width: '96%',
    maxWidth: 520,
    height: 190,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    fontFamily: 'Funky-Vintage',
    color: '#690b22',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'SpaceMono',
    color: '#690b22',
    marginBottom: 22,
  },
  formContainer: {
    backgroundColor: 'rgba(164, 182, 29, 0.58)',
    padding: 18,
    borderRadius: 24,
    
  },
  input: {
    backgroundColor: '#FAF3DD',
    borderWidth: 1.5,
    borderColor: '#690b22',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#690b22',
    fontFamily: 'SpaceMono',
  },
  error: {
    color: '#cc0000',
    marginBottom: 16,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#690b22',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#690b22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FAF3DD',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  footerText: {
    color: '#4f2f1d',
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#690b22',
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
});

