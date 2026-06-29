import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { mockCafes } from '../../src/data/mockCafes';

const getApiBaseUrl = () => {
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:8000';
  }

  return 'http://127.0.0.1:8000';
};

export const searchPlaces = async (query, lat, lng) => {
  const url = `${getApiBaseUrl()}/cafes/search`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text_query: query,
        latitude: lat,
        longitude: lng,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Search request failed: ${response.status} ${response.statusText} ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    console.error('searchPlaces failed:', error, { url, query, lat, lng });

    if (__DEV__ && mockCafes?.length) {
      console.warn('Falling back to mock cafes data in development mode.');
      return mockCafes;
    }

    throw new Error('Failed to fetch café results. Please check your backend URL and network connection.');
  }
};