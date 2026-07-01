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
  Platform,
  useWindowDimensions
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyReservations, cancelReservation } from '../../src/api/reservations';
import { useAuth } from '../../src/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AuthContextValue = {
  token: string | null;
  loading: boolean;
};

export default function ReservationsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const auth = useAuth() as AuthContextValue | null;
  const token = auth?.token ?? null;
  const authLoading = auth?.loading ?? false;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headingFontSize = Math.max(38, Math.min(56, Math.round(width * 0.13)));

  const fetchReservations = async () => {
    if (!token) {
      setReservations([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

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
      if (authLoading) {
        return undefined;
      }

      fetchReservations();
      return undefined;
    }, [authLoading, token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const handleCancel = (id: number) => {
    if (!token) {
      return;
    }

    if (Platform.OS === 'web') {
      const confirm = window.confirm("Are you sure you want to cancel this reservation?");
      if (confirm) {
        (async () => {
          try {
            await cancelReservation(id);
            fetchReservations();
          } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to cancel reservation');
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
              Alert.alert("Error", error instanceof Error ? error.message : 'Failed to cancel reservation');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
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
          <Ionicons name="calendar-outline" size={16} color="#690b22" />
          <Text style={styles.detailText}>{item.reservation_date}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Ionicons name="time-outline" size={16} color="#690b22" />
          <Text style={styles.detailText}>{item.reservation_time}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Ionicons name="people-outline" size={16} color="#690b22" />
          <Text style={styles.detailText}>{item.num_people} People</Text>
        </View>
        {item.table_number && (
          <View style={styles.detailsRow}>
            <Ionicons name="restaurant-outline" size={16} color="#690b22" />
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
        <ActivityIndicator size="large" color="#E4CAAA" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: Math.max(12, insets.bottom) }]}>
      <Text style={[styles.heading, { fontSize: headingFontSize }]}>My Reservations</Text>
      <Text style={styles.subheading}>Your upcoming and past bookings.</Text>

      {reservations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cafe-outline" size={64} color="#E4CAAA" />
          <Text style={styles.emptyText}>You have no reservations yet.</Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 40 }]}
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
    backgroundColor: '#7A7849',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7A7849',
  },
  heading: {
    fontSize: 65,
    fontWeight: 'bold',
    fontFamily: 'Funky-Vintage',
    color: '#E4CAAA',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 20,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#E4CAAA',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  card: {
    backgroundColor: '#FAF3DD',
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
    fontFamily: 'SpaceMono',
    color: '#690b22',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusConfirmed: {
    backgroundColor: '#E4CAAA',
  },
  statusCancelled: {
    backgroundColor: '#bfa57c',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
    color: '#690b22',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'SpaceMono',
    color: '#690b22',
  },
  cancelButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#690b22',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(105, 11, 34, 0.07)',
  },
  cancelButtonText: {
    color: '#690b22',
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 14,
    fontSize: 24,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#E4CAAA',
    textAlign: 'center',
  }
});

