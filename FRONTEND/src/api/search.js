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

function normalizeBusyness(item) {
  const copy = { ...item };
  const rawDescription = copy.busyness_description ?? copy.busynessDescription ?? copy.busyness ?? '';
  const normalizedDescription = String(rawDescription || '').trim().toLowerCase();

  const descriptionMap = {
    low: 'Quiet',
    'below average': 'Quiet',
    average: 'Moderate',
    'above average': 'Busy',
    high: 'Busy',
  };

  const mappedDescription = descriptionMap[normalizedDescription] || rawDescription || 'Moderate';
  const percentValue = copy.busyness_percentage ?? copy.busynessPercent ?? copy.busyness_percent ?? 0;
  const numericPercent = typeof percentValue === 'number' ? percentValue : Number(percentValue) || 0;

  copy.busyness_description = rawDescription || mappedDescription;
  copy.busyness = mappedDescription;
  copy.busyness_percentage = numericPercent;
  copy.busynessPercent = numericPercent;
  copy.busyness_percent = numericPercent;
  return copy;
}

async function postSearch(endpoint, body, fallbackBuilder) {
  const url = `${getApiBaseUrl()}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Search request failed: ${response.status} ${response.statusText} ${errorBody}`);
    }

    const json = await response.json();
    return Array.isArray(json) ? json.map((item) => normalizeBusyness(item)) : [];
  } catch (error) {
    console.error('search request failed:', error, { url, body });
    if (__DEV__ && mockCafes?.length) {
      return fallbackBuilder().map((item) => normalizeBusyness(item));
    }
    throw new Error('Failed to fetch cafe results. Please check backend URL and network connection.');
  }
}

export const searchSpecifiedPlaces = async (placeType, lat, lng) => {
  const lowerType = (placeType || '').toLowerCase();
  return postSearch(
    '/cafes/searchType',
    {
      place_type: placeType,
      latitude: lat,
      longitude: lng,
    },
    () => mockCafes.filter((c) => c.name.toLowerCase().includes(lowerType))
  );
};

export const searchVibe = async (userQuery, lat, lng) => {
  const lowerQuery = (userQuery || '').toLowerCase();
  return postSearch(
    '/cafes/vibesearch',
    {
      user_query: userQuery,
      latitude: lat,
      longitude: lng,
    },
    () => mockCafes.filter((c) => c.vibeTags?.some((tag) => tag.toLowerCase().includes(lowerQuery)))
  );
};

export const searchPlaces = async (query, lat, lng, placeType = '') => {
  const lowerQuery = (query || '').toLowerCase();
  return postSearch(
    '/cafes/search',
    {
      text_query: query,
      latitude: lat,
      longitude: lng,
      place_type: placeType,
    },
    () => mockCafes.filter((c) => c.name.toLowerCase().includes(lowerQuery))
  );
};