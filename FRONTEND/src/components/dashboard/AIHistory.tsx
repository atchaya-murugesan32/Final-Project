import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function AIHistory({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>AI Recommendations History</Text>
      <View style={styles.list}>
        {history.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInUp.delay(index * 100)}>
            <TouchableOpacity style={styles.card}>
              <View style={styles.iconContainer}>
                <Ionicons name="search-outline" size={16} color="#35545ad7" />
              </View>
              <View style={styles.content}>
                <Text style={styles.queryText} numberOfLines={1}>{item.query}</Text>
                <Text style={styles.timeText}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
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
    fontFamily: 'SpaceMono',
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3DD',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#35545ad7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(53, 84, 90, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  queryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
    fontFamily: 'SpaceMono',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'SpaceMono',
  }
});
