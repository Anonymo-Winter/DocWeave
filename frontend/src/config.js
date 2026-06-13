// Single environment flag (Vite sets PROD=true in production builds, false in dev)
// drives URL resolution — no per-environment env vars needed.
const isProduction = import.meta.env.PROD;

// Backend origin: production host in a build, local dev server otherwise.
export const BACKEND_URL = isProduction ? 'https://collabdocsbackend.tarunsumanthpuli.me' : 'http://localhost:5000';

// REST base used by the RTK Query slices.
export const API_URL = `${BACKEND_URL}/api`;
