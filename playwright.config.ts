import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 180_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3010',
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  webServer: [
    {
      command: 'npm --workspace @bluesteam/server run start',
      url: 'http://127.0.0.1:8010/api/v1/health/live',
      reuseExistingServer: true,
      timeout: 60_000,
      env: {
        API_PORT: '8010',
        DATABASE_URL:
          process.env.DATABASE_URL ||
          'postgresql://bluesteam:bluesteam_dev_local@127.0.0.1:5442/bluesteam',
        JWT_SECRET: process.env.JWT_SECRET || 'bluesteam-dev-jwt-secret-change-in-production',
        SEED_TEACHER_PASSWORD: process.env.SEED_TEACHER_PASSWORD || 'daiduong2026',
      },
    },
    {
      command: 'npx vite --host 127.0.0.1 --port 3010 --strictPort',
      url: 'http://127.0.0.1:3010',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});
