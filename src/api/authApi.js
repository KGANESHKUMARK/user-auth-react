import { supabase } from '../lib/supabaseClient';
import { API_BASE } from '../config';

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data?.session?.access_token) {
    await sendSessionToBackend(data.session.access_token, data.session.refresh_token);
  }
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (data?.session?.access_token) {
    await sendSessionToBackend(data.session.access_token, data.session.refresh_token);
  }
  return data;
}

export async function signOut() {
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch (err) {
    console.error('Backend logout failed', err);
  } finally {
    await supabase.auth.signOut();
  }
}

async function sendSessionToBackend(accessToken, refreshToken) {
  await fetch(`${API_BASE}/auth/session`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, refreshToken })
  });
}
