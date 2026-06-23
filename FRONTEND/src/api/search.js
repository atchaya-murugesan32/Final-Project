import { mockCafes } from '../../src/data/mockCafes';

function stripBusyness(item) {
  const copy = { ...item };
  delete copy.busyness;
  delete copy.busynessPercent;
  delete copy.busyness_percent;
  return copy;
}

export const searchPlaces = async (query, lat, lng) => {
  try {
    const response = await fetch('http://192.168.1.31:8000/cafes/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text_query: query, latitude: lat, longitude: lng }),
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