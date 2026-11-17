import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'serveur',
          environment: 'node',
          include: ['server/**/*.test.js'],
          setupFiles: ['server/test/setup.js'],
          // Une base SQLite par fichier de test : les fichiers peuvent tourner en parallèle.
          pool: 'forks',
        },
      },
      {
        extends: true,
        test: {
          name: 'front',
          environment: 'jsdom',
          include: ['src/**/*.test.{js,jsx}'],
          setupFiles: ['src/test/setup.js'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      include: ['server/**/*.js', 'src/**/*.{js,jsx}'],
      exclude: ['**/__tests__/**', '**/*.test.*', 'server/test/**', 'src/test/**', 'server/seed.js', 'server/scripts/**', 'src/main.jsx'],
      thresholds: {
        // Seuil bloquant sur le serveur (voir PLAN_DE_TESTS.md §6).
        'server/**/*.js': { lines: 80 },
      },
    },
  },
});
