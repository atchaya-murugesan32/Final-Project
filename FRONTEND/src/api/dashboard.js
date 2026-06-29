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

export async function getDashboardStats() {
  const res = await fetch(buildUrl('/dashboard/stats'), { headers: await getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function getUserProfile() {
  const res = await fetch(buildUrl('/dashboard/profile'), { headers: await getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

export async function updateUserProfile(data) {
  const res = await fetch(buildUrl('/dashboard/profile'), {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function getFavorites() {
  const res = await fetch(buildUrl('/dashboard/favorites'), { headers: await getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return res.json();
}

export async function addFavorite(data) {
  const res = await fetch(buildUrl('/dashboard/favorites'), {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to add favorite");
  return res.json();
}

export async function removeFavorite(cafeId) {
  const res = await fetch(buildUrl(`/dashboard/favorites/${cafeId}`), {
    method: 'DELETE',
    headers: await getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to remove favorite");
  return res.json();
}

export async function getPreferences() {
  const res = await fetch(buildUrl('/dashboard/preferences'), { headers: await getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch preferences");
  return res.json();
}

export async function updatePreferences(data) {
  const res = await fetch(buildUrl('/dashboard/preferences'), {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update preferences");
  return res.json();
}

export async function getNotifications() {
  const res = await fetch(buildUrl('/dashboard/notifications'), { headers: await getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function updateNotifications(data) {
  const res = await fetch(buildUrl('/dashboard/notifications'), {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update notifications");
  return res.json();
}

export async function getActivityHistory() {
  const res = await fetch(buildUrl('/dashboard/activity'), { headers: await getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch activity history");
  return res.json();
}

export async function getAiHistory() {
  const res = await fetch(buildUrl('/dashboard/ai_history'), { headers: await getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch AI history");
  return res.json();
}
