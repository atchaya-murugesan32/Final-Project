import { getApiBaseUrl } from './baseUrl';

const buildUrl = (path) => `${getApiBaseUrl()}${path}`;

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function sendChatMessage(messages, userMessage, token = null) {
  const url = buildUrl('/ai/chat');
  
  if (!token) {
    token = await AsyncStorage.getItem('userToken');
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: userMessage }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Chat request failed: ${res.status}`);
  }

  return await res.json();
}

export async function getAiRecommendations({ cities, purpose, budget, wifi }) {
  const url = buildUrl('/ai/recommend');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cities, purpose, budget, wifi }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Recommend request failed: ${res.status}`);
  }

  return await res.json();
}

export async function getVibeRecommendation(vibe, cafes) {
  const names = cafes.map(c => c.name).join(', ');
  const prompt = `I am looking for a cafe with a '${vibe}' vibe. From these options: ${names}, which one or two would you recommend and why? Keep it extremely short (max 2 sentences) and friendly.`;
  return await sendChatMessage([], prompt);
}
