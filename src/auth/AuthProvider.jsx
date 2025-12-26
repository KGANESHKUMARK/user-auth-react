import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { signIn, signUp, signOut as backendSignOut } from '../api/authApi';
import { setAuthContextInstance } from './authContextAccessor';
import { API_BASE } from '../config';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  }, [accessToken]);

  const silentRefresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const { accessToken: newToken } = await res.json();
        if (newToken) {
          setAccessToken(newToken);
          return newToken;
        }
      }
      return null;
    } catch (err) {
      console.error('Silent refresh failed', err);
      return null;
    }
  }, []);

  useEffect(() => {
    setAuthContextInstance({
      getAccessToken: () => accessToken,
      setAccessToken,
      signOut: async () => {
        await backendSignOut();
        setAccessToken(null);
        setProfile(null);
      }
    });
  }, [accessToken]);

  useEffect(() => {
    (async () => {
      const refreshed = await silentRefresh();
      if (refreshed) {
        loadProfile();
      }
    })();
  }, [silentRefresh, loadProfile]);

  const handleSignUp = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const session = await signUp(email, password);
        if (session?.session?.access_token) {
          setAccessToken(session.session.access_token);
          await loadProfile();
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadProfile]
  );

  const handleSignIn = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const session = await signIn(email, password);
        if (session?.session?.access_token) {
          setAccessToken(session.session.access_token);
          await loadProfile();
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadProfile]
  );

  const handleSignOut = useCallback(async () => {
    await backendSignOut();
    setAccessToken(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      profile,
      loading,
      error,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signOut: handleSignOut,
      setAccessToken,
      setProfile
    }),
    [accessToken, profile, loading, error, handleSignIn, handleSignUp, handleSignOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
