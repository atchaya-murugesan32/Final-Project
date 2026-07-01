export { getApiBaseUrl } from './baseUrl';
import { getApiBaseUrl } from './baseUrl';

const buildUrl = (path) => `${getApiBaseUrl()}${path}`;

export async function register({ name, email, password }) {
  const url = buildUrl('/auth/signup');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      full_name: name, 
      username: email, // Using email as username for simplicity
      email: email, 
      password: password 
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Register failed: ${res.status}`);
  }

  return await res.json();
}

export async function login({ email, password }) {
  const url = buildUrl('/auth/login');
  
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Login failed: ${res.status}`);
  }

  return await res.json();
}

export async function changePassword({ oldPassword, newPassword }) {
  const url = buildUrl('/auth/change-password');
  
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const token = await AsyncStorage.getItem('userToken');

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Change password failed: ${res.status}`);
  }

  return await res.json();
}
