import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AddCafeButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.addBar}
      onPress={() => router.push('/recommend')}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={22} color="#FFFFFF" />
      <Text style={styles.addBarText}>Tap to add</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addBar: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1A7A5E',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addBarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
