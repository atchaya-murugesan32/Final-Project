import { mockCafes } from '../../src/data/mockCafes';

function stripBusyness(item) {
  const copy = { ...item };
  delete copy.busyness;
  delete copy.busynessPercent;
  delete copy.busyness_percent;
  return copy;
}

export const searchSpecifiedPlaces = async (placeType, lat, lng) => {
  try {
    const response = await fetch('http://192.168.1.31:8000/cafes/searchType', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        place_type: placeType,
        latitude: lat,
        longitude: lng,
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch results');

    const json = await response.json();
    return json.map((item) => stripBusyness(item));
  } catch (err) {
    console.warn('searchSpecifiedPlaces: backend unavailable, falling back to mockCafes', err);
    const filterTerm = (placeType || '').toLowerCase();
    return mockCafes
      .filter((c) => c.name.toLowerCase().includes(filterTerm))
      .map((c) => stripBusyness(c));
  }
};
export const searchVibe = async (userQuery, lat, lng) => {
  try {
    const response = await fetch('http://192.168.1.31:8000/cafes/vibesearch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_query: userQuery,
        latitude: lat,
        longitude: lng,
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch results');

    const json = await response.json();
    return json.map((item) => stripBusyness(item));
  } catch (err) {
    console.warn('searchVibe: backend unavailable, falling back to mockCafes', err);
    const lowerQuery = (userQuery || '').toLowerCase();
    return mockCafes
      .filter((c) => c.vibeTags?.some((tag) => tag.toLowerCase().includes(lowerQuery)))
      .map((c) => stripBusyness(c));
  }
};

export const searchPlaces = async (query, lat, lng, placeType = '') => {
  try {
    const response = await fetch('http://192.168.1.31:8000/cafes/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text_query: query,
        latitude: lat,
        longitude: lng,
        place_type: placeType,
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch results');

    const json = await response.json();
    // Do NOT attach busyness server-side — return raw items but strip any busyness fields
    return json.map((item) => stripBusyness(item));
  } catch (err) {
    // Backend not available — fall back to mocks but strip busyness so UI treats them as "real" results
    console.warn('searchPlaces: backend unavailable, falling back to mockCafes', err);
    return mockCafes
      .filter((c) => c.name.toLowerCase().includes((query || '').toLowerCase()))
      .map((c) => stripBusyness(c));
  }
};