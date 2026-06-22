import { mockCafes } from '../../src/data/mockCafes';


export const searchPlaces = async (query, lat, lng) => {
  
  const response = await fetch('http://192.168.1.31:8000/cafes/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text_query: query, latitude: lat, longitude: lng }),
});

  if (!response.ok) {
    throw new Error("Failed to fetch results");
  }

  
  return await response.json();


};