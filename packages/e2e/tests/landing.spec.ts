import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingPage';

test('Landing page loads and displays heading', async ({ page }) => {
  const landing = new LandingPage(page);
  await landing.open();
  const heading = await landing.getHeading();
  expect(heading).toBeTruthy();
});
