import { Platform } from 'react-native';
import Constants from 'expo-constants';

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost']);

function extractExpoHost() {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.manifest2?.extra?.expoClient?.hostUri,
    Constants.manifest?.debuggerHost,
    Constants.linkingUri,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'string') {
      continue;
    }

    const withoutScheme = candidate.includes('://') ? candidate.split('://')[1] : candidate;
    const hostWithPort = withoutScheme.split('/')[0];
    const host = hostWithPort.split(':')[0];

    if (host) {
      return host;
    }
  }

  return null;
}

function replaceLoopbackHost(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (Platform.OS === 'web' || !LOOPBACK_HOSTS.has(parsed.hostname)) {
      return rawUrl;
    }

    const expoHost = extractExpoHost();
    if (!expoHost) {
      return rawUrl;
    }

    parsed.hostname = expoHost;
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return rawUrl;
  }
}

export function getApiBaseUrl() {
  const configuredUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configuredUrl) {
    return replaceLoopbackHost(configuredUrl);
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }

  const expoHost = extractExpoHost();
  if (expoHost) {
    return `http://${expoHost}:8000`;
  }

  return 'http://localhost:8000';
}