import { BasePage } from './BasePage';

export class VerdictPage extends BasePage {
  async open(verdictId: string) {
    await this.goto(`/check/${verdictId}`);
    await this.waitForLoad();
  }

  async getVerdictLabel() {
    return this.page.textContent('[data-testid="verdict-label"]');
  }

  async getConfidence() {
    return this.page.textContent('[data-testid="verdict-confidence"]');
  }

  async getExplanation() {
    return this.page.textContent('[data-testid="verdict-explanation"]');
  }

  async getSourceCount() {
    return this.page.locator('[data-testid="source-item"]').count();
  }
}
