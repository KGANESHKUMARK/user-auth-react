import { API_BASE } from '../config';
import { getAuthContext } from '../auth/authContextAccessor';

/**
 * apiFetch wraps fetch to attach Authorization header with in-memory access token
 * and retries once on 401 after hitting /auth/refresh which uses httpOnly cookie.
 */
export async function apiFetch(path, options = {}) {
  const auth = getAuthContext();
  const token = auth?.getAccessToken();

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
    const refreshed = await attemptRefresh(auth);
    if (refreshed) {
      headers.Authorization = `Bearer ${refreshed}`;
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include'
      });
    } else {
      auth?.signOut();
      throw new Error('Unauthorized');
    }
  }

  return response;
}

async function attemptRefresh(auth) {
  try {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!refreshRes.ok) return null;
    const { accessToken } = await refreshRes.json();
    if (accessToken) {
      auth?.setAccessToken(accessToken);
      return accessToken;
    }
    return null;
  } catch (err) {
    console.error('Refresh failed', err);
    return null;
  }
}
