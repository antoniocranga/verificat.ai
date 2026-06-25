import { test, expect } from '@playwright/test';
import { VerdictPage } from '../pages/VerdictPage';

test('Verdict page renders fixture label', async ({ page }) => {
  const verdict = new VerdictPage(page);
  await verdict.open('e2e-fixture-001');
  const label = await verdict.getVerdictLabel();
  expect(label).toBeTruthy();
});

test('Verdict page shows confidence and explanation', async ({ page }) => {
  const verdict = new VerdictPage(page);
  await verdict.open('e2e-fixture-001');
  const confidence = await verdict.getConfidence();
  const explanation = await verdict.getExplanation();
  expect(confidence).toBeTruthy();
  expect(explanation).toBeTruthy();
});
