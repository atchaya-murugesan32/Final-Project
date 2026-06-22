import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CafeCard from '../../src/components/CafeCard';
import { useCafes } from '../../src/context/CafesContext';
import AddCafeButton from '../../src/components/AddCafeButton';
import { useMemo, useState } from 'react';
import { Picker } from '@react-native-picker/picker';

export default function CafeListScreen() {
  const { cafes, removeCafe } = useCafes();

  const [sortMode, setSortMode] = useState('recent');
  const [editMode, setEditMode] = useState(false);

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
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={sortMode}
            onValueChange={(value) => setSortMode(value)}
            dropdownIconColor="#690b22"
            mode="dropdown"
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Most recent" value="recent" />
            <Picker.Item label="Rating" value="rating" />
            <Picker.Item label="Distance" value="distance" />
            <Picker.Item label="Busyness (%)" value="busyness" />
            <Picker.Item label="Seats available" value="seats" />
          </Picker>
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

      <FlatList
        data={sortedCafes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CafeCard
            cafe={item}
            editMode={editMode}
            onRemovePress={() => removeCafe(item.id)}
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
    fontFamily: 'monospace',
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

  pickerWrapper: {
    width: 170,
    height: 38,
    justifyContent: 'center',
    backgroundColor: '#FAF3DD',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#690b22',
    overflow: 'hidden',
    paddingHorizontal: 4,
  },

  picker: {
    color: '#690b22',
    fontFamily: 'monospace',
  },

  pickerItem: {
    color: '#690b22',
    fontFamily: 'monospace',
    fontSize: 14,
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
