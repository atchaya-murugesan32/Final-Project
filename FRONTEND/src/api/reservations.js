import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from './auth';

const buildUrl = (path) => `${getApiBaseUrl()}${path}`;

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) throw new Error("No authentication token found");
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function createReservation(data) {
  const url = buildUrl('/reservations/create');
  const headers = await getAuthHeaders();
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create reservation");
  }
  
  return res.json();
}

export async function getMyReservations() {
  const url = buildUrl('/reservations/my-bookings');
  const headers = await getAuthHeaders();
  
  const res = await fetch(url, {
    method: 'GET',
    headers
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch reservations");
  }
  
  return res.json();
}

export async function cancelReservation(reservationId) {
  const url = buildUrl(`/reservations/${reservationId}/cancel`);
  const headers = await getAuthHeaders();
  
  const res = await fetch(url, {
    method: 'PUT',
    headers
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to cancel reservation");
  }
  
  return res.json();
}
