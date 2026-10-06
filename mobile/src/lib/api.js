// import { Platform } from 'react-native';
// import Constants from 'expo-constants';

// function resolveApiBase() {
//   const extra = Constants.expoConfig?.extra?.apiUrl;
//   if (extra) return extra.replace(/\/$/, '');

//   const hostUri = Constants.expoConfig?.hostUri;
//   if (hostUri && Platform.OS !== 'web') {
//     const host = hostUri.split(':')[0];
//     return `http://${host}:5000/api`;
//   }

//   if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';
//   return 'http://localhost:5000/api';
// }

// export const API_BASE = resolveApiBase();

// export async function apiRequest(path, { method = 'GET', token, body } = {}) {
//   const headers = { 'Content-Type': 'application/json' };
//   if (token) headers.Authorization = `Bearer ${token}`;

//   try {
//     const res = await fetch(`${API_BASE}${path}`, {
//       method,
//       headers,
//       body: body ? JSON.stringify(body) : undefined,
//     });

//     const data = await res.json().catch(() => ({}));

//     if (!res.ok) {
//       if (res.status === 401) {
//         throw new Error('የመለያ ጊዜዎ አልቋል፤ እባክዎ እንደገና ይግቡ');
//       }
//       if (res.status === 404) {
//         throw new Error('የተጠየቀው አገልግሎት ለጊዜው አልተገኘም');
//       }
//       if (res.status >= 500) {
//         throw new Error('የማዕከል ሰርቨር መቆራረጥ አጋጥሟል፤ እባክዎ ጥቂት ቆይተው ይሞክሩ');
//       }

//       const backendMsg =
//         data.error ||
//         data.message ||
//         (Array.isArray(data.errors) ? data.errors.map((e) => e.message || e).join(', ') : null);

//       throw new Error(backendMsg || 'ትእዛዝ ማስተላለፍ አልተቻለም፤ እባክዎ ደግመው ይሞክሩ');
//     }

//     return data;
//   } catch (err) {
//     if (err.message.includes('Network request failed') || err.message.includes('Failed to fetch')) {
//       throw new Error('የኢንተርኔት ግንኙነት የለም ወይም ማዕከሉ አልደረሰም');
//     }
//     throw err;
//   }
// }
import { Platform } from 'react-native';
import Constants from 'expo-constants';

function resolveApiBase() {
  // 1. Check for environment variable (Expo SDK 49+)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // 2. Check for app.json extra config
  const extra = Constants.expoConfig?.extra?.apiUrl;
  if (extra) {
    return extra.replace(/\/$/, '');
  }

  // 3. Fallback to production Render backend (works everywhere: APK, Expo Go, Web)
  return 'https://qinash-gebeya-backend.onrender.com/api';
}

export const API_BASE = resolveApiBase();

export async function apiRequest(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('የመለያ ጊዜዎ አልቋል፤ እባክዎ እንደገና ይግቡ');
      }
      if (res.status === 404) {
        throw new Error('የተጠየቀው አገልግሎት ለጊዜው አልተገኘም');
      }
      if (res.status >= 500) {
        throw new Error('የማዕከል ሰርቨር መቆራረጥ አጋጥሟል፤ እባክዎ ጥቂት ቆይተው ይሞክሩ');
      }

      const backendMsg =
        data.error ||
        data.message ||
        (Array.isArray(data.errors) ? data.errors.map((e) => e.message || e).join(', ') : null);

      throw new Error(backendMsg || 'ትእዛዝ ማስተላለፍ አልተቻለም፤ እባክዎ ደግመው ይሞክሩ');
    }

    return data;
  } catch (err) {
    if (err.message.includes('Network request failed') || err.message.includes('Failed to fetch')) {
      throw new Error('የኢንተርኔት ግንኙነት የለም ወይም ማዕከሉ አልደረሰም');
    }
    throw err;
  }
}