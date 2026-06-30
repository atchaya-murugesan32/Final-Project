import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mockCafes } from '../../src/data/mockCafes';
import { useMemo } from 'react';
import { useCafes } from '../../src/context/CafesContext';
import DetailMap from '../../src/components/maps/DetailMap';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Predefined high-quality coffee-themed fallback photos
const FALLBACK_POLAROIDS = [
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=500&q=80', // Diner Interior
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80', // Barista pouring latte art
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80'  // Coffee Mug on wooden table
];

// SVG spiral notebook binding decoration at the top of the notepad card
const SpiralHeader = () => (
  <View style={styles.spiralHeaderContainer}>
    <Svg height="30" width="100%" viewBox="0 0 300 30" preserveAspectRatio="none">
      {Array.from({ length: 9 }).map((_, idx) => {
        const x = 18 + idx * 32;
        return (
          <G key={idx}>
            {/* Dark steel spiral wire loop */}
            <Rect x={x} y="2" width="7" height="24" rx="3.5" fill="#5E503F" stroke="#221A0F" strokeWidth="1" />
            {/* Spiral binding punched paper hole revealing background */}
            <Circle cx={x + 3.5} cy="18" r="3" fill="#FAF5E6" />
          </G>
        );
      })}
    </Svg>
  </View>
);

// SVG jagged torn paper edge effect at the top of the notepad card
const TornEdge = () => (
  <View style={styles.tornEdgeContainer}>
    <Svg height="10" width="100%" viewBox="0 0 100 10" preserveAspectRatio="none">
      <Path d="M0,10 L2.5,2 L5,10 L7.5,2 L10,10 L12.5,2 L15,10 L17.5,2 L20,10 L22.5,2 L25,10 L27.5,2 L30,10 L32.5,2 L35,10 L37.5,2 L40,10 L42.5,2 L45,10 L47.5,2 L50,10 L52.5,2 L55,10 L57.5,2 L60,10 L62.5,2 L65,10 L67.5,2 L70,10 L72.5,2 L75,10 L77.5,2 L80,10 L82.5,2 L85,10 L87.5,2 L90,10 L92.5,2 L95,10 L97.5,2 L100,10 V0 H0 Z" fill="#FAF5E6" />
    </Svg>
  </View>
);

// SVG Coffee Ring Stain overlay
const CoffeeStain = () => (
  <View style={styles.coffeeStain} pointerEvents="none">
    <Svg width="140" height="140" viewBox="0 0 100 100">
      <Circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="#813D18"
        strokeWidth="1.2"
        strokeDasharray="18, 4, 25, 6, 8, 3"
        opacity="0.1"
      />
      <Circle
        cx="51"
        cy="49"
        r="40"
        fill="none"
        stroke="#813D18"
        strokeWidth="0.6"
        strokeDasharray="10, 8, 5, 6"
        opacity="0.08"
      />
    </Svg>
  </View>
);

