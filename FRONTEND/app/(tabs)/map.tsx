import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location'; //expo API for accessing device location, and reading coordinates
import { useCafes } from '../../src/context/CafesContext';
import { distanceInMiles } from '../../src/utils/distance';
import CafeMap from '../../src/components/maps/CafeMap';
import { useFocusEffect } from 'expo-router';

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

  // Refresh location every time user enters the map tab.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      let subscription: Location.LocationSubscription | null = null;

      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (active) {
            setPermissionDenied(true);
            setUserLocation(null);
          }
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (active) {
          setPermissionDenied(false);
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 15,
          },
          (position) => {
            if (!active) {
              return;
            }

            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        );
      })();

      return () => {
        active = false;
        subscription?.remove();
      };
    }, [])
  );

  // Compute live distance on frontend using current device location.
  const cafesWithDistance = useMemo(() => {
    return cafes.map((cafe: any) => {
      let distanceLabel = cafe.distanceLabel ?? cafe.distance ?? 'Distance unavailable';

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
