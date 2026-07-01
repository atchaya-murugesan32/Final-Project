import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { getMyReservations, cancelReservation } from '../../api/reservations';
import { LinearGradient } from 'expo-linear-gradient';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Upcoming'); // Upcoming, Completed, Cancelled

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await getMyReservations();
      setReservations(data.reservations || []);
    } catch (e) {
      console.error("Failed to load reservations", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCancel = async (id) => {
    try {
      await cancelReservation(id);
      loadReservations();
    } catch (e) {
      alert("Failed to cancel reservation");
    }
  };

  const filteredReservations = reservations.filter(r => r.status === filter);

  if (loading) {
    return <ActivityIndicator color="#690b22" style={{ marginVertical: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>My Reservations</Text>
      
      <View style={styles.tabContainer}>
        {['Upcoming', 'Completed', 'Cancelled'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, filter === tab && styles.activeTab]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabText, filter === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredReservations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No {filter.toLowerCase()} reservations.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filteredReservations.map((res, index) => (
            <Animated.View key={res.id} entering={FadeInUp.delay(index * 100)} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cafeName}>{res.cafe_name}</Text>
                  <Text style={styles.dateText}>{res.reservation_date} • {res.reservation_time}</Text>
                </View>
                <View style={[styles.statusBadge, res.status === 'Upcoming' ? styles.statusUpcoming : res.status === 'Cancelled' ? styles.statusCancelled : styles.statusCompleted]}>
                  <Text style={styles.statusText}>{res.status}</Text>
                </View>
              </View>
              
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="people" size={16} color="#666" />
                  <Text style={styles.detailText}>{res.num_people} People</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="restaurant" size={16} color="#666" />
                  <Text style={styles.detailText}>{res.table_number || 'Auto-assign'}</Text>
                </View>
              </View>

              {res.special_request && (
                <View style={styles.specialRequest}>
                  <Text style={styles.specialRequestText}>"{res.special_request}"</Text>
                </View>
              )}

              {res.status === 'Upcoming' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.editBtn}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(res.id)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          ))}
        </View>
      )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#690b22',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cafeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusUpcoming: { backgroundColor: '#dcfce7' },
  statusCompleted: { backgroundColor: '#e0e7ff' },
  statusCancelled: { backgroundColor: '#fee2e2' },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#444',
  },
  specialRequest: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#d1d5db',
  },
  specialRequestText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  }
});
