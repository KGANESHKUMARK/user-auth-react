# windsurf-frontend

Secure React + Supabase Auth starter implementing httpOnly refresh cookie (backend) with in-memory access token (frontend). Works with Spring Cloud Gateway + Swagger testing and is mobile-friendly.

## Tech stack
- React 18 + Vite + Tailwind
- @supabase/supabase-js
- React Router v6
- Jest + React Testing Library
- Service worker + PWA manifest

## Environment
Create `.env.local` (not committed):
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
VITE_API_BASE=http://localhost:8080
```

## Install & run
```
npm install
npm run dev
```
Build: `npm run build` • Preview: `npm run preview` • Tests: `npm test`

## Auth flows (Option B storage)
1) signUp/signIn via Supabase → access/refresh returned
2) frontend POST `/auth/session` with access/refresh → backend sets httpOnly, Secure, SameSite=Strict refresh cookie and may return access token
3) access token kept in memory only; all API calls send `Authorization: Bearer <access_token>` with `credentials: 'include'`
4) On 401, `apiFetch` calls `/auth/refresh` (cookie sent automatically) to get new access token then retries once; if still unauthorized, user is signed out
5) Logout POST `/auth/logout` clears cookie; client drops token

## File map (key)
- `src/lib/supabaseClient.js` – Supabase client init with env vars
- `src/auth/AuthProvider.jsx` – in-memory access token, silent refresh, profile load
- `src/api/apiClient.js` – fetch wrapper with refresh/retry
- `src/api/authApi.js` – Supabase signIn/signUp + POST /auth/session
- `src/components/*` – UI: Navbar, LoginForm, SignupForm, ProtectedRoute
- `src/pages/*` – Home, Dashboard (protected example), Profile
- `src/hooks/useFetchProfile.js` – helper to fetch profile using apiFetch
- `public/manifest.json`, `public/service-worker.js` – PWA assets

## RBAC surface
`Profile` renders `role` from backend profile. Extend UI conditionally on `profile.role` (e.g., show admin-only actions).

## Testing
- Unit: `npm test` (Jest + RTL). See `src/api/apiClient.test.js` and `src/auth/AuthProvider.test.jsx`.
- E2E (suggested): Cypress for web auth/refresh flows; Expo + Detox for mobile.

## Swagger testing
1. In the app, sign in and copy the access token from network responses (or Supabase session).
2. Paste `Bearer <access_token>` into Swagger Authorize to call protected endpoints.

## Mobile (Expo) notes
- Supabase-js works with Expo (fetch available).
- Preferred: backend issues refresh-cookie for web; on mobile, store refresh token in SecureStore/Keychain and call the same `/auth/refresh` endpoint.
- Consider React Native Web to reuse components; share api/auth logic.

## Security checklist
- HTTPS only in production
- Refresh token only via httpOnly Secure SameSite cookie (or secure storage on mobile)
- Access token in memory only
- Rotate refresh tokens; validate JWTs server-side (Supabase JWKS) in gateway/services
- Use CSRF protections for cookie flows (SameSite=Strict + double-submit if needed)
