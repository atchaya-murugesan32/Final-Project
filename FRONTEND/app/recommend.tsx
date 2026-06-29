import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import CafeCard from '../src/components/CafeCard';
import { mockCafes } from '../src/data/mockCafes';
import { useCafes } from '../src/context/CafesContext';
import { getUserLocation } from '../src/utils/location';
import { searchVibe } from '../src/api/search';
import AIChatBot from '../src/components/AIChatBot';
import { getVibeRecommendation } from '../src/api/ai';

const VIBE_TAGS = ['Date night', 'Family brunch', 'Drinks with the girls'];

export default function RecommendScreen() {
  const router = useRouter();
  const { addCafe, cafes } = useCafes();
  const [activeVibe, setActiveVibe] = useState('Date night');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock "AI" recommendation: filter cafes by the selected vibe, best-rated first
  const recommendations = useMemo(() => {
    return mockCafes
      .filter((cafe) => cafe.vibeTags?.includes(activeVibe))
      .sort((a, b) => b.rating - a.rating);
  }, [activeVibe]);

  const savedIds = useMemo(() => new Set(cafes.map((c: any) => c.id)), [cafes]);

  async function handleSearchByVibe() {
    setIsSearching(true);
    const coords = (await getUserLocation()) ?? { latitude: 37.7765, longitude: -122.4170 };
    const raw = await searchVibe(query, coords.latitude, coords.longitude);
    setResults(raw);
    setIsSearching(false);
  }

  const displayResults = isSearching ? [] : query.trim().length > 0 ? results : recommendations;

  const [aiInsight, setAiInsight] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (recommendations.length > 0) {
      setLoadingAi(true);
      setAiInsight('');
      getVibeRecommendation(activeVibe, recommendations)
        .then(res => setAiInsight(res.response))
        .catch(err => {
          console.error(err);
          setAiInsight("I think you'll love these spots!");
        })
        .finally(() => setLoadingAi(false));
    } else {
      setAiInsight('');
    }
  }, [activeVibe, recommendations]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color="#690b22" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.aiBadge} onPress={() => setChatOpen(true)} activeOpacity={0.8}>
          <Ionicons name="sparkles" size={14} color="#690b22" />
          <Text style={styles.aiBadgeText}>AI Recommendation</Text>
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
          onChangeText={setQuery}
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
            }}
          />
        )}
      </View>

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
                onPress={() => setActiveVibe(vibe)}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{vibe}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* AI Insight */}
      {(loadingAi || aiInsight !== '') && (
        <View style={styles.aiInsightContainer}>
          <Ionicons name="sparkles" size={16} color="#690b22" style={{ marginTop: 2 }} />
          {loadingAi ? (
            <Text style={styles.aiInsightText}>Gemini is analyzing your vibe...</Text>
          ) : (
            <Text style={styles.aiInsightText}>{aiInsight}</Text>
          )}
        </View>
      )}

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
          <View style={styles.emptyState}>
            <Ionicons name="cafe-outline" size={48} color="#690b22" />
            <Text style={styles.emptyText}>
              {query.trim().length > 0
                ? 'No results for that vibe search'
                : 'No matches for this vibe yet'}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
      />
      <AIChatBot visible={chatOpen} onClose={() => setChatOpen(false)} />
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
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF3DD',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#690b22',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  aiBadgeText: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#690b22',
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
    fontFamily: 'monospace',
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
  chipsContainer: {
    marginBottom: 6,
  },
  chipsRow: {
    gap: 8,
    paddingRight: 8,
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
    fontFamily: 'monospace',
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
    fontFamily: 'monospace',
    color: '#690b22',
    textAlign: 'center',
  },
  aiInsightContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(250, 243, 221, 0.7)',
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(105, 11, 34, 0.2)',
  },
  aiInsightText: {
    flex: 1,
    fontSize: 14,
    color: '#690b22',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});
