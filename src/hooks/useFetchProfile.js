import { useCallback, useState } from 'react';
import { apiFetch } from '../api/apiClient';
import { useAuth } from '../auth/useAuth';

export default function useFetchProfile() {
  const { setAccessToken, setProfile, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/profile');
      if (res.status === 401) {
        setAccessToken(null);
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setAccessToken, setProfile]);

  return { refetch, isLoading, error, profile };
}
