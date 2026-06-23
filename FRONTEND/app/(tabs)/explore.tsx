import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CafeCard from '../../src/components/CafeCard';
import { useState } from 'react';
import { searchPlaces } from '../../src/api/search';
import { useCafes } from '../../src/context/CafesContext';
import { getUserLocation } from '../../src/utils/location';

type Cafe = {
  id: string;
  name: string;
  image: string;
  rating: number;
  ratingCount: number;
  busyness: string;
  distance: string;
  seatsAvailable: number;
  totalSeats: number;
};

export default function ExploreScreen() {
  const { addCafe } = useCafes();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Cafe[]>([]);
  const [busynessMap, setBusynessMap] = useState<Record<string, { busyness: string; busynessPercent: number }>>({});

  function generateRandomBusyness() {
    const percent = Math.floor(Math.random() * 86) + 5; // 5 - 90
    let label = 'Moderate';
    if (percent < 35) label = 'Quiet';
    else if (percent >= 70) label = 'Busy';
    return { busyness: label, busynessPercent: percent };
  }

  function handleAddCafe(cafe: Cafe) {
    //setResults((prev) => prev.filter((c) => c.id !== cafe.id));
    addCafe(cafe);
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <Text style={styles.heading}>Find your next brew</Text>
      <Text style={styles.subheading}>Search for a café or restaurant near you</Text>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#6c5550" style={styles.searchIcon} />
        <TextInput
          placeholder="cozy cafe near me"
          placeholderTextColor="#690b22"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={async () => {
            let coords = await getUserLocation();
            // On web or when location permission denied, fall back to a sensible default
            if (!coords) {
              coords = { latitude: 37.7765, longitude: -122.4170 };
            }
            const raw = await searchPlaces(query, coords.latitude, coords.longitude);
            // Generate display-only busyness values for UI (do not mutate the original items)
            const newMap: Record<string, { busyness: string; busynessPercent: number }> = {};
            raw.forEach((item: any) => {
              // preserve any existing UI map entry
              if (!busynessMap[item.id]) {
                newMap[item.id] = generateRandomBusyness();
              }
            });
            setBusynessMap((prev) => ({ ...prev, ...newMap }));
            setResults(raw);
          }}
          returnKeyType="search"
          style={styles.input}
        />
        {query.length > 0 && (
          <Ionicons
            name="close-circle"
            size={18}
            color="#6c5550"
            onPress={() => {
              setQuery('');
              setResults([]);
            }}
          />
        )}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CafeCard cafe={item} uiBusyness={busynessMap[item.id]} onAddPress={() => handleAddCafe(item)} />
        )}
        ListEmptyComponent={
          query.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cafe-outline" size={48} color="#690b22" />
              <Text style={styles.emptyText}>Start typing to find cafés near you</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ceb793',
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
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3DD',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    width: '80%',
    maxWidth: 360,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2933',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#690b22',
    textAlign: 'center',
  },
});