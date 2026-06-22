import { View, Text, StyleSheet, ScrollView} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { mockCafes } from '../../src/data/mockCafes';
import CollageLayout from 'react-native-collage-layout'
import Polaroid from '../../src/components/Polaroid';


export default function CafeDetailScreen() {
  const { id } = useLocalSearchParams();
  const cafe = mockCafes.find((c) => c.id === id);

  //show all details in larger screen
  //map at bottom showing just the cafe location, with option to open in maps app ie google maps
  //more granular busyness info
  //ai 'vibes' rating based on user profile


  return (
    <View style={styles.container}>
      

      <Text style={styles.heading}>{cafe?.name}</Text>

      <ScrollView >
        {cafe?.images?.map((img, index) => (
          <Polaroid
            key={index}
            image={img.uri}
            caption={`${cafe.name} Image ${index + 1}`}
            rotation={index % 2 === 0 ? -2 : 2}
          />
        ))}
      </ScrollView>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#90553c',
    padding: 16,
  },

  heading: {
    fontSize: 50,
    fontWeight: 'bold',
    fontFamily: 'Funky-Vintage',
    color: '#ceb793',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },

   subheading: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#ceb793',
    marginBottom: 20,
  },
  })