import { defineConfig, devices } from '@playwright/test';
import config from './playwright.docker.config';

const { channel: _chromiumChannel, ...browserIndependentUse } = config.use || {};
const sourceFixtures=process.env.PLAYWRIGHT_SOURCE_FIXTURES==='1';
const sourceCases=/profile uses actual artwork|closing an unfinished|loading more artworks/;
export default defineConfig({
  ...config,
  use: browserIndependentUse,
  testMatch: ['resource-mobile-browser.spec.ts', 'resource-mobile-layout.spec.ts', 'resource-mobile-motion.spec.ts', 'resource-profile-states.spec.ts', 'resource-profile-motion.spec.ts'],
  // The raw CDP touch-stream case is verified separately in Chromium.
  grep: sourceFixtures ? sourceCases : undefined,
  grepInvert: sourceFixtures ? /dialog taps activate once/ : /dialog taps activate once|profile uses actual artwork|closing an unfinished|loading more artworks/,
  projects: [{ name: 'mobile-webkit', use: {
    ...devices['iPhone 13'], browserName: 'webkit',
    // Exercise native snapshots with the Windows compositor enabled.
    launchOptions: process.platform==='win32' ? {ignoreDefaultArgs:['--disable-accelerated-compositing']} : {},
  } }],
});
