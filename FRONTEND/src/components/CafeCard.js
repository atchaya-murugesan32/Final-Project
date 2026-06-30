import { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCafes } from '../context/CafesContext';
import ReservationModal from './ReservationModal';

const CARD_WIDTH = Math.min(Dimensions.get('window').width - 32, 500);

const BUSYNESS_STYLES = {
  Quiet:    { bg: '#E3F4ED', dot: '#1A7A5E', text: '#1A7A5E', label: 'Quiet' },
  Moderate: { bg: '#FDF1DC', dot: '#B5760A', text: '#B5760A', label: 'Moderate' },
  Busy:     { bg: '#FBE6E4', dot: '#C0392B', text: '#C0392B', label: 'Busy' },
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=600&q=80',
];

function getFallbackImage(cafe) {
  const seed = String(cafe?.id ?? cafe?.name ?? '')
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return FALLBACK_IMAGES[seed % FALLBACK_IMAGES.length];
}

function RetroText({ style, children, ...props }) {
  return (
    <Text
      {...props}
      style={[{ fontFamily: 'SpaceMono', color: '#813D18' }, style]}
    >
      {children}
    </Text>
  );
}

function StarRating({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        let name = 'star-outline';
        if (rating >= i) name = 'star';
        else if (rating >= i - 0.5) name = 'star-half';
        return <Ionicons key={i} name={name} size={12} color="#F5A623" />;
      })}
    </View>
  );
}

function BusynessBadge({ busyness, percent}) {
  const busy = BUSYNESS_STYLES[busyness];
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.5, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  // No (or unknown) busyness value yet - render nothing for now.
  if (!busy) return null;

  return (
    <View style={[styles.busynessBadge, { backgroundColor: busy.bg }]}>
      <Animated.View style={[styles.busynessDot, { backgroundColor: busy.dot, transform: [{ scale: pulse }] }]} />
      <RetroText style={[styles.busynessText, { color: busy.text }]}>{busy.label} - {percent}%</RetroText>
    </View>
  );
}

