import { defineConfig } from '@playwright/test';
import shared from './playwright.config';

// Keep profile evidence bound to the current checkout, independently of Docker on 3010.
const servers = Array.isArray(shared.webServer) ? shared.webServer : [];
export default defineConfig({
  ...shared,
  testMatch: ['profile-collection.spec.ts', 'profile-preservation.spec.ts', 'creative-depth.spec.ts'],
  use: { ...shared.use, baseURL: 'http://127.0.0.1:3011', actionTimeout: 15000 },
  webServer: [
    servers[0],
    { command: 'npx vite --host 127.0.0.1 --port 3011 --strictPort', url: 'http://127.0.0.1:3011', reuseExistingServer: true, timeout: 60000 },
  ],
});