export default function CafeDetailScreen() {
  const router = useRouter();
  const { id, cafeData } = useLocalSearchParams();
  const { cafes } = useCafes();

  // Resolve the cafe object
  const cafe = useMemo(() => {
    if (cafeData) {
      try {
        return JSON.parse(cafeData as string);
      } catch (e) {
        console.error("Error parsing cafeData:", e);
      }
    }
    return mockCafes.find((c: any) => c.id === id) || cafes?.find((c: any) => c.id === id);
  }, [id, cafeData, cafes]);

  // Extract photos list
  const photoUrls = useMemo(() => {
    if (!cafe) return [];
    if (cafe.images && cafe.images.length > 0) {
      return cafe.images.map((img: any) => img.uri);
    }
    if (cafe.photos && cafe.photos.length > 0) {
      return cafe.photos;
    }
    return [];
  }, [cafe]);

  // Gather exactly 3 images, filling missing spaces with themed placeholders
  const polaroidImages = useMemo(() => {
    const images = [...photoUrls];
    for (let i = images.length; i < 3; i++) {
      images.push(FALLBACK_POLAROIDS[i % FALLBACK_POLAROIDS.length]);
    }
    return images.slice(0, 3);
  }, [photoUrls]);

  // Generate stable rotations for the polaroid cards based on cafe name length
  const polaroidRotations = useMemo(() => {
    if (!cafe) return ['-2deg', '2deg', '-1deg'];
    const nameSeed = cafe.name.length;
    return [
      `${((nameSeed * 3) % 9) - 4}deg`,
      `${((nameSeed * 7 + 2) % 9) - 4}deg`,
      `${((nameSeed * 11 + 5) % 9) - 4}deg`,
    ];
  }, [cafe]);

  const editorialSummaryText = useMemo(() => {
    if (!cafe) return '';

    const raw =
      cafe.editorial_summary ??
      cafe.review_summary ??
      cafe.reviewSummary?.text?.text ??
      cafe.reviewSummary?.text ??
      cafe.editorialSummary?.text ??
      cafe.editorialSummary;

    return typeof raw === 'string' ? raw.trim() : '';
  }, [cafe]);

  // Create fields mapping for the diner notepad card
  const notepadRows = useMemo(() => {
    if (!cafe) return [];
    const rows = [
      { label: 'NAME', value: cafe.name },
      { label: 'ADDR', value: cafe.address || cafe.formattedAddress },
      { label: 'RATING', value: cafe.rating ? `${cafe.rating} ★ (${cafe.rating_count || cafe.ratingCount || 0} revs)` : null },
      { label: 'PRICE', value: cafe.price_range || cafe.priceRange },
      { label: 'SITE', value: cafe.website_uri || cafe.websiteUri },
      { label: 'BUSY', value: cafe.busyness ? `${cafe.busyness} (${cafe.busynessPercent ?? cafe.busyness_percent ?? 0}%)` : null },
    ];

    if (cafe.seatsAvailable != null) {
      rows.push({ label: 'SEATS', value: `${cafe.seatsAvailable} free / ${cafe.totalSeats || 30} cap` });
    }

    if (cafe.opening_hours && cafe.opening_hours.length > 0) {
      const hoursStr = Array.isArray(cafe.opening_hours) ? cafe.opening_hours.join(', ') : cafe.opening_hours;
      rows.push({ label: 'HOURS', value: hoursStr });
    }

    return rows.filter((r) => r.value != null && r.value !== '');
  }, [cafe]);

  if (!cafe) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Café not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Semi-transparent noise grain overlay */}
      <Image
        source={require('../../assets/images/noise_overlay.png')}
        style={styles.noiseOverlay}
        resizeMode="repeat"
      />

      {/* Floating navigation header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#690b22" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>ZENBREW DETAILS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Large Diner Sign Header */}

          <Text style={styles.dinerSignText}>{cafe.name}</Text>
          <Text style={styles.editorialSummaryText}>
            "{editorialSummaryText || 'No editorial summary available yet.'}"
          </Text>
       

        {/* Scattered overlapping polaroids */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.polaroidContainer}
        >
          {polaroidImages.map((url, idx) => (
            <View
              key={idx}
              style={[
                styles.polaroidCard,
                { transform: [{ rotate: polaroidRotations[idx] }] }
              ]}
            >
              <Image source={{ uri: url }} style={styles.polaroidImage} />
              <Text style={styles.polaroidCaption}>
                {idx === 0 ? 'Cafe Vibe' : idx === 1 ? 'Perfect Brew' : 'Cozy Corner'}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Spiral Notebook Diner Notepad Card */}
        <View style={styles.notepadOuter}>
          <SpiralHeader />
          <View style={styles.notepadInner}>
            <TornEdge />
            <CoffeeStain />
            
            {/* Notepad content rows */}
            <View style={styles.notepadBody}>
              {/* Red vertical margin line */}
              <View style={styles.redMarginLine} />

              {notepadRows.map((row, idx) => (
                <View key={idx} style={styles.notepadRow}>
                  <View style={styles.labelCell}>
                    <Text style={styles.labelStyle} numberOfLines={1}>{row.label}</Text>
                  </View>
                  <View style={styles.valueCell}>
                    {row.label === 'SITE' ? (
                      <TouchableOpacity
                        onPress={() => {
                          try {
                            const raw = String(row.value || '');
                            const url = raw.match(/^https?:\/\//i) ? raw : `https://${raw}`;
                            Linking.openURL(url);
                          } catch (e) {
                            console.warn('Failed to open URL', e);
                          }
                        }}
                      >
                        <Text style={[styles.valueStyle, styles.linkStyle]} numberOfLines={1} ellipsizeMode="tail">
                          {row.value}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.valueStyle}>{row.value}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Map in a Polaroid frame */}
        <View style={styles.mapPolaroidFrame}>
          <DetailMap
            latitude={cafe.latitude}
            longitude={cafe.longitude}
            name={cafe.name}
            address={cafe.address || cafe.formattedAddress}
            mapsUri={cafe.maps_uri}
            busyness={cafe.busyness}
            busynessPercent={cafe.busynessPercent ?? cafe.busyness_percent}
          />
          <Text style={styles.mapPolaroidCaption}>📍 OUR LOCATION</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#873f2b',
  },
  noiseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.07,
    zIndex: 99,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    color: '#690b22',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(105, 11, 34, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF3DD',
    borderWidth: 1.5,
    borderColor: '#690b22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: '#f3e2d0',
    letterSpacing: 1.2,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  
  dinerSignText: {
    fontFamily: 'Funky-Vintage',
    fontSize: 50,
    color: '#f3e2d0',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 8,
  },
  editorialSummaryText: {
    marginHorizontal: 24,
    marginBottom: 34,
    fontFamily: 'SpaceMono',
    fontSize: 14,
    lineHeight: 20,
    color: '#f3e2d0',
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.95,
  },
  polaroidContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  polaroidCard: {
    backgroundColor: '#f3e2d0',
    padding: 10,
    paddingBottom: 22,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginHorizontal: 8,
    width: 170,
  },
  polaroidImage: {
    width: 150,
    height: 150,
    borderRadius: 1,
  },
  polaroidCaption: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: '#813D18',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  notepadOuter: {
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  spiralHeaderContainer: {
    height: 26,
    width: '100%',
    zIndex: 10,
  },
  notepadInner: {
    backgroundColor: '#FAF3DD', // Soft cream notepad color
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  tornEdgeContainer: {
    height: 10,
    width: '100%',
  },
  coffeeStain: {
    position: 'absolute',
    right: -10,
    bottom: 20,
    zIndex: 5,
  },
  notepadBody: {
    paddingTop: 10,
    paddingBottom: 20,
    position: 'relative',
  },
  redMarginLine: {
    position: 'absolute',
    left: 65,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: '#D9534F',
    opacity: 0.7,
    zIndex: 2,
  },
  notepadRow: {
    flexDirection: 'row',
    minHeight: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#D0E0E3', // Ruled paper blue lines
    alignItems: 'center',
  },
  labelCell: {
    width: 65,
    paddingRight: 10,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  valueCell: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 12,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  labelStyle: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#D9534F', // Margin color for index numbers / labels
    fontWeight: 'bold',
  },
  valueStyle: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: '#4A3B32',
    lineHeight: 18,
  },
  linkStyle: {
    color: '#0B66FF',
    textDecorationLine: 'underline',
  },
  mapPolaroidFrame: {
    backgroundColor: '#f3e2d0',
    padding: 12,
    paddingBottom: 24,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  mapPolaroidCaption: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#813D18',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
});
