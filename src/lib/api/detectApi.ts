import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getHostFromConstants = (): string | null => {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ??
    (Constants as any).manifest?.debuggerHost;
  if (!hostUri) return null;
  return hostUri.split(':')[0];
};

const devHostIp = getHostFromConstants();
const FALLBACK_LAN_IP = process.env.EXPO_PUBLIC_FALLBACK_IP ?? devHostIp ?? '192.168.1.6';
const probeTimeout = 2500;

function fetchWithTimeout(url: string, timeout = probeTimeout) {
  return new Promise<Response>((resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      reject(new Error('timeout'));
    }, timeout);

    fetch(url)
      .then((res) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        reject(err);
      });
  });
}

let cachedBase: string | null = null;

export async function detectApiBase(forceRefresh = false): Promise<string> {
  if (cachedBase && !forceRefresh) return cachedBase;

  const candidates: string[] = [];
  if (Platform.OS === 'web') {
    candidates.push('http://localhost:3000');
    if (typeof window !== 'undefined' && window?.location?.hostname) {
      const host = window.location.hostname;
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        candidates.push(`http://${host}:3000`);
      }
    }
  } else {
    if (devHostIp) {
      candidates.push(`http://${devHostIp}:3000`);
    }
    if (FALLBACK_LAN_IP && FALLBACK_LAN_IP !== devHostIp) {
      candidates.push(`http://${FALLBACK_LAN_IP}:3000`);
    }
    candidates.push('http://10.0.2.2:3000');
    candidates.push('http://10.0.3.2:3000');
    candidates.push('http://localhost:3000');
  }

  for (const c of candidates) {
    try {
      console.log('[detectApi] probing', c);
      const res = await fetchWithTimeout(`${c}/api/home-data`, probeTimeout);
      console.log('[detectApi] probe status', c, res.status);
      if (res.ok) {
        cachedBase = c;
        return c;
      }
    } catch (e: any) {
      console.log('[detectApi] probe fail', c, e?.message ?? e);
    }
  }

  const fallback = Platform.OS === 'web' ? 'http://localhost:3000' : `http://${FALLBACK_LAN_IP}:3000`;
  return fallback;
}

export function resetApiBaseCache() {
  cachedBase = null;
}

export function getCachedApiBase(): string | null {
  return cachedBase;
}

