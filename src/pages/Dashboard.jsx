import { useEffect, useState } from 'react';
import { apiFetch } from '../api/apiClient';

function Dashboard() {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard data');
        const data = await res.json();
        setMessage(data?.message || 'Welcome to your dashboard');
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold text-primary">Dashboard</h1>
      {message && <p className="rounded-lg bg-slate-900 px-4 py-3 text-sm text-slate-100">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-sm text-slate-600">
        This route is protected. API calls include the in-memory access token and use the refresh cookie automatically.
      </p>
    </section>
  );
}

export default Dashboard;
