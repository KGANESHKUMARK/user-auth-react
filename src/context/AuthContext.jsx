import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { API_BASE } from '../config';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://vjzdwhnovonbrxhrvlgv.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from Supabase
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setUser(session.user);
      }
      setLoading(false);
    };
    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setUser(session.user);
      } else {
        setAccessToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with Supabase
  const signUp = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // Supabase requires email confirmation by default; you can handle confirmation flow here
    return data;
  };

  // Sign in with Supabase
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setAccessToken(data.session.access_token);
    setUser(data.session.user); // Use Supabase user directly
    return data;
  };

  // Sign in via backend (sets httpOnly refresh cookie)
  const signInViaBackend = async ({ email, password }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Login failed');
    }
    const { accessToken: token } = await res.json();
    setAccessToken(token);
    // Optionally fetch user profile from backend to set user object
    const profileRes = await fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (profileRes.ok) {
      const profile = await profileRes.json();
      setUser({ id: profile.id, email: profile.email });
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    // Try to clear backend httpOnly refresh cookie, but ignore if backend is down
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      // Backend not running, ignore silently
    }
    setAccessToken(null);
    setUser(null);
  };

  // Refresh token via backend
  const refreshAccessToken = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Token refresh failed');
      }
      const { accessToken: token } = await res.json();
      setAccessToken(token);
      return token;
    } catch (e) {
      // If rate-limited, wait a bit before throwing
      if (e.message.includes('rate limit') || e.message.includes('429')) {
        await new Promise(r => setTimeout(r, 2000));
      }
      throw e;
    }
  };

  // API helper that adds Authorization header and handles refresh
  const apiCall = async (url, options = {}) => {
    const makeRequest = async (token) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
    };

    let res = await makeRequest(accessToken);
    if (res.status === 401) {
      // Token expired, try refresh
      try {
        const newToken = await refreshAccessToken();
        res = await makeRequest(newToken);
      } catch (refreshErr) {
        // If refresh fails (e.g., rate limit), clear auth state
        setAccessToken(null);
        setUser(null);
        throw refreshErr;
      }
    }
    if (!res.ok) throw new Error(res.statusText);
    return res;
  };

  const value = {
    user,
    accessToken,
    loading,
    signUp,
    signIn,
    signInViaBackend,
    signOut,
    refreshAccessToken,
    apiCall,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
