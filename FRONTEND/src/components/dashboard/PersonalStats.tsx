import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function PersonalStats({ stats }) {
  if (!stats) return null;

  const statItems = [
    { label: 'Reservations', value: stats.total_reservations, icon: 'calendar-outline', delay: 100 },
    { label: 'Favorite Cafes', value: stats.favorite_cafes_count, icon: 'heart-outline', delay: 200 }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Activity</Text>
      <View style={styles.grid}>
        {statItems.map((item, index) => (
          <Animated.View key={index} entering={FadeInUp.delay(item.delay)} style={styles.statCardWrapper}>
            <LinearGradient colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.3)']} style={styles.statCard}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={22} color="#690b22" />
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </LinearGradient>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    paddingHorizontal: 4,
    letterSpacing: -0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCardWrapper: {
    width: '48%',
  },
  statCard: {
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(105, 11, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  }
});
