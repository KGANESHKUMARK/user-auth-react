import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

export default function Profile() {
  const { user, accessToken, apiCall, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    fetchProfile();
  }, [accessToken]);

  const fetchProfile = async () => {
    try {
      const res = await apiCall(`${API_BASE}/profile`);
      const data = await res.json();
      setProfile(data);
      setFullName(data.fullName || '');
      setMobileNumber(data.mobileNumber || '');
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiCall(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, mobileNumber }),
      });
      const updated = await res.json();
      setProfile(updated);
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Profile</h2>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {editMode ? (
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: 12 }}>
            <label>Email (read-only)</label>
            <input type="email" value={profile.email} disabled style={{ width: '100%', padding: 8 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ marginRight: 8 }}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => setEditMode(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Full Name:</strong> {profile.fullName || '—'}</p>
          <p><strong>Mobile:</strong> {profile.mobileNumber || '—'}</p>
          <p><strong>Created:</strong> {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : '—'}</p>
          <button onClick={() => setEditMode(true)} style={{ marginRight: 8 }}>
            Edit
          </button>
          <button onClick={signOut} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px' }}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
