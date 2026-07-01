import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Dimensions, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import UserProfile from '../../src/components/dashboard/UserProfile';
import PersonalStats from '../../src/components/dashboard/PersonalStats';
import FavoriteCafes from '../../src/components/dashboard/FavoriteCafes';
import MyReservations from '../../src/components/dashboard/MyReservations';
import ActivityLog from '../../src/components/dashboard/ActivityLog';
import AIHistory from '../../src/components/dashboard/AIHistory';
import PreferencesManager from '../../src/components/dashboard/PreferencesManager';
import SettingsPanel from '../../src/components/dashboard/SettingsPanel';

import { 
  getUserProfile, 
  getDashboardStats, 
  getFavorites,
  getPreferences,
  getNotifications,
  getActivityHistory,
  getAiHistory
} from '../../src/api/dashboard';

const { width } = Dimensions.get('window');

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

type AuthContextValue = {
  token: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [activity, setActivity] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);
  const headingFontSize = Math.max(38, Math.min(56, Math.round(width * 0.13)));

  const [error, setError] = useState<string | null>(null);
  const auth = useAuth() as AuthContextValue | null;
  const token = auth?.token ?? null;
  const authLoading = auth?.loading ?? false;
  const signOut = auth?.signOut;

  const fetchData = async () => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);
      const [profRes, statsRes, favRes, prefRes, notifRes, actRes, aiRes] = await Promise.all([
        getUserProfile(),
        getDashboardStats(),
        getFavorites(),
        getPreferences(),
        getNotifications(),
        getActivityHistory(),
        getAiHistory()
      ]);
      setProfile(profRes);
      setStats(statsRes);
      setFavorites(favRes);
      setPreferences(prefRes);
      setNotifications(notifRes);
      setActivity(actRes);
      setAiHistory(aiRes);
    } catch (error) {
      console.error("Dashboard Error:", error);
      setError("Failed to load dashboard data. Error: " + getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (authLoading) {
        return undefined;
      }

      fetchData();
      return undefined;
    }, [authLoading, token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    try {
      if (signOut) {
        await signOut();
      } else {
        await AsyncStorage.removeItem('userToken');
      }
      router.replace('/auth/login');
    } catch (e) {
      await AsyncStorage.removeItem('userToken');
      router.replace('/auth/login');
    }
  };

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutBtnText}>Sign Out / Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E4CAAA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(800).springify()}>
          <Text style={[styles.headerTitle, { fontSize: headingFontSize }]}>Account</Text>
          
          <UserProfile profile={profile} onUpdate={fetchData} />
          
          <PersonalStats stats={stats} />
          
          <PreferencesManager preferences={preferences} onRefresh={fetchData} />
          
          <FavoriteCafes favorites={favorites} onRefresh={fetchData} />

          <AIHistory history={aiHistory} />
          
          <TouchableOpacity style={styles.logoutButtonFinal} onPress={handleLogout}>
            <Text style={styles.logoutButtonFinalText}>Log Out</Text>
          </TouchableOpacity>
          
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C08831',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#C08831',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 65,
    fontWeight: 'bold',
    fontFamily: 'Funky-Vintage',
    color: '#E4CAAA',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#E4CAAA',
    fontSize: 20,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  logoutBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#FAF3DD',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#35545ad7',
  },
  logoutBtnText: {
    color: '#35545ad7',
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  logoutButtonFinal: {
    backgroundColor: '#FAF3DD',
    borderWidth: 1.5,
    borderColor: '#35545ad7',
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
    shadowColor: '#35545ad7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },
  logoutButtonFinalText: {
    color: '#35545ad7',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  }
});
