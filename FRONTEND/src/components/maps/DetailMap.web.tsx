import React from 'react';
import { StyleSheet, View, Text, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DetailMap({ latitude, longitude, name, address, mapsUri, busyness, busynessPercent }) {

  const handleOpenMaps = () => {
    if (mapsUri) {
      Linking.openURL(mapsUri);
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + address)}`;
      Linking.openURL(url);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.dinerCard}>
        <Ionicons name="map-outline" size={28} color="#690b22" style={{ marginBottom: 4 }} />
        <Text style={styles.dinerText}>Interactive Map is available on Mobile!</Text>
        <Text style={styles.addressText} numberOfLines={2}>{address || 'No address provided'}</Text>
        <Text style={styles.linkText} onPress={handleOpenMaps}>
          Open in Google Maps ↗
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    backgroundColor: '#FAF3DD',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#690b22',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dinerCard: {
    alignItems: 'center',
    gap: 4,
  },
  dinerText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#690b22',
    textAlign: 'center',
    fontSize: 14,
  },
  addressText: {
    fontFamily: 'monospace',
    color: '#813D18',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  linkText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#1A7A5E',
    textDecorationLine: 'underline',
    marginTop: 8,
    fontSize: 13,
  },
  
});
