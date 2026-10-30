import { defineConfig } from '@playwright/test';
import config from './playwright.config';

// Docker must already be running. Never fall back to a separate Vite/API process.
export default defineConfig({
  ...config,
  webServer: [],
  use: { ...config.use, baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3010' },
});
