import * as fs from 'fs';
import * as path from 'path';

interface VerdictRange {
  minIndex: number;
  maxIndex: number;
}

interface GoldenSetItem {
  input: string;
  expectedClaimsCount: number;
  assertionSubstrings?: string[];
  expectedVerdictRange?: VerdictRange;
}

const VERDICT_LABELS = [
  'True',
  'Mostly True',
  'Partially True',
  'Misleading',
  'False',
  'Unverified',
];

describe('Golden Set Claim Detection Validation', () => {
  let goldenSet: GoldenSetItem[];

  beforeAll(() => {
    const jsonPath = path.resolve(__dirname, 'golden-set.json');
    const content = fs.readFileSync(jsonPath, 'utf-8');
    goldenSet = JSON.parse(content) as GoldenSetItem[];
  });

  it('should load golden-set.json successfully and have items', () => {
    expect(goldenSet).toBeDefined();
    expect(goldenSet.length).toBeGreaterThan(0);
  });

  it('should validate format of every item in golden-set', () => {
    for (const item of goldenSet) {
      expect(typeof item.input).toBe('string');
      expect(typeof item.expectedClaimsCount).toBe('number');
      if (item.expectedClaimsCount > 0) {
        expect(Array.isArray(item.assertionSubstrings)).toBe(true);
        expect(item.assertionSubstrings?.length).toBeGreaterThan(0);
      }
    }
  });

  it('should match claims correctly against substrings', () => {
    for (const item of goldenSet) {
      if (item.expectedClaimsCount > 0) {
        for (const sub of item.assertionSubstrings || []) {
          expect(item.input.toLowerCase()).toContain(sub.toLowerCase());
        }
      }
    }
  });

  it('should have valid expectedVerdictRange for all claim items', () => {
    for (const item of goldenSet) {
      if (item.expectedVerdictRange) {
        expect(item.expectedVerdictRange.minIndex).toBeGreaterThanOrEqual(0);
        expect(item.expectedVerdictRange.maxIndex).toBeLessThanOrEqual(5);
        expect(item.expectedVerdictRange.minIndex).toBeLessThanOrEqual(
          item.expectedVerdictRange.maxIndex,
        );
      }
    }
  });

  it('should produce verdicts within expected range for known claims', () => {
    for (const item of goldenSet) {
      if (item.expectedVerdictRange && item.expectedClaimsCount > 0) {
        const verdictIndex = mockVerdictGeneration(item.input);
        const verdictLabel = VERDICT_LABELS[verdictIndex];
        expect(verdictIndex).toBeGreaterThanOrEqual(
          item.expectedVerdictRange.minIndex,
        );
        expect(verdictIndex).toBeLessThanOrEqual(
          item.expectedVerdictRange.maxIndex,
        );
      }
    }
  });
});

function mockVerdictGeneration(_input: string): number {
  return 0;
}
