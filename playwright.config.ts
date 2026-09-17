import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: {
    // Trailing slash + relative request paths preserve /api/v3/.
    baseURL: (process.env.BASE_URL ?? 'https://petstore3.swagger.io/api/v3').replace(/\/?$/, '/'),
    extraHTTPHeaders: { Accept: 'application/json' },
  },
});
