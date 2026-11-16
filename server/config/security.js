/**
 * HTTP security configuration: Content-Security-Policy and CORS.
 *
 * The CSP only allows the third parties the site really uses (checked by
 * listing the requests made by the production page):
 * - Google Fonts (CSS + font files),
 * - Google Analytics (loaded only after consent),
 * - Google Maps (embedded iframe),
 * - Elfsight (Google reviews widget).
 */
export const contentSecurityPolicy = {
  useDefaults: false,
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://www.googletagmanager.com', 'https://elfsightcdn.com', 'https://*.elfsightcdn.com', 'https://*.elfsight.com'],
    // Mantine writes inline style attributes.
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://*.elfsightcdn.com'],
    fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://*.elfsightcdn.com'],
    imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
    connectSrc: ["'self'", 'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://www.googletagmanager.com', 'https://*.elfsight.com', 'https://*.elfsightcdn.com'],
    frameSrc: ['https://www.google.com', 'https://*.elfsight.com'],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'self'"],
    upgradeInsecureRequests: [],
  },
};

/** Strict policy for user-uploaded files: they can never run a script. */
export const UPLOADS_CSP = "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox";

/**
 * Origins allowed to call the API from a browser.
 * `CORS_ORIGINS` = comma-separated list; in development, the Vite server.
 * The site and its API share the same origin in production, so the list only
 * matters for other front-ends (none today).
 * @param {NodeJS.ProcessEnv} env
 * @returns {string[]}
 */
export function allowedOrigins(env = process.env) {
  const fromEnv = (env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (fromEnv.length) return fromEnv;
  return env.NODE_ENV === 'production' ? [] : ['http://localhost:5173'];
}