export default function CafeCard(props) {
  const {
    cafe,
    onAddPress,
    editMode = false,
    onRemovePress,
    onFavoritePress,
    isFavorite = false,
    uiBusyness,
  } = props;
  const router = useRouter();
  const { cafes } = useCafes();
  const added = cafes.some((item) => item.id === cafe.id);
  const [isReservationModalVisible, setReservationModalVisible] = useState(false);

  function handleAdd() {
    onAddPress?.();
  }

  const imageUri = cafe.photos?.[0] ?? cafe.images?.[0]?.uri ?? cafe.image ?? getFallbackImage(cafe);
  const ratingCount = cafe.rating_count ?? cafe.ratingCount ?? 0;
  const rating = typeof cafe.rating === 'number' ? cafe.rating : 0;
  const distanceFromUser = cafe.distance_from_user ?? cafe.distanceMi ?? null;
  const rawBusynessDescription =
    uiBusyness?.busynessDescription ??
    uiBusyness?.busyness_description ??
    uiBusyness?.busyness ??
    cafe.busyness_description ??
    cafe.busynessDescription ??
    cafe.busyness ??
    'Average';

  const descriptionMap = {
    low: 'Quiet',
    'below average': 'Quiet',
    average: 'Moderate',
    'above average': 'Busy',
    high: 'Busy',
    quiet: 'Quiet',
    moderate: 'Moderate',
    busy: 'Busy',
  };

  const displayBusyness =
    descriptionMap[String(rawBusynessDescription).trim().toLowerCase()] || 'Moderate';

  const rawBusynessPercent =
    uiBusyness?.busynessPercent ??
    uiBusyness?.busyness_percentage ??
    cafe.busyness_percentage ??
    cafe.busynessPercent ??
    cafe.busyness_percent ??
    0;

  const busynessPercent =
    typeof rawBusynessPercent === 'number' ? rawBusynessPercent : Number(rawBusynessPercent) || 0;
  const isBusy = busynessPercent >= 71;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/cafe/[id]', params: { id: cafe.id, cafeData: JSON.stringify(cafe) } })}
      activeOpacity={0.88}
    >
      {/* Image with overlays */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />

        {/* Name - top left overlay */}
        <View style={styles.imageOverlay}>
          <RetroText style={styles.overlayName} numberOfLines={1}>
            {cafe.name}
          </RetroText>
        </View>

        {/* Remove button - top right overlay, only in edit mode */}
        {editMode && onRemovePress && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemovePress}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <View style={styles.topRightActions}>
          {/* Favorite button */}
          {onFavoritePress && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => onFavoritePress()}
              activeOpacity={0.85}
            >
              <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#e91e63" : "#FFFFFF"} />
            </TouchableOpacity>
          )}

          {/* Add button */}
          {onAddPress && (
            <TouchableOpacity
              style={[styles.addButton, added && styles.addButtonAdded]}
              onPress={handleAdd}
              activeOpacity={added ? 1 : 0.85}
              disabled={added}
            >
              {added ? (
                <>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  <RetroText style={styles.addButtonText}>Added</RetroText>
                </>
              ) : (
                <Ionicons name="add" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Info section below image */}
      <View style={styles.info}>

        {/* Distance + seats row - each renders only when the value exists */}
        {(distanceFromUser != null || cafe.seatsAvailable != null) && (
          <View style={styles.metaRow}>
            {distanceFromUser != null && (
              <>
                <Ionicons name="time-outline" size={13} color="#9AA5B1" />
                <RetroText style={styles.metaText}>{distanceFromUser.toFixed(2)} km away</RetroText>
              </>
            )}
            {distanceFromUser != null && cafe.seatsAvailable != null && (
              <RetroText style={styles.metaDot}>|</RetroText>
            )}
            {cafe.seatsAvailable != null && (
              <>
                <Ionicons name="people-outline" size={13} color="#9AA5B1" />
                <RetroText style={styles.metaText}>{cafe.seatsAvailable} seats free</RetroText>
              </>
            )}
          </View>
        )}

        {/* Name + rating badge row */}
        <View style={styles.nameRow}>
          <RetroText style={styles.name} numberOfLines={2}>
            {cafe.name}
          </RetroText>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFFFFF" />
            <RetroText style={styles.ratingText}>{rating}</RetroText>
          </View>
        </View>

        {/* Busyness + star rating row */}
        <View style={styles.bottomRow}>
          <BusynessBadge busyness={displayBusyness} percent={busynessPercent} />
          <View style={styles.starRow}>
            <StarRating rating={rating} />
            <RetroText style={styles.ratingCount}>({ratingCount})</RetroText>
          </View>
        </View>

        <View style={styles.reserveContainer}>
          <TouchableOpacity 
            style={[styles.reserveButton, isBusy && styles.reserveButtonDisabled]}
            disabled={isBusy}
            onPress={() => setReservationModalVisible(true)}
          >
             <Text style={styles.reserveButtonText}>Reserve Table</Text>
          </TouchableOpacity>
          {isBusy && (
            <Text style={styles.busyMessageText}>Table reservation is currently unavailable because this cafe is busy.</Text>
          )}
        </View>

      </View>
      <ReservationModal
         visible={isReservationModalVisible}
         onClose={() => setReservationModalVisible(false)}
         cafe={cafe}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    backgroundColor: '#FAF3DD',
    borderRadius: 16,
    marginVertical: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    fontFamily: 'SpaceMono',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.45,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6d6c2',
  },
  placeholderText: {
    color: '#813D18',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    maxWidth: '70%',
  },
  topRightActions: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  favoriteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    height: 34,
    borderRadius: 17,
    backgroundColor: '#690b22',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonAdded: {
    backgroundColor: '#9AA5B1',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#C0392B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  info: {
    padding: 12,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
  },
  metaDot: {
    fontSize: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1A7A5E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  busynessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 6,
  },
  busynessDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  busynessText: {
    fontSize: 12,
    fontWeight: '600',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#9AA5B1',
  },
  reserveContainer: {
    marginTop: 6,
    alignItems: 'flex-start',
    gap: 6,
  },
  reserveButton: {
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FAF3DD',
    borderWidth: 1.5,
    borderColor: '#690b22',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  reserveButtonDisabled: {
    backgroundColor: '#E5D7C1',
    borderColor: '#9AA5B1',
  },
  reserveButtonText: {
    color: '#690b22',
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: 'bold',
  },
  busyMessageText: {
    color: '#813D18',
    fontFamily: 'SpaceMono',
    fontSize: 11,
    textAlign: 'left',
    lineHeight: 16,
    paddingHorizontal: 2,
  },
});
