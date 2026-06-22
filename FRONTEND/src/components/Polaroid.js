import { View, Text, Image, StyleSheet } from 'react-native';

export default function Polaroid({ image, caption, rotation = 0 }) {
  return (
    <View
      style={[
        styles.polaroid,
        { transform: [{ rotate: `${rotation}deg` }] },
      ]}
    >
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  polaroid: {
    alignSelf: 'flex-start',
    width: 180,
    backgroundColor: '#FFF',
    padding: 8,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  caption: {
    fontSize: 12,
    color: '#333',
  },
});