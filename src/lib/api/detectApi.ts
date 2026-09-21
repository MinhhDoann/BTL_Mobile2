import { Platform } from 'react-native';

const FALLBACK_LAN_IP = process.env.EXPO_PUBLIC_FALLBACK_IP ?? '192.168.1.19';
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

export async function detectApiBase(): Promise<string> {
  if (cachedBase) return cachedBase;

  const candidates: string[] = [];
  if (Platform.OS === 'web') {
    candidates.push('http://localhost:3000');
  } else {
    candidates.push('http://10.0.2.2:3000');
    candidates.push('http://10.0.3.2:3000');
    candidates.push(`http://${FALLBACK_LAN_IP}:3000`);
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

  cachedBase = `http://${FALLBACK_LAN_IP}:3000`;
  return cachedBase;
}

export function getCachedApiBase(): string | null {
  return cachedBase;
}
