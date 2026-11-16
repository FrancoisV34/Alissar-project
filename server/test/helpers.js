import http from 'http';
import request from 'supertest';
import db from '../db.js';
import { migrate } from '../lib/migrate.js';
import { seedTest, TEST_ACCOUNTS } from '../seed-test.js';
import { createApp } from '../app.js';

export { db, TEST_ACCOUNTS };

/** Schema + deterministic dataset. Call in beforeEach for isolated tests. */
export function resetDb() {
  migrate(db, { log: () => {} });
  seedTest(db);
}

/**
 * Express app as in production, served on 127.0.0.1 on a random port.
 *
 * Why not `request(app)`: supertest would then open a new server for every
 * request, listening on IPv6 (::) but called on 127.0.0.1. When another local
 * program happened to listen on the same port in IPv4, it answered instead of
 * the app (sporadic 404/501 found by the fuzz tests). Binding explicitly to
 * 127.0.0.1 removes the ambiguity.
 * @returns {Promise<import('http').Server>}
 */
export function makeApp(options) {
  const app = createApp({ serveFrontend: false, loginMaxAttempts: 1000, ...options });
  return new Promise((resolve) => {
    const server = http.createServer(app).listen(0, '127.0.0.1', () => resolve(server.unref()));
  });
}

/** Logs in with a test account and returns its JWT. */
export async function tokenFor(app, account = 'admin') {
  const { email, password } = TEST_ACCOUNTS[account];
  const res = await request(app).post('/api/auth/login').send({ email, password });
  if (res.status !== 200) throw new Error(`login ${account} → ${res.status}`);
  return res.body.token;
}

/** Smallest valid PNG (1×1 pixel). */
export const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
