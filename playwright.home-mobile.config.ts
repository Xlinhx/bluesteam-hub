import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';
const { channel: _channel, ...mobileUse } = base.use!;

export default defineConfig({
  ...base,
  use: mobileUse,
  testMatch: 'home-mobile-motion.spec.ts',
  projects: [
    { name: 'android-chromium', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    { name: 'iphone-webkit', use: { ...devices['iPhone 13'], channel: undefined } },
  ],
});
