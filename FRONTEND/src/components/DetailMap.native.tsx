import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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

export default function DetailMap({ latitude, longitude, name, address, mapsUri }) {
  if (latitude == null || longitude == null) return null;

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
        <Marker coordinate={{ latitude, longitude }}>
          <CoffeeCupIcon />
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
});
