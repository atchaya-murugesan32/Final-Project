import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import CafeCard from '../src/components/CafeCard';
import { mockCafes } from '../src/data/mockCafes';
import { useCafes } from '../src/context/CafesContext';

const VIBE_TAGS = ['Date night', 'Family brunch', 'Drinks with the girls'];

export default function RecommendScreen() {
  const router = useRouter();
  const { addCafe, cafes } = useCafes();
  const [activeVibe, setActiveVibe] = useState('Date night');

  // Mock "AI" recommendation: filter cafes by the selected vibe, best-rated first
  const recommendations = useMemo(() => {
    return mockCafes
      .filter((cafe) => cafe.vibeTags?.includes(activeVibe))
      .sort((a, b) => b.rating - a.rating);
  }, [activeVibe]);

  const savedIds = useMemo(() => new Set(cafes.map((c) => c.id)), [cafes]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color="#690b22" />
        </TouchableOpacity>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={14} color="#690b22" />
          <Text style={styles.aiBadgeText}>AI Recommendation</Text>
        </View>
      </View>

      <Text style={styles.heading}>Picked for your vibe</Text>
      <Text style={styles.subheading}>Choose a vibe and we'll match the mood.</Text>

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

      {/* Recommendations */}
      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          savedIds.has(item.id) ? (
            <CafeCard cafe={item} />
          ) : (
            <CafeCard cafe={item} onAddPress={() => addCafe(item)} />
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cafe-outline" size={48} color="#690b22" />
            <Text style={styles.emptyText}>No matches for this vibe yet</Text>
          </View>
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
});
