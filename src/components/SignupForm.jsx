import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

function SignupForm() {
  const { signUp, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await signUp(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-primary">Create account</h1>
      <p className="mt-2 text-sm text-slate-600">Sign up with your email and password.</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        {localError && <p className="text-sm text-red-600">{localError}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default SignupForm;
