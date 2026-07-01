import React, { useState } from 'react';
import {
  View,
  Text,
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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await signUp({ name, email, password });
      router.replace('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Text style={styles.title}>Join Us</Text>
          <Text style={styles.subtitle}>Create an account to start saving cafes.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} style={styles.formContainer}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            placeholder="Name"
            placeholderTextColor="#886241"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

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
              <Text style={styles.primaryButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.linkText}>Sign in</Text>
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
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Funky-Vintage',
    color: '#690b22',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'SpaceMono',
    color: '#690b22',
    marginBottom: 40,
  },
  formContainer: {
    backgroundColor: 'rgba(164, 182, 29, 0.58)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(250, 243, 221, 0.6)',
  },
  input: {
    backgroundColor: '#FAF3DD',
    borderWidth: 1.5,
    borderColor: '#690b22',
    padding: 16,
    marginBottom: 16,
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    color: '#4f2f1d',
    fontFamily: 'SpaceMono',
  },
  linkText: {
    color: '#690b22',
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
});

