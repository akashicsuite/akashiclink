import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // The unit suite targets pure utilities (crypto/key helpers) that only need
    // Node APIs, so the lightweight node environment is sufficient.
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
