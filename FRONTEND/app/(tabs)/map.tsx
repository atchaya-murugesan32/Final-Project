import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useCafes } from '../../src/context/CafesContext';
import { distanceInMiles } from '../../src/utils/distance';
import CafeMap from '../../src/components/maps/CafeMap';

// Fallback region (downtown San Francisco) used until we have the user's location.
const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const router = useRouter();
  const { cafes } = useCafes();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Ask for live location once on mount
  useEffect(() => {
    let active = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (active) setPermissionDenied(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (active) {
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Attach a live distance to each saved cafe (falls back to the mock distance string)
  const cafesWithDistance = useMemo(() => {
    return cafes.map((cafe: any) => {
      let distanceLabel = cafe.distance;
      if (userLocation && cafe.latitude != null && cafe.longitude != null) {
        const miles = distanceInMiles(
          userLocation.latitude,
          userLocation.longitude,
          cafe.latitude,
          cafe.longitude
        );
        distanceLabel = `${miles.toFixed(1)} mi`;
      }
      return { ...cafe, distanceLabel };
    });
  }, [cafes, userLocation]);

  const region = userLocation
    ? { ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : DEFAULT_REGION;

  function goToCafe(id: string) {
    router.push({ pathname: '/cafe/[id]', params: { id } });
  }

  return (
    <CafeMap
      cafes={cafesWithDistance}
      region={region}
      permissionDenied={permissionDenied}
      onSelectCafe={goToCafe}
    />
  );
}
