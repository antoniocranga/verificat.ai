import { test, expect } from '@playwright/test';
import { VerdictPage } from '../pages/VerdictPage';

test('Verdict page renders fixture label', async ({ page }) => {
  const verdict = new VerdictPage(page);
  await verdict.open('e2e00000-0000-0000-0000-000000000003');
  const label = await verdict.getVerdictLabel();
  expect(label).toBeTruthy();
});

test('Verdict page shows confidence and explanation', async ({ page }) => {
  const verdict = new VerdictPage(page);
  await verdict.open('e2e00000-0000-0000-0000-000000000003');
  const confidence = await verdict.getConfidence();
  const explanation = await verdict.getExplanation();
  expect(confidence).toBeTruthy();
  expect(explanation).toBeTruthy();
});
