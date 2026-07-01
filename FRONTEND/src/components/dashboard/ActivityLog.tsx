import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInLeft } from 'react-native-reanimated';

export default function ActivityLog({ activities }) {
  if (!activities || activities.length === 0) return null;

  const getIconForAction = (action) => {
    if (action.includes('Log')) return 'log-in-outline';
    if (action.includes('Reserv')) return 'calendar-outline';
    if (action.includes('Favor')) return 'heart-outline';
    if (action.includes('AI')) return 'sparkles-outline';
    return 'time-outline';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.timeline}>
        {activities.map((activity, index) => (
          <Animated.View key={activity.id} entering={FadeInLeft.delay(index * 100)} style={styles.timelineItem}>
            <View style={styles.iconContainer}>
              <Ionicons name={getIconForAction(activity.action_type)} size={18} color="#fff" />
            </View>
            {index !== activities.length - 1 && <View style={styles.line} />}
            <View style={styles.content}>
              <Text style={styles.actionText}>{activity.action_type}</Text>
              <Text style={styles.timeText}>{new Date(activity.created_at).toLocaleString()}</Text>
              {activity.description && (
                <Text style={styles.descText}>{activity.description}</Text>
              )}
            </View>
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
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#690b22',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#690b22',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  line: {
    position: 'absolute',
    top: 32,
    left: 15,
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(105, 11, 34, 0.2)',
    zIndex: 1,
  },
  content: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  descText: {
    fontSize: 14,
    color: '#444',
  }
});
