import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { accessToken, signOut, profile, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-primary">
          User Auth
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'text-accent' : '')}>
            Home
          </NavLink>
          {(accessToken || user) && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'text-accent' : '')}>
                Dashboard
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'text-accent' : '')}>
                Profile
              </NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {accessToken ? (
            <>
              <span className="text-sm text-slate-600">{profile?.email || 'Signed in'}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white shadow hover:shadow-md">
                  Sign up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
