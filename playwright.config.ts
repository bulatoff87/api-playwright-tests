import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // Trailing slash + relative request paths preserve /api/v3/.
    baseURL: 'https://petstore3.swagger.io/api/v3/',
    extraHTTPHeaders: { Accept: 'application/json' },
  },
});
