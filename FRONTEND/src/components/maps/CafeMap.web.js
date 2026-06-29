import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

// react-native-maps doesn't render on web, so we show a simple list of saved cafés instead.
export default function CafeMap({ cafes, onSelectCafe }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Map</Text>
      <Text style={styles.subheading}>Map view is available on the mobile app.</Text>
      <FlatList
        data={cafes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => onSelectCafe(item.id)} activeOpacity={0.8}>
            <Text style={styles.rowName}>☕ {item.name}</Text>
            <Text style={styles.rowMeta}>
              {item.rating}★ · {item.distanceLabel} away
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.subheading}>No saved cafés yet.</Text>}
        contentContainerStyle={{ paddingVertical: 8 }}
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
  heading: {
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily: 'Funky-Vintage',
    color: '#690b22',
    marginTop: 8,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#690b22',
    marginBottom: 16,
  },
  row: {
    backgroundColor: '#FAF3DD',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#690b22',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  rowName: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#690b22',
    marginBottom: 2,
  },
  rowMeta: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#813D18',
  },
});
