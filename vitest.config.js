import { defineConfig } from 'vitest/config';

// Separate from vite.config.js because the app's Vite root is src/client,
// while server unit tests live in tests/ at the repo root.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js']
  }
});
