import { useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import useFetchProfile from '../hooks/useFetchProfile';

function Profile() {
  const { profile, loading } = useAuth();
  const { refetch, error, isLoading } = useFetchProfile();

  useEffect(() => {
    if (!profile) refetch();
  }, [profile, refetch]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-primary">Profile</h1>
      {(loading || isLoading) && <p className="text-sm text-slate-600">Loading profile…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {profile && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Email:</span> {profile.email}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Role:</span> {profile.role || 'user'}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-semibold">ID:</span> {profile.id}
          </p>
        </div>
      )}
    </section>
  );
}

export default Profile;
