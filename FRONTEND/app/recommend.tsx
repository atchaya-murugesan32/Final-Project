import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import CafeCard from '../src/components/CafeCard';
import { useCafes } from '../src/context/CafesContext';
import { getUserLocation } from '../src/utils/location';
import { searchVibe } from '../src/api/search';

const VIBE_TAGS = [
  'Date night',
  'Family brunch',
  'Drinks with the girls',
  'Study Session',
  'Quiet and Cosy',
];

const SORT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Rating', value: 'rating' },
  { label: 'Nearest', value: 'distance' },
  { label: 'Busyness', value: 'busyness' },
  { label: 'Seats available', value: 'seats' },
  { label: 'Name', value: 'name' },
];

const BUSYNESS_RANK: Record<string, number> = {
  quiet: 0,
  low: 0,
  moderate: 1,
  average: 1,
  busy: 2,
  high: 2,
};

function getMockSeed(value: unknown) {
  return String(value ?? '')
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
}

function getBusynessRank(cafe: any) {
  const rawBusyness =
    cafe.busyness ??
    cafe.busyness_description ??
    cafe.busynessDescription;

  if (rawBusyness != null) {
    return BUSYNESS_RANK[String(rawBusyness).trim().toLowerCase()] ?? 1;
  }

  return getMockSeed(cafe.id ?? cafe.name) % 3;
}

function getSeatsAvailable(cafe: any) {
  const seats = cafe.seatsAvailable ?? cafe.seats_available;

  if (typeof seats === 'number') {
    return seats;
  }

  return 2 + (getMockSeed(cafe.id ?? cafe.name) % 10);
}

export default function RecommendScreen() {
  const router = useRouter();
  const { addCafe } = useCafes();
  const [activeVibe, setActiveVibe] = useState('Date night');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState('default');
  const [sortOpen, setSortOpen] = useState(false);

  async function runVibeSearch(vibeQuery: string) {
    const trimmedQuery = vibeQuery.trim();
    if (!trimmedQuery) {
      setResults([]);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const coords = (await getUserLocation()) ?? { latitude: 37.7765, longitude: -122.4170 };
      const raw = await searchVibe(trimmedQuery, coords.latitude, coords.longitude);
      setResults(raw);
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : 'Vibe search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSearchByVibe() {
    await runVibeSearch(query);
  }

  async function handleSelectVibe(vibe: string) {
    setActiveVibe(vibe);
    setQuery(vibe);
    await runVibeSearch(vibe);
  }

  const hasQuery = query.trim().length > 0;
  const selectedSortOption = SORT_OPTIONS.find((option) => option.value === sortMode);

  const sortedResults = useMemo(() => {
    const copy = [...results];

    switch (sortMode) {
      case 'rating':
        return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'distance':
        return copy.sort((a, b) => (a.distance_from_user ?? Number.MAX_SAFE_INTEGER) - (b.distance_from_user ?? Number.MAX_SAFE_INTEGER));
      case 'busyness':
        return copy.sort((a, b) => getBusynessRank(a) - getBusynessRank(b));
      case 'seats':
        return copy.sort((a, b) => getSeatsAvailable(b) - getSeatsAvailable(a));
      case 'name':
        return copy.sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')));
      case 'default':
      default:
        return copy;
    }
  }, [results, sortMode]);

  const displayResults = isSearching || !hasQuery ? [] : sortedResults;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color="#690b22" />
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Picked for your vibe</Text>
      <Text style={styles.subheading}>Choose a vibe and we'll match the mood.</Text>

      {/* Vibe search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#6c5550" style={styles.searchIcon} />
        <TextInput
          placeholder="Search by vibe"
          placeholderTextColor="#690b22"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setError(null);
          }}
          onSubmitEditing={handleSearchByVibe}
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
              setError(null);
            }}
          />
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Vibe tag filter */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {VIBE_TAGS.map((vibe) => {
            const active = vibe === activeVibe;
            return (
              <TouchableOpacity
                key={vibe}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => handleSelectVibe(vibe)}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{vibe}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.sortSection}>
        <View style={styles.sortBar}>
          <Text style={styles.sortLabel}>Sort by</Text>
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setSortOpen(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.dropdownButtonText}>{selectedSortOption?.label ?? 'Select'}</Text>
              <Ionicons name="chevron-down" size={18} color="#690b22" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={sortOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSortOpen(false)}>
          <Pressable style={styles.dropdownMenu} onPress={() => {}}>
            {SORT_OPTIONS.map((option) => {
              const active = option.value === sortMode;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                  onPress={() => {
                    setSortMode(option.value);
                    setSortOpen(false);
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

      {/* Recommendations */}
      <FlatList
        data={displayResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CafeCard
            cafe={item}
            onAddPress={() => addCafe(item)}
          />
        )}
        ListEmptyComponent={
          isSearching ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#690b22" />
              <Text style={styles.emptyText}>Finding spots for that vibe...</Text>
            </View>
          ) : hasQuery ? (
            <View style={styles.emptyState}>
              <Ionicons name="cafe-outline" size={48} color="#690b22" />
              <Text style={styles.emptyText}>No results for that vibe search</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  heading: {
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily: 'Funky-Vintage',
    color: '#690b22',
    marginTop: 12,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#690b22',
    marginBottom: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF3DD',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    width: '100%',
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
  errorText: {
    color: '#8b0000',
    fontSize: 13,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  chipsContainer: {
    marginBottom: 6,
  },
  chipsRow: {
    gap: 8,
    paddingRight: 8,
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
    fontSize: 16,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#690b22',
  },
  dropdownWrapper: {
    width: 150,
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
    backgroundColor: 'rgba(105, 11, 34, 0.08)',
  },
  dropdownItemText: {
    color: '#690b22',
    fontFamily: 'SpaceMono',
    fontSize: 14,
  },
  dropdownItemTextActive: {
    fontWeight: 'bold',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FAF3DD',
    borderWidth: 1.5,
    borderColor: '#690b22',
  },
  chipActive: {
    backgroundColor: '#690b22',
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#690b22',
  },
  chipTextActive: {
    color: '#FAF3DD',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    color: '#690b22',
    textAlign: 'center',
  },
});

