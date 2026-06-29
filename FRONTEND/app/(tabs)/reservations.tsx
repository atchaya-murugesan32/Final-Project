import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getMyReservations, cancelReservation } from '../../src/api/reservations';

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservations = async () => {
    try {
      const data = await getMyReservations();
      setReservations(data);
    } catch (err) {
      console.log('Error fetching reservations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const handleCancel = (id) => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm("Are you sure you want to cancel this reservation?");
      if (confirm) {
        (async () => {
          try {
            await cancelReservation(id);
            fetchReservations();
          } catch (error) {
            alert(error.message);
          }
        })();
      }
      return;
    }

    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this reservation?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          style: "destructive",
          onPress: async () => {
            try {
              await cancelReservation(id);
              fetchReservations();
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isCancelled = item.status === 'Cancelled';
    const isPast = new Date(item.reservation_date) < new Date(new Date().toDateString());

    return (
      <View style={[styles.card, isCancelled && styles.cardCancelled]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cafeName}>{item.cafe_name}</Text>
          <View style={[styles.statusBadge, isCancelled ? styles.statusCancelled : styles.statusConfirmed]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.reservation_date}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.reservation_time}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.num_people} People</Text>
        </View>
        {item.table_number && (
          <View style={styles.detailsRow}>
            <Ionicons name="restaurant-outline" size={16} color="#666" />
            <Text style={[styles.detailText, { fontWeight: 'bold', color: '#690b22' }]}>{item.table_number}</Text>
          </View>
        )}
        {!isCancelled && !isPast && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancel(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8a1a36" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#690b22', '#9c1c38']} style={styles.header}>
        <Text style={styles.headerTitle}>My Reservations</Text>
      </LinearGradient>

      {reservations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>You have no reservations yet.</Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardCancelled: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cafeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusConfirmed: {
    backgroundColor: '#e6f4ea',
  },
  statusCancelled: {
    backgroundColor: '#fbe9e7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  cancelButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#d32f2f',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  }
});
