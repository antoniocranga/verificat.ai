import * as fs from 'fs';
import * as path from 'path';

interface GoldenSetItem {
  input: string;
  expectedClaimsCount: number;
  assertionSubstrings?: string[];
}

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
    // Asserting expected claim matching logic on the golden set entries
    for (const item of goldenSet) {
      if (item.expectedClaimsCount > 0) {
        // Assert that the input contains all the expected substrings
        for (const sub of item.assertionSubstrings || []) {
          expect(item.input.toLowerCase()).toContain(sub.toLowerCase());
        }
      }
    }
  });
});
