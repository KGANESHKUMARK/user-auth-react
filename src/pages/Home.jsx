import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="grid gap-8 md:grid-cols-2 md:items-center">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Enterprise-grade User Auth</p>
        <h1 className="text-3xl font-bold text-primary md:text-4xl">User Auth Platform</h1>
        <p className="text-lg text-slate-700">
          Complete authentication and authorization system with RBAC, project management, permissions, and audit logging.
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
          <li>• Secure authentication with Supabase & backend options</li>
          <li>• Role-based access control (RBAC)</li>
          <li>• Project and permissions management</li>
          <li>• Comprehensive audit logging</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
          <p className="text-accent mb-2 font-semibold">Features</p>
          <pre className="whitespace-pre-wrap">
            {`Authentication:
• Login/Signup (Supabase & Backend)
• JWT tokens with httpOnly cookies
• Automatic token refresh

Authorization:
• Role-based access control
• Project-level permissions
• User role assignment

Management:
• User profiles
• Project management
• Permission assignments
• Audit logs & tracking`}
          </pre>
        </div>
      </div>
    </section>
  );
}

export default Home;
