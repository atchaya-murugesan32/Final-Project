import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CafeCard from '../../src/components/CafeCard';
import { useCafes } from '../../src/context/CafesContext';
import AddCafeButton from '../../src/components/AddCafeButton';
import { useMemo, useState, useEffect } from 'react';
import { getFavorites, addFavorite, removeFavorite } from '../../src/api/dashboard';

const sortOptions = [
  { label: 'Most recent', value: 'recent' },
  { label: 'Rating', value: 'rating' },
  { label: 'Distance', value: 'distance' },
  { label: 'Busyness (%)', value: 'busyness' },
  { label: 'Seats available', value: 'seats' },
];

export default function CafeListScreen() {
  const { cafes, removeCafe } = useCafes();

  const [sortMode, setSortMode] = useState('recent');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    getFavorites().then(setFavorites).catch(console.error);
  }, []);

  async function handleToggleFavorite(cafe: any) {
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

  const selectedOption = sortOptions.find((option) => option.value === sortMode);

  const sortedCafes = useMemo(() => {
    const copy = [...cafes];

    switch (sortMode) {
      // Highest rating first
      case 'rating':
        return copy.sort((a, b) => b.rating - a.rating);

      // Nearest first
      case 'distance':
        return copy.sort((a, b) => a.distanceMi - b.distanceMi);

      // Relative busyness — least busy (lowest %) first
      case 'busyness':
        return copy.sort((a, b) => a.busynessPercent - b.busynessPercent);

      // Absolute availability — most free seats first
      case 'seats':
        return copy.sort((a, b) => b.seatsAvailable - a.seatsAvailable);

      case 'recent':
      default:
        return copy.sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
    }
  }, [cafes, sortMode]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Cafes</Text>
      <Text style={styles.subheading}>Cafes saved, and loved by you.</Text>

      {/* Sort dropdown */}
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
        contentContainerStyle={{ paddingVertical: 8 }}
      />

      <AddCafeButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a58e1ed2',
    padding: 16,
  },

  heading: {
    fontSize: 50,
    fontWeight: 'bold',
    fontFamily: 'Funky-Vintage',
    color: '#690b22',
    marginTop: 8,
    marginBottom: 4,
  },

  subheading: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#690b22',
    marginBottom: 16,
  },

  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },

  sortLabel: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#690b22',
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
    fontFamily: 'monospace',
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
    fontFamily: 'monospace',
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
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#690b22',
  },

  editButtonTextActive: {
    color: '#FAF3DD',
  },
});
