import { View, Text, FlatList, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CafeCard from '../../src/components/CafeCard';
import { useState, useEffect, useMemo } from 'react';
import { searchPlaces, searchSpecifiedPlaces } from '../../src/api/search';
import { useCafes } from '../../src/context/CafesContext';
import { getUserLocation } from '../../src/utils/location';
import { getFavorites, addFavorite, removeFavorite } from '../../src/api/dashboard';
import { useAuth } from '../../src/context/AuthContext';

type Cafe = {
  id: string;
  name: string;
  image?: string;
  photos?: string[];
  rating: number;
  ratingCount: number;
  distance_from_user?: number;
  busyness?: string;
  busyness_description?: string;
  busyness_percent?: number;
  distance?: string;
  seatsAvailable?: number;
  seats_available?: number;
  totalSeats?: number;
};

const CATEGORY_BUTTONS = [
  { label: 'Cafes', query: 'cafes' },
  { label: 'Restaurants', query: 'restaurants' },
  { label: 'Study spaces', query: 'study spaces' },
  { label: 'Brunch', query: 'brunch' },
  { label: 'Bars', query: 'bars' },
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

//fallback if real busyness data is not available, use a mock ranking based on the cafe's id or name
function getMockSeed(value: unknown) {
  return String(value ?? '')
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
}

function getBusynessRank(cafe: Cafe) {
  const rawBusyness = cafe.busyness ?? cafe.busyness_description;

  if (rawBusyness != null) {
    return BUSYNESS_RANK[String(rawBusyness).trim().toLowerCase()] ?? 1;
  }

  return getMockSeed(cafe.id ?? cafe.name) % 3;
}

function getSeatsAvailable(cafe: Cafe) {
  const seats = cafe.seatsAvailable ?? cafe.seats_available;

  if (typeof seats === 'number') {
    return seats;
  }

  return 2 + (getMockSeed(cafe.id ?? cafe.name) % 10);
}

type AuthContextValue = {
  token: string | null;
  loading: boolean;
};

export default function ExploreScreen() {
  const { addCafe } = useCafes();
  const auth = useAuth() as AuthContextValue | null;
  const token = auth?.token ?? null;
  const authLoading = auth?.loading ?? false;
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [results, setResults] = useState<Cafe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [sortMode, setSortMode] = useState('default');
  const [sortOpen, setSortOpen] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const isInitialEmptyState = results.length === 0 && query.length === 0;

  // Fetch favorites on mount
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!token) {
      setFavorites([]);
      return;
    }

    getFavorites().then(setFavorites).catch(console.error);
  }, [authLoading, token]);

  function handleAddCafe(cafe: Cafe) {
    addCafe(cafe);
  }

  async function handleTextSearch() {
    setIsSearching(true);

    let coords = await getUserLocation();
    if (!coords) {
      coords = { latitude: 37.7765, longitude: -122.4170 }; //default coords?
    }

    try {
      const raw = await searchPlaces(query, coords.latitude, coords.longitude);
      setResults(raw);
      setError(null);
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }

  async function handleCategoryPress(category: { label: string; query: string }) {
    setActiveCategory(category.query);
    setQuery(category.label);
    setIsSearching(true);

    let coords = await getUserLocation();
    if (!coords) {
      coords = { latitude: 37.7765, longitude: -122.4170 };
    }

    try {
      const raw = await searchSpecifiedPlaces(category.query, coords.latitude, coords.longitude);
      setResults(raw);
      setError(null);
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : 'Category search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }

  async function handleToggleFavorite(cafe: Cafe) {
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

  return (
    <View style={styles.container}>

      {/* Header */}
      <Text style={styles.heading}>Find your next brew</Text>
      <Text style={styles.subheading}>Search for a cafÃ© or restaurant near you</Text>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#6c5550" style={styles.searchIcon} />
        <TextInput
          placeholder="E.g. cozy cafe near me"
          placeholderTextColor="#6c5550"
          value={query}
          onChangeText={(text) => {
            setError(null);
            setQuery(text);
          }}
          onSubmitEditing={async () => {
            setActiveCategory('');
            await handleTextSearch();//API call to search for cafes based on the query when the user submits the search
          }}
          returnKeyType="search" //search key on mobile keyboard
          style={styles.input}
        />
        
        {query.length > 0 && ( //conditional rendering of the clear button, falsy, short-circuits
          <Ionicons
            name="close-circle" //cancel symbol 
            size={18}
            color="#6c5550"
            onPress={() => {
              setQuery('');
              setActiveCategory('');
              setResults([]);
              setError(null);
            }}
          />
        )}
      </View>
        
      <View style={styles.categoryRow}> 
        {isInitialEmptyState ? (
          <View style={styles.categoryWrapCentered}>
            {CATEGORY_BUTTONS.map((category) => {
              const active = category.query === activeCategory;
              return (
                <TouchableOpacity
                  key={category.query}
                  style={[styles.categoryButton, active && styles.categoryButtonActive]}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.categoryButtonText, active && styles.categoryButtonTextActive]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : ( //user has searched or selected a category, show horizontal scroll of categories instead of centered wrap
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORY_BUTTONS.map((category) => {
              const active = category.query === activeCategory;
              return (
                <TouchableOpacity
                  key={category.query}
                  style={[styles.categoryButton, active && styles.categoryButtonActive]}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.85}
                > {/*conditional styling of the category button based on whether it is active or not, and onPress calls handleCategoryPress to perform a search for that category*/}
                  <Text style={[styles.categoryButtonText, active && styles.categoryButtonTextActive]}> 
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
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

        
      <Modal //sort dropdown modal (popup floats) becomes visible when the user taps the sort button, and disappears when the user taps outside of it or selects an option
        visible={sortOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortOpen(false)}
      > 
        <Pressable style={styles.modalOverlay} onPress={() => setSortOpen(false)}> {/*modal dismiss on backdrop click, but not on content click */}
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

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Results */}
      <FlatList
        data={isSearching ? [] : sortedResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CafeCard 
            cafe={item} 
            onAddPress={() => handleAddCafe(item)} 
            isFavorite={favorites.some(f => f.cafe_id === item.id)}
            onFavoritePress={() => handleToggleFavorite(item)}
          />
        )}
        ListEmptyComponent={
          isSearching ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#E4CAAA" />
              <Text style={styles.emptyText}>Finding spots near you...</Text>
            </View>
          ) : isInitialEmptyState ? (
            <View style={styles.emptyState}>
              <Ionicons name="cafe-outline" size={64} color="#E4CAAA" />
              <Text style={styles.emptyText}>Start typing to find cafes near you</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="sad-outline" size={64} color="#E4CAAA" />
              <Text style={styles.emptyText}>No results :(</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bb603f',
    padding: 16,
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
    marginBottom: 20,
    textAlign: 'center',
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
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    marginTop: 14,
    fontSize: 24,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#E4CAAA',
    textAlign: 'center',
  },
  categoryRow: {
    marginBottom: 18,
  },
  categoryWrapCentered: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  categoryScroll: {
    gap: 10,
    paddingRight: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FAF3DD',
    borderWidth: 1.5,
    borderColor: '#690b22',
  },
  categoryButtonActive: {
    backgroundColor: '#690b22',
  },
  categoryButtonText: {
    fontSize: 13,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#690b22',
  },
  categoryButtonTextActive: {
    color: '#FAF3DD',
  },

  errorText: {
    color: '#8b0000',
    fontSize: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
});
