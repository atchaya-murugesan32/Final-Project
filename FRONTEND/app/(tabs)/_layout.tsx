import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_COLORS: Record<string, string> = {
  index: '#35545ad7',
  map: '#ceb793',
  explore: '#bb603f',
  reservations: '#7A7849',
  auth: '#C08831',
};


export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FAFAFA',
        tabBarInactiveTintColor: '#CFCFCF',
        tabBarLabelStyle: {
          fontFamily: 'SpaceMono',
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: TAB_COLORS[route.name] ?? '#35545ad7',
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Cafes',
          tabBarItemStyle: { backgroundColor: TAB_COLORS.index },
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarItemStyle: { backgroundColor: TAB_COLORS.map },
          tabBarIcon: ({ color, size }) => <Ionicons name="navigate" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarItemStyle: { backgroundColor: TAB_COLORS.explore },
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reservations',
          tabBarItemStyle: { backgroundColor: TAB_COLORS.reservations },
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="auth"
        options={{
          title: 'Account',
          tabBarItemStyle: { backgroundColor: TAB_COLORS.auth },
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
