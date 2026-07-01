import { getApiBaseUrl } from './baseUrl';

function normalizeBusyness(item) {
  const copy = { ...item };
  const rawDescription = copy.busyness_description;
  const normalizedDescription = String(rawDescription || '').trim().toLowerCase();

  const descriptionMap = {
    low: 'Quiet',
    'below average': 'Quiet',
    average: 'Moderate',
    'above average': 'Busy',
    high: 'Busy',
  };

  const percentValue = copy.busyness_percent;
  const numericPercent = typeof percentValue === 'number' ? percentValue : Number(percentValue);

  const hasDescription = typeof rawDescription === 'string' && rawDescription.trim().length > 0;
  const hasPercent = Number.isFinite(numericPercent);

  if (!hasDescription || !hasPercent) {
    copy.busyness_description = 'N/A';
    copy.busyness = 'N/A';
    copy.busyness_percentage = null;
    copy.busynessPercent = null;
    copy.busyness_percent = null;
    return copy;
  }

  const mappedDescription = descriptionMap[normalizedDescription] || rawDescription;

  copy.busyness_description = rawDescription || mappedDescription;
  copy.busyness = mappedDescription;
  copy.busyness_percentage = numericPercent;
  copy.busynessPercent = numericPercent;
  copy.busyness_percent = numericPercent;
  return copy;
}

async function postSearch(endpoint, body) {
  const url = `${getApiBaseUrl()}${endpoint}`; //builds full url using base url and endpoint

  try { //POST request with JSON body
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text(); //error text from response body
      throw new Error(`Search request failed: ${response.status} ${response.statusText} ${errorBody}`);
    }

    const json = await response.json(); //parses json
    return Array.isArray(json) ? json.map((item) => normalizeBusyness(item)) : [];
  } catch (error) {
    console.error('search request failed:', error, { url, body });
    throw new Error('Search failed. Unable to reach the backend right now. Please try again.');
  }
}

export const searchSpecifiedPlaces = async (placeType, lat, lng) => {
  return postSearch(
    '/cafes/searchType',
    {
      place_type: placeType,
      latitude: lat,
      longitude: lng,
    }
  );
};

export const searchVibe = async (userQuery, lat, lng) => {
  return postSearch(
    '/cafes/vibesearch',
    {
      user_query: userQuery,
      latitude: lat,
      longitude: lng,
    }
  );
};

export const searchPlaces = async (query, lat, lng) => {
  return postSearch(
    '/cafes/search',
    {
      text_query: query,
      latitude: lat,
      longitude: lng,
    }
  );
};