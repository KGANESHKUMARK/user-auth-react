import { API_BASE } from '../config';
import { useAuth } from '../context/AuthContext';

/**
 * apiFetch wraps fetch to attach Authorization header with in-memory access token
 * and retries once on 401 after hitting /auth/refresh which uses httpOnly cookie.
 */
export async function apiFetch(path, options = {}) {
  // This is a utility; for component usage prefer useAuth().apiCall
  const token = localStorage.getItem('accessToken'); // fallback if called outside React
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (response.status === 401) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      headers.Authorization = `Bearer ${refreshed}`;
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include'
      });
    } else {
      localStorage.removeItem('accessToken');
      throw new Error('Unauthorized');
    }
  }

  return response;
}

async function attemptRefresh() {
  try {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!refreshRes.ok) return null;
    const { accessToken } = await refreshRes.json();
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    }
    return null;
  } catch (err) {
    console.error('Refresh failed', err);
    return null;
  }
}
