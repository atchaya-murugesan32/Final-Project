import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('userToken');
        if (t) setToken(t);
      } catch (e) {
        console.warn('Auth: failed to load token', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async ({ email, password }) => {
    const res = await authApi.login({ email, password });
    if (res?.access_token) {
      setToken(res.access_token);
      await AsyncStorage.setItem('userToken', res.access_token);
    }
    return res;
  };

  const signUp = async ({ name, email, password }) => {
    const res = await authApi.register({ name, email, password });
    return res;
  };

  const signOut = async () => {
    setToken(null);
    await AsyncStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{ token, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
