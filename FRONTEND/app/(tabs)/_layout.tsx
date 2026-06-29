import { Tabs } from 'expo-router';


export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'My Cafes' }} />
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="reservations" options={{ title: 'Reservations' }} />
      <Tabs.Screen name="auth" options={{ title: 'Account' }} />
    </Tabs>
  );
}