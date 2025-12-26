import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="grid gap-8 md:grid-cols-2 md:items-center">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Secure by default</p>
        <h1 className="text-3xl font-bold text-primary md:text-4xl">Windsurf</h1>
        <p className="text-lg text-slate-700">
          React + Supabase Auth starter with httpOnly refresh cookies, in-memory access tokens, RBAC-aware UI, and a
          resilient fetch wrapper.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/signup"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-lg"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            Log in
          </Link>
        </div>
        <ul className="mt-4 grid gap-2 text-sm text-slate-700">
          <li>• Option B storage: refresh in httpOnly cookie, access token in memory</li>
          <li>• Automatic token refresh & retry on 401</li>
          <li>• Responsive UI for mobile/desktop</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
          <p className="text-accent mb-2 font-semibold">Auth flow</p>
          <pre className="whitespace-pre-wrap">
            {`supabase.auth.signInWithPassword
→ POST /auth/session (sets httpOnly refresh cookie)
→ access token kept in memory
→ apiFetch attaches Bearer + retries on 401
→ POST /auth/refresh returns new access token`}
          </pre>
        </div>
      </div>
    </section>
  );
}

export default Home;
