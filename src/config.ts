// Temporary test-group mode: when on, the app generates plans through the
// proxy Worker (see /cloudflare-worker) instead of asking each user for
// their own API key, and hides the provider/API-key settings entirely.
// Neither value is sensitive — TEST_MODE is just a flag, and AI_PROXY_URL is
// a public endpoint meant to be called from the browser — so they're set as
// plain GitHub Actions *variables*, not secrets. See .env.example.
export const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';
export const AI_PROXY_URL = import.meta.env.VITE_AI_PROXY_URL || '';
