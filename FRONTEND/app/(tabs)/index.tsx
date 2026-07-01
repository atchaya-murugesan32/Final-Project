import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CafeCard from '../../src/components/CafeCard';
import { useCafes } from '../../src/context/CafesContext';
import AddCafeButton from '../../src/components/AddCafeButton';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { getFavorites, addFavorite, removeFavorite } from '../../src/api/dashboard';
import { useAuth } from '../../src/context/AuthContext';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { distanceInMiles } from '../../src/utils/distance';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const sortOptions = [
  { label: 'Most recent', value: 'recent' },
  { label: 'Rating', value: 'rating' },
  { label: 'Distance', value: 'distance' },
  { label: 'Busyness (%)', value: 'busyness' },
  { label: 'Seats available', value: 'seats' },
];

type AuthContextValue = {
  token: string | null;
  loading: boolean;
};

export default function CafeListScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { cafes, removeCafe } = useCafes();
  const auth = useAuth() as AuthContextValue | null;
  const token = auth?.token ?? null;
  const authLoading = auth?.loading ?? false;

  const [sortMode, setSortMode] = useState('recent');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const headingFontSize = Math.max(40, Math.min(58, Math.round(width * 0.135)));

  //runs when the component mounts and when the token or authLoading changes
  //fetches the user's favorite cafes from the backend if the user is logged in
  useEffect(() => {
    if (authLoading) { //still checking if user is logged in, don't fetch favorites yet
      return;
    }

    if (!token) {
      setFavorites([]);
      return;
    }

    getFavorites().then(setFavorites).catch(console.error);
  }, [authLoading, token]);

  // Track user location while this tab is focused so card distances stay current.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      let subscription: Location.LocationSubscription | null = null;

      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (active) {
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 15,
          },
          (position) => {
            if (!active) {
              return;
            }

            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        );
      })();

      return () => {
        active = false;
        subscription?.remove();
      };
    }, [])
  );

  const cafesWithLiveDistance = useMemo(() => {
    return cafes.map((cafe: any) => {
      if (!userLocation || cafe.latitude == null || cafe.longitude == null) {
        return cafe;
      }

      const miles = distanceInMiles(
        userLocation.latitude,
        userLocation.longitude,
        cafe.latitude,
        cafe.longitude
      );

      return {
        ...cafe,
        distance_from_user: miles * 1.60934,
        distanceMi: miles,
      };
    });
  }, [cafes, userLocation]);

  // Function to toggle favorite status of a cafe
  async function handleToggleFavorite(cafe: any) {
    if (!token) {
      return;
    }

    const isFav = favorites.some(f => f.cafe_id === cafe.id);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.cafe_id !== cafe.id));
      await removeFavorite(cafe.id).catch(console.error);
    } else {
      const newFav = { cafe_id: cafe.id, cafe_name: cafe.name, rating: cafe.rating, image_url: cafe.image || cafe.photos?.[0] };
      setFavorites(prev => [...prev, newFav]);
      await addFavorite(newFav).catch(console.error);
    }
  }

  // Find the selected sort option based on the current sort mode
  const selectedOption = sortOptions.find((option) => option.value === sortMode);

  // Sort the cafes based on the selected sort mode
  const sortedCafes = useMemo(() => {
    const copy = [...cafesWithLiveDistance];

    switch (sortMode) {
      // Highest rating first
      case 'rating':
        return copy.sort((a, b) => b.rating - a.rating);

      // Nearest first
      case 'distance':
        return copy.sort(
          (a, b) =>
            (a.distance_from_user ?? Number.MAX_SAFE_INTEGER) -
            (b.distance_from_user ?? Number.MAX_SAFE_INTEGER)
        );

      // Relative busyness â€” least busy (lowest %) first
      case 'busyness':
        return copy.sort((a, b) => a.busynessPercent - b.busynessPercent);

      // Absolute availability â€” most free seats first
      case 'seats':
        return copy.sort((a, b) => b.seatsAvailable - a.seatsAvailable);

      case 'recent':
      default:
        return copy.sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
    }
  }, [cafesWithLiveDistance, sortMode]);

  //return the UI for the cafe list screen, including the sort dropdown, edit button, and the list of cafes
  return (
    //heading and subheading for the cafe list screen
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: Math.max(12, insets.bottom) }]}>
      <Text style={[styles.heading, { fontSize: headingFontSize }]}>Your Cafes</Text>
      <Text style={styles.subheading}>Eateries saved, and loved by you.</Text>

      {/* Sort dropdown */}
      <View style={styles.sortSection}>
        <View style={styles.sortBar}>
          <Text style={styles.sortLabel}>Sort by</Text>
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownOpen(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.dropdownButtonText}>{selectedOption?.label ?? 'Select'}</Text>
              <Ionicons name="chevron-down" size={18} color="#690b22" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.editButton, editMode && styles.editButtonActive]}
            onPress={() => setEditMode((prev) => !prev)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={editMode ? 'checkmark' : 'create-outline'}
              size={16}
              color={editMode ? '#FAF3DD' : '#690b22'}
            />
            <Text style={[styles.editButtonText, editMode && styles.editButtonTextActive]}>
              {editMode ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Dropdown menu for sorting options */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDropdownOpen(false)}>
          <Pressable style={styles.dropdownMenu} onPress={() => {}}>
            {sortOptions.map((option) => {
              const active = option.value === sortMode;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                  onPress={() => {
                    setSortMode(option.value);
                    setDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      <FlatList
        data={sortedCafes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CafeCard
            cafe={item}
            editMode={editMode}
            onRemovePress={() => removeCafe(item.id)}
            isFavorite={favorites.some(f => f.cafe_id === item.id)}
            onFavoritePress={() => handleToggleFavorite(item)}
          />
        )}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Ionicons name="cafe-outline" size={64} color="#E4CAAA" />
            <Text style={styles.emptyStateTitle}>No places saved yet :(</Text>
            <Text style={styles.emptyStateSubtitle}>Tap the + button to add your first spot.</Text>
          </View>
        )}
        contentContainerStyle={
          sortedCafes.length === 0
            ? [styles.emptyListContent, { paddingBottom: insets.bottom + 92 }]
            : { paddingTop: 8, paddingBottom: insets.bottom + 92 }
        }
      />

      <AddCafeButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#35545ad7',
    padding: 16,
  },

  heading: {
    fontSize: 70,
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

  sortSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },

  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },

  sortLabel: {
    fontSize: 18,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#E4CAAA',
  },

  dropdownWrapper: {
    width: 170,
    height: 38,
    justifyContent: 'center',
    backgroundColor: '#FAF3DD',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#690b22',
    paddingHorizontal: 4,
  },

  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingHorizontal: 12,
  },

  dropdownButtonText: {
    color: '#690b22',
    fontFamily: 'SpaceMono',
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  dropdownMenu: {
    width: '100%',
    maxWidth: 260,
    backgroundColor: '#FAF3DD',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#690b22',
    paddingVertical: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  dropdownItemActive: {
    backgroundColor: '#690b22',
  },

  dropdownItemText: {
    color: '#690b22',
    fontFamily: 'SpaceMono',
    fontSize: 14,
  },

  dropdownItemTextActive: {
    color: '#FAF3DD',
    fontWeight: 'bold',
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 38,
    paddingHorizontal: 14,
    backgroundColor: '#FAF3DD',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#690b22',
  },

  editButtonActive: {
    backgroundColor: '#690b22',
  },

  editButtonText: {
    fontSize: 13,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#690b22',
  },

  editButtonTextActive: {
    color: '#FAF3DD',
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -36,
  },

  emptyStateTitle: {
    marginTop: 14,
    fontSize: 24,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#E4CAAA',
    textAlign: 'center',
  },

  emptyStateSubtitle: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'SpaceMono',
    color: '#E4CAAA',
    opacity: 0.9,
    textAlign: 'center',
  },
});

