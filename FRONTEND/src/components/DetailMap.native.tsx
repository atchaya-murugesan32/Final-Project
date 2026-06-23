import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import Svg, { Path } from 'react-native-svg';

// Custom retro coffee cup SVG badge marker
const CoffeeCupIcon = () => (
  <View style={styles.markerContainer}>
    <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
        fill="#FAF3DD"
        stroke="#690b22"
        strokeWidth="2"
      />
      <Path
        d="M6 9H15V13C15 15.21 13.21 17 11 17H10C7.79 17 6 15.21 6 13V9Z"
        fill="#690b22"
      />
      <Path
        d="M15 10H16.5C17.33 10 18 10.67 18 11.5C18 12.33 17.33 13 16.5 13H15V10Z"
        fill="#690b22"
      />
      <Path
        d="M5 19H17"
        stroke="#690b22"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

export default function DetailMap({ latitude, longitude, name, address, mapsUri, busyness, busynessPercent }) {
  if (latitude == null || longitude == null) return null;

  const percent = busynessPercent ?? (typeof busyness === 'number' ? busyness : undefined);
  let pinColor = '#690b22';
  if (typeof percent === 'number') {
    if (percent < 35) pinColor = '#00A86B';
    else if (percent < 70) pinColor = '#FFB347';
    else pinColor = '#FF4757';
  } else if (busyness) {
    const label = String(busyness).toLowerCase();
    if (label.includes('quiet') || label.includes('low')) pinColor = '#00A86B';
    else if (label.includes('moderate') || label.includes('medium')) pinColor = '#FFB347';
    else if (label.includes('busy') || label.includes('high')) pinColor = '#FF4757';
  }

  const busyLabel = busyness || (typeof percent === 'number' ? `${percent}%` : null);

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
      <View style={[styles.calloutBadge, { backgroundColor: busy.bg }]}>
        <Animated.View style={[styles.calloutDot, { backgroundColor: busy.dot, transform: [{ scale: pulse }] }]} />
        <Text style={[styles.calloutBadgeText, { color: busy.text }]}>{busy.label} • {percent ?? ''}%</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker coordinate={{ latitude, longitude }} pinColor={pinColor}>
          <Callout tooltip>
            <View style={styles.callout}>
              <Text style={styles.calloutName}>{name}</Text>
              <Text style={styles.calloutMeta}>{address}</Text>
              <BusynessBadge busyness={busyness} percent={percent} />
            </View>
          </Callout>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callout: {
    backgroundColor: '#FAF3DD',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1.2,
    borderColor: '#690b22',
    minWidth: 140,
  },
  calloutName: {
    fontWeight: '700',
    color: '#690b22',
    marginBottom: 4,
  },
  calloutMeta: {
    color: '#813D18',
    marginBottom: 4,
  },
  calloutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  calloutDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  calloutBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
