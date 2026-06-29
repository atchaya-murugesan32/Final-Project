import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/context/AuthContext';

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

export default function AccountScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [activity, setActivity] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);

  const [error, setError] = useState(null);
  const { signOut } = useAuth();

  const fetchData = async () => {
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
    } catch (e) {
      console.error("Dashboard Error:", e);
      setError("Failed to load dashboard data. Error: " + (e.message || String(e)));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (e) {
      await AsyncStorage.removeItem('userToken');
      router.replace('/auth/login');
    }
  };

  if (error) {
    return (
      <LinearGradient colors={['#a58e1ed2', '#e8d7be']} style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutBtnText}>Sign Out / Try Again</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (loading && !refreshing) {
    return (
      <LinearGradient colors={['#a58e1ed2', '#e8d7be']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690b22" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#fdfbfb', '#ebedee', '#fdfbfb']} style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(800).springify()}>
          <Text style={styles.headerTitle}>Account</Text>
          
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(165, 142, 30, 0.1)',
  },
  bgCircle2: {
    position: 'absolute',
    top: 400,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(105, 11, 34, 0.05)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 24,
    letterSpacing: -1,
  },
  errorText: {
    color: '#690b22',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  logoutBtn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#690b22',
    borderRadius: 8,
  },
  logoutBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButtonFinal: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e11d48',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  logoutButtonFinalText: {
    color: '#e11d48',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
