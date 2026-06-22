import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';

export default function CafeMap({ cafes, region, permissionDenied, onSelectCafe }) {
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        region={region}
        showsUserLocation
        showsMyLocationButton
      >
        {cafes.map((cafe) =>
          cafe.latitude != null && cafe.longitude != null ? (
            <Marker
              key={cafe.id}
              coordinate={{ latitude: cafe.latitude, longitude: cafe.longitude }}
              pinColor="#690b22"
            >
              {/* Tapping a pin shows this info card; tapping the card opens the cafe page */}
              <Callout tooltip onPress={() => onSelectCafe(cafe.id)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>{cafe.name}</Text>
                  <Text style={styles.calloutMeta}>
                    {cafe.rating}★ · {cafe.distanceLabel} away
                  </Text>
                  <Text style={styles.calloutLink}>View details →</Text>
                </View>
              </Callout>
            </Marker>
          ) : null
        )}
      </MapView>

      {/* Floating header */}
      <View style={styles.headerOverlay} pointerEvents="none">
        <Text style={styles.heading}>Your Map</Text>
        <Text style={styles.subheading}>
          {permissionDenied
            ? 'Enable location to see distances from you.'
            : 'Your saved cafés, near you.'}
        </Text>
      </View>

      {cafes.length === 0 && (
        <View style={styles.emptyOverlay} pointerEvents="none">
          <Text style={styles.emptyText}>No saved cafés to map yet.</Text>
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
    fontFamily: 'monospace',
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
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#690b22',
    marginBottom: 2,
  },
  calloutMeta: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#813D18',
    marginBottom: 6,
  },
  calloutLink: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#1A7A5E',
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
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#690b22',
  },
});
