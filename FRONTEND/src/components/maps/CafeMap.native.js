import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BUSYNESS_STYLES = {
  Quiet:    { bg: '#E3F4ED', dot: '#1A7A5E', text: '#1A7A5E', label: 'Quiet' },
  Moderate: { bg: '#FDF1DC', dot: '#B5760A', text: '#B5760A', label: 'Moderate' },
  Busy:     { bg: '#FBE6E4', dot: '#C0392B', text: '#C0392B', label: 'Busy' },
};

function BusynessBadge({ busyness, percent }) {
  const busy = BUSYNESS_STYLES[busyness] || null;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!busy) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.5, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [busy]);

  if (!busy) return null;

  return (
    <View style={[styles.busynessBadge, { backgroundColor: busy.bg }]}>
      <Animated.View style={[styles.busynessDot, { backgroundColor: busy.dot, transform: [{ scale: pulse }] }]} />
      <Text style={[styles.busynessText, { color: busy.text }]}>{busy.label} | {percent ?? ''}%</Text>
    </View>
  );
}

export default function CafeMap({ cafes, region, permissionDenied, onSelectCafe }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const headingFontSize = Math.max(30, Math.min(42, Math.round(width * 0.095)));

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        region={region}
        showsUserLocation
        showsMyLocationButton
      >
        {cafes.map((cafe) => {
          if (cafe.latitude == null || cafe.longitude == null) return null;
          const percent = cafe.busynessPercent ?? cafe.busyness_percent;
          let pinColor = '#690b22'; // default brand maroon
          if (typeof percent === 'number') {
            if (percent < 35) pinColor = '#00A86B'; // green for quiet
            else if (percent < 70) pinColor = '#FFB347'; // orange for moderate
            else pinColor = '#FF4757'; // red for busy
          } else if (cafe.busyness) {
            const label = String(cafe.busyness).toLowerCase();
            if (label.includes('quiet') || label.includes('low')) pinColor = '#00A86B';
            else if (label.includes('moderate') || label.includes('medium')) pinColor = '#FFB347';
            else if (label.includes('busy') || label.includes('high')) pinColor = '#FF4757';
          }

          return (
            <Marker
              key={cafe.id}
              coordinate={{ latitude: cafe.latitude, longitude: cafe.longitude }}
              pinColor={pinColor}
            >
              {/* Tapping a pin shows this info card; tapping the card opens the cafe page */}
              <Callout tooltip onPress={() => onSelectCafe(cafe.id)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>{cafe.name}</Text>
                  <View style={styles.calloutMetaRow}>
                    <Ionicons name="star" size={12} color="#F5A623" />
                    <Text style={styles.calloutMeta}>{cafe.rating}</Text>
                    <Text style={styles.calloutMeta}>| {cafe.distanceLabel} away</Text>
                  </View>
                  <BusynessBadge busyness={cafe.busyness} percent={percent} />
                  <Text style={styles.calloutLink}>View details -&gt;</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Floating header */}
      <View style={[styles.headerOverlay, { top: insets.top + 8 }]} pointerEvents="none">
        <Text style={[styles.heading, { fontSize: headingFontSize }]}>Your Map</Text>
        <Text style={styles.subheading}>
          {permissionDenied
            ? 'Enable location to see distances from you.'
            : 'Your saved cafes, near you.'}
        </Text>
      </View>

      {cafes.length === 0 && (
        <View style={[styles.emptyOverlay, { bottom: insets.bottom + 16 }]} pointerEvents="none">
          <Text style={styles.emptyText}>No saved cafes to map yet.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ceb793',
  },
  headerOverlay: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(250, 243, 221, 0.92)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heading: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'Funky-Vintage',
    color: '#690b22',
  },
  subheading: {
    fontSize: 13,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#690b22',
  },
  callout: {
    backgroundColor: '#FAF3DD',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 150,
    borderWidth: 1.5,
    borderColor: '#690b22',
  },
  calloutName: {
    fontSize: 15,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#690b22',
    marginBottom: 2,
  },
  calloutMeta: {
    fontSize: 12,
    fontFamily: 'SpaceMono',
    color: '#813D18',
  },
  calloutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  calloutLink: {
    fontSize: 12,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#1A7A5E',
  },
  busynessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  busynessDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  busynessText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calloutBusy: {
    fontSize: 12,
    fontFamily: 'SpaceMono',
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  emptyOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(250, 243, 221, 0.92)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#690b22',
  },
});

