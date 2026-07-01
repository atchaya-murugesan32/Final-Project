import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { removeFavorite } from '../../api/dashboard';

const { width } = Dimensions.get('window');

export default function FavoriteCafes({ favorites, onRefresh }) {
  if (!favorites || favorites.length === 0) return null;

  const handleRemove = async (cafeId) => {
    try {
      await removeFavorite(cafeId);
      onRefresh();
    } catch (e) {
      alert("Failed to remove favorite");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <Image 
        source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80' }} 
        style={styles.image} 
      />
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.cafe_id)}>
          <Ionicons name="trash-outline" size={20} color="#35545ad7" />
        </TouchableOpacity>
        
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.cafe_name}</Text>
          <View style={styles.row}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.ratingText}>{item.rating?.toFixed(1) || 'N/A'}</Text>
            </View>
            
            {item.occupancy_status && (
              <View style={[styles.badge, 
                item.occupancy_status === 'Free' ? styles.bgGreen : 
                item.occupancy_status === 'Busy' ? styles.bgRed : styles.bgYellow
              ]}>
                <Text style={styles.badgeText}>{item.occupancy_status}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Favorite Cafes</Text>
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={item => String(item.cafe_id ?? item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={width * 0.6 + 16}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    paddingHorizontal: 4,
    letterSpacing: -0.5,
    fontFamily: 'SpaceMono',
  },
  listContent: {
    paddingRight: 20,
    gap: 16,
  },
  cardContainer: {
    width: width * 0.6,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FAF3DD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FAF3DD',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  info: {
    marginTop: 'auto',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontFamily: 'SpaceMono',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ratingText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'SpaceMono',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  bgGreen: { backgroundColor: '#16a34a' },
  bgRed: { backgroundColor: '#35545ad7' },
  bgYellow: { backgroundColor: '#d97706' },
});
