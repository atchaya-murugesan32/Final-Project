import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const BUSYNESS_STYLES = {
  Quiet:    { bg: '#E3F4ED', dot: '#1A7A5E', text: '#1A7A5E', label: 'Quiet' },
  Moderate: { bg: '#FDF1DC', dot: '#B5760A', text: '#B5760A', label: 'Moderate' },
  Busy:     { bg: '#FBE6E4', dot: '#C0392B', text: '#C0392B', label: 'Busy' },
};

function BusynessBadgeWeb({ busyness, percent }) {
  const busy = BUSYNESS_STYLES[busyness] || null;
  const label = busy ? busy.label : busyness;
  const bg = busy ? busy.bg : '#F0F0F0';
  const dot = busy ? busy.dot : '#999';
  if (!label && percent == null) return null;

  return (
    <View style={[styles.busynessBadge, { backgroundColor: bg }]}> 
      <View style={[styles.busynessDot, { backgroundColor: dot }]} />
      <Text style={[styles.busynessText, { color: busy ? busy.text : '#333' }]}>{label ?? ''}{percent != null ? ` â€¢ ${percent}%` : ''}</Text>
    </View>
  );
}

// react-native-maps doesn't render on web, so we show a simple list of saved cafÃ©s instead.
export default function CafeMap({ cafes, onSelectCafe }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Map</Text>
      <Text style={styles.subheading}>Map view is available on the mobile app.</Text>
      <FlatList
        data={cafes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const percent = item.busynessPercent ?? item.busyness_percent;
          let color = '#690b22';
          if (typeof percent === 'number') {
            if (percent < 35) color = '#00A86B';
            else if (percent < 70) color = '#FFB347';
            else color = '#FF4757';
          } else if (item.busyness) {
            const label = String(item.busyness).toLowerCase();
            if (label.includes('quiet') || label.includes('low')) color = '#00A86B';
            else if (label.includes('moderate') || label.includes('medium')) color = '#FFB347';
            else if (label.includes('busy') || label.includes('high')) color = '#FF4757';
          }

          const busyLabel = item.busyness ?? (typeof percent === 'number' ? `${percent}%` : null);

          return (
            <TouchableOpacity style={styles.row} onPress={() => onSelectCafe(item.id)} activeOpacity={0.8}>
              <BusynessBadgeWeb busyness={item.busyness} percent={percent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>â˜• {item.name}</Text>
                <Text style={styles.rowMeta}>
                  {item.rating}â˜… Â· {item.distanceLabel} away
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.subheading}>No saved cafÃ©s yet.</Text>}
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
    fontFamily: 'SpaceMono',
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
  busyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    alignSelf: 'center',
  },
  busynessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
    marginRight: 10,
    alignSelf: 'center',
  },
  busynessText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rowName: {
    fontSize: 16,
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    color: '#690b22',
    marginBottom: 2,
  },
  rowMeta: {
    fontSize: 13,
    fontFamily: 'SpaceMono',
    color: '#813D18',
  },
});

